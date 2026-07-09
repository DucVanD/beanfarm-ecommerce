package com.example.backend.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.backend.config.GeminiConfig;
import com.example.backend.dto.ChatMessageDto;
import com.example.backend.dto.ChatResponse;
import com.example.backend.dto.ProductDto;
import com.example.backend.entity.Product;
import com.example.backend.repository.ProductRepository;
import com.example.backend.service.AiChatService;
import com.example.backend.service.ContactService;
import com.example.backend.entity.Contact;
import com.example.backend.entity.enums.ContactStatus;
import com.example.backend.entity.enums.ContactType;
import com.example.backend.entity.Order;
import com.example.backend.entity.User;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ContactRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GeminiServiceImpl implements AiChatService {

    private final GeminiConfig geminiConfig;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ContactRepository contactRepository;
    private final ContactService contactService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String systemInstruction = "Bạn là trợ lý AI thông minh của 'Siêu Thị Mini'.\n" +
            "QUY TẮC CỐT LÕI (FACTS-ONLY):\n" +
            "1. KHÔNG tự bịa đặt ngày giao hàng dự kiến (ETA). Chỉ báo trạng thái thực tế từ hệ thống (PENDING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED).\n"
            +
            "2. Nếu hệ thống chưa có ETA, hãy trả lời: 'Hiện chưa có thời gian dự kiến chính xác, tôi đã tạo yêu cầu để nhân viên báo lại cho bạn sớm nhất'.\n"
            +
            "3. HÌNH ẢNH & CHI TIẾT: Khi bạn tìm thấy sản phẩm thông qua công cụ tìm kiếm, hệ thống sẽ TỰ ĐỘNG hiển thị thẻ sản phẩm (Product Card) có chứa HÌNH ẢNH, GIÁ và nút 'XEM CHI TIẾT' ngay bên dưới tin nhắn của bạn.\n"
            +
            "   - Vì vậy, hãy nói kiểu: 'Tôi tìm thấy sản phẩm X, bạn có thể xem hình ảnh và chi tiết ở các thẻ bên dưới nhé'.\n"
            +
            "   - ĐỪNG BAO GIỜ nói 'tôi không thể hiển thị hình ảnh' hoặc 'tôi chỉ cung cấp thông tin văn bản'.\n" +
            "4. QUY TRÌNH HỖ TRỢ CHI TIẾT:\n" +
            "   - Đơn PENDING/CONFIRMED: 'Đơn hàng [Mã đơn] hiện ở trạng thái [Status]. Bạn có thể gửi yêu cầu thay đổi địa chỉ để nhân viên kiểm tra. Lưu ý: Thay đổi cần được nhân viên xác nhận và có thể không thực hiện được nếu đơn đã đóng gói'.\n"
            +
            "     TRÁNH DƯ THỪA: Không hỏi lại Tên/SĐT nếu đã có thông tin đơn hàng. Chỉ hỏi thông tin mới (vd: địa chỉ mới chi tiết).\n"
            +
            "   - Đơn SHIPPING/COMPLETED: Giải thích lý do không thể thay đổi trực tiếp và hướng dẫn quy trình khiếu nại (bắt buộc nhắc chuẩn bị video mở hàng cho đơn đã hoàn thành).\n"
            +
            "5. ANTI-SPAM & SLA: Thông báo rõ 'Nhân viên sẽ phản hồi trong giờ hành chính (8:00 - 18:00)' và không tạo ticket trùng.\n"
            +
            "6. DATA CONSISTENCY: Luôn ưu tiên dùng thông tin (Tên/SĐT) từ Đơn hàng để tạo Ticket hỗ trợ, không để khách nhập số khác gây rủi ro giả mạo.";

    @Override
    public ChatResponse chat(String message, List<ChatMessageDto> history) throws Exception {

        // Build request with function declarations and history
        Map<String, Object> request = buildGeminiRequest(message, history);

        // LẤY API KEY 1 LẦN DUY NHẤT
        String apiKey = geminiConfig.getApiKey();

        // LOG 4 KÝ TỰ CUỐI (AN TOÀN)
        System.out.println(">>> Gemini key suffix: " +
                (apiKey == null || apiKey.length() < 4
                        ? "NULL/SHORT"
                        : apiKey.substring(apiKey.length() - 4)));

        // Build URL
        String url = geminiConfig.getApiUrl() + "?key=" + apiKey;

        System.out.println(">>> Calling Gemini API: " + geminiConfig.getModel());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        int maxRetries = 5;
        int retryCount = 0;
        long waitTime = 3000; // 3 seconds

        while (true) {
            try {
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

                ResponseEntity<String> response = restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        entity,
                        String.class);

                if (response.getStatusCode().is2xxSuccessful()) {
                    return parseGeminiResponse(response.getBody());
                } else {
                    throw new Exception(
                            "Gemini API returned error: " + response.getStatusCode());
                }

            } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
                retryCount++;
                if (retryCount > maxRetries) {
                    throw new Exception(
                            "Hệ thống AI đang bận, vui lòng thử lại sau.");
                }

                System.out.println(
                        ">>> Gemini Rate Limit (429). Retrying in "
                                + waitTime + "ms (attempt " + retryCount + ")");
                Thread.sleep(waitTime);
                waitTime *= 2;

            } catch (org.springframework.web.client.HttpClientErrorException e) {
                String errorBody = e.getResponseBodyAsString();
                System.err.println(">>> Gemini API Error (" + e.getStatusCode() + "): " + errorBody);
                throw new Exception("Lỗi từ Gemini AI: " + e.getStatusCode() + ". Chi tiết: " + errorBody);

            } catch (Exception e) {
                System.err.println(">>> System Error: " + e.getMessage());
                throw e;
            }
        }
    }

    private Map<String, Object> buildGeminiRequest(String message, List<ChatMessageDto> history) {
        Map<String, Object> request = new HashMap<>();

        // System instruction
        request.put("system_instruction", Map.of("parts", List.of(Map.of("text", systemInstruction))));

        // Conversation History + User Message
        List<Map<String, Object>> contents = new ArrayList<>();

        if (history != null) {
            boolean firstMessageAdded = false;
            for (ChatMessageDto msg : history) {
                // 👉 QUY TẮC GEMINI: Tin nhắn đầu tiên LUÔN phải là 'user'
                if (!firstMessageAdded && "model".equalsIgnoreCase(msg.getRole())) {
                    System.out.println(">>> Skipping leading 'model' message in history to avoid 400 error.");
                    continue;
                }

                Map<String, Object> content = new HashMap<>();
                content.put("role", msg.getRole());
                content.put("parts", List.of(Map.of("text", msg.getContent())));
                contents.add(content);
                firstMessageAdded = true;
            }
        }

        // Current User message
        Map<String, Object> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("parts", List.of(Map.of("text", message)));
        contents.add(userMessage);

        request.put("contents", contents);

        // Function declarations
        request.put("tools", List.of(Map.of("function_declarations", getFunctionDeclarations())));

        return request;
    }

    private List<Map<String, Object>> getFunctionDeclarations() {
        List<Map<String, Object>> functions = new ArrayList<>();

        // Function 1: Search Products
        Map<String, Object> searchProducts = new HashMap<>();
        searchProducts.put("name", "searchProducts");
        searchProducts.put("description", "Tìm kiếm sản phẩm theo từ khóa, danh mục, khoảng giá");

        Map<String, Object> searchParams = new HashMap<>();
        searchParams.put("type", "object");
        Map<String, Object> properties = new HashMap<>();
        properties.put("query", Map.of("type", "string", "description", "Từ khóa tìm kiếm (tên sản phẩm)"));
        properties.put("minPrice", Map.of("type", "number", "description", "Giá tối thiểu"));
        properties.put("maxPrice", Map.of("type", "number", "description", "Giá tối đa"));
        searchParams.put("properties", properties);
        searchProducts.put("parameters", searchParams);
        functions.add(searchProducts);

        // Function 2: Get Product Details
        Map<String, Object> getProduct = new HashMap<>();
        getProduct.put("name", "getProductDetails");
        getProduct.put("description", "Lấy thông tin chi tiết của một sản phẩm");
        Map<String, Object> productParams = new HashMap<>();
        productParams.put("type", "object");
        productParams.put("properties",
                Map.of("productId", Map.of("type", "integer", "description", "ID của sản phẩm")));
        productParams.put("required", List.of("productId"));
        getProduct.put("parameters", productParams);
        functions.add(getProduct);

        // Function 3: Create Support Request
        Map<String, Object> supportRequest = new HashMap<>();
        supportRequest.put("name", "createSupportRequest");
        supportRequest.put("description", "Tạo yêu cầu liên hệ hoặc lời nhắn cho Admin gắn với đơn hàng");

        Map<String, Object> supportParams = new HashMap<>();
        supportParams.put("type", "object");

        Map<String, Object> supportProps = new HashMap<>();
        supportProps.put("name",
                Map.of("type", "string", "description", "Tên khách hàng (Chỉ cần nếu không có mã đơn)"));
        supportProps.put("phone",
                Map.of("type", "string", "description", "Số điện thoại liên hệ (Chỉ cần nếu không có mã đơn)"));
        supportProps.put("email",
                Map.of("type", "string", "description", "Email liên hệ (Chỉ cần nếu không có mã đơn)"));
        supportProps.put("orderCode",
                Map.of("type", "string", "description", "Mã đơn hàng cần hỗ trợ (vd: ORD-2026...)"));
        supportProps.put("type",
                Map.of("type", "string", "description", "Loại yêu cầu: CANCEL, CHANGE_ADDRESS, PRODUCT_ISSUE, OTHER"));
        supportProps.put("content", Map.of("type", "string", "description", "Nội dung lời nhắn chi tiết"));

        supportParams.put("properties", supportProps);
        supportParams.put("required", List.of("orderCode", "type", "content"));
        supportRequest.put("parameters", supportParams);
        functions.add(supportRequest);

        // Function 4: Get Order Status
        Map<String, Object> getOrder = new HashMap<>();
        getOrder.put("name", "getOrderStatus");
        getOrder.put("description", "Lấy thông tin trạng thái thực tế của đơn hàng");
        Map<String, Object> orderParams = new HashMap<>();
        orderParams.put("type", "object");
        orderParams.put("properties",
                Map.of("orderCode", Map.of("type", "string", "description", "Mã đơn hàng (vd: ORD-2026...)")));
        orderParams.put("required", List.of("orderCode"));
        getOrder.put("parameters", orderParams);
        functions.add(getOrder);

        return functions;
    }

    private ChatResponse parseGeminiResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode candidates = root.get("candidates");

        if (candidates == null || candidates.isEmpty()) {
            return new ChatResponse("Xin lỗi, tôi không thể trả lời câu hỏi này.");
        }

        JsonNode firstCandidate = candidates.get(0);
        JsonNode content = firstCandidate.get("content");
        JsonNode parts = content.get("parts");

        if (parts == null || parts.isEmpty()) {
            return new ChatResponse("Xin lỗi, tôi không thể trả lời câu hỏi này.");
        }

        JsonNode firstPart = parts.get(0);

        // Check if it's a function call
        if (firstPart.has("functionCall")) {
            return handleFunctionCall(firstPart.get("functionCall"));
        }

        // Regular text response
        String text = firstPart.get("text").asText();
        return new ChatResponse(text);
    }

    private ChatResponse handleFunctionCall(JsonNode functionCall) throws Exception {
        try {
            String functionName = functionCall.get("name").asText();
            JsonNode args = functionCall.get("args");

            switch (functionName) {
                case "searchProducts":
                    return handleSearchProducts(args);
                case "getProductDetails":
                    return handleGetProductDetails(args);
                case "createSupportRequest":
                    return handleCreateSupportRequest(args);
                case "getOrderStatus":
                    return handleGetOrderStatus(args);
                default:
                    return new ChatResponse("Xin lỗi, tôi không thể thực hiện yêu cầu này.");
            }
        } catch (Exception e) {
            return new ChatResponse("Có lỗi xảy ra khi xử lý yêu cầu của bạn.");
        }
    }

    @Transactional
    private ChatResponse handleCreateSupportRequest(JsonNode args) {
        try {
            String name = args.has("name") ? args.get("name").asText() : "";
            String phone = args.has("phone") ? args.get("phone").asText() : "";
            String email = args.has("email") ? args.get("email").asText() : "";
            String orderCodeFromArgs = args.has("orderCode") ? args.get("orderCode").asText() : null;
            String typeStr = args.has("type") ? args.get("type").asText() : "OTHER";
            String content = args.has("content") ? args.get("content").asText() : "";

            Integer actualOrderId = null;
            User orderUser = null;
            if (orderCodeFromArgs != null && !orderCodeFromArgs.isEmpty()) {
                Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCodeFromArgs);
                if (orderOpt.isPresent()) {
                    Order order = orderOpt.get();
                    actualOrderId = order.getId();
                    orderUser = order.getUser();

                    // DATA CONSISTENCY: Use info from Order instead of user input
                    name = order.getReceiverName();
                    phone = order.getReceiverPhone();
                    email = (order.getReceiverEmail() != null && !order.getReceiverEmail().isEmpty())
                            ? order.getReceiverEmail()
                            : (orderUser != null ? orderUser.getEmail() : "");
                } else {
                    return new ChatResponse("Không tìm thấy đơn hàng với mã: " + orderCodeFromArgs
                            + ". Vui lòng kiểm tra lại mã đơn hàng.");
                }
            }

            if (email == null || email.isEmpty()) {
                return new ChatResponse(
                        "Chúng tôi không tìm thấy địa chỉ email để liên hệ. Vui lòng cung cấp email của bạn.");
            }

            ContactType type = ContactType.GENERAL;
            try {
                type = ContactType.valueOf(typeStr);
            } catch (Exception e) {
                // Default to GENERAL if invalid
            }

            // DEDUPLICATION: Check for existing OPEN ticket for this order and type
            if (actualOrderId != null) {
                Optional<Contact> existing = contactRepository.findByOrderIdAndTypeAndStatus(actualOrderId, type,
                        ContactStatus.OPEN);
                if (existing.isPresent()) {
                    return new ChatResponse("Yêu cầu (" + typeStr
                            + ") cho đơn hàng này của bạn đã được ghi nhận trước đó và đang được xử lý. Vui lòng không gửi thêm yêu cầu trùng lặp.");
                }
            }

            Contact contact = Contact.builder()
                    .name(name)
                    .phone(phone)
                    .email(email)
                    .orderId(actualOrderId)
                    .user(orderUser)
                    .type(type)
                    .title("Hỗ trợ đơn hàng " + (orderCodeFromArgs != null ? orderCodeFromArgs : ""))
                    .content(content)
                    .status(ContactStatus.OPEN)
                    .build();

            contactService.saveContact(contact);
            return new ChatResponse(
                    "Yêu cầu hỗ trợ của bạn đã được tiếp nhận thành công. \n\n" +
                            "⚠️ Lưu ý: Đây là yêu cầu đang chờ xử lý, đơn hàng chỉ được thay đổi sau khi nhân viên xác nhận thành công. \n\n"
                            +
                            "Nhân viên sẽ kiểm tra và phản hồi cho bạn trong giờ hành chính (8:00 - 18:00). Cảm ơn bạn!");
        } catch (Exception e) {
            return new ChatResponse("Xin lỗi, tôi không thể lưu yêu cầu lúc này. Vui lòng thử lại sau.");
        }
    }

    private ChatResponse handleGetOrderStatus(JsonNode args) {
        try {
            String orderCode = args.get("orderCode").asText();
            Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode);

            if (orderOpt.isEmpty()) {
                return new ChatResponse("Không tìm thấy đơn hàng với mã: " + orderCode);
            }

            Order order = orderOpt.get();
            String res = String.format(
                    "Thông tin đơn hàng #%s:\n- Trạng thái: **%s**\n- Địa chỉ: %s\n- Tổng tiền: %s\n- Ngày tạo: %s",
                    order.getOrderCode(),
                    order.getStatus(),
                    order.getReceiverAddress(),
                    formatPrice(order.getTotalAmount()),
                    order.getCreatedAt().toString());

            return new ChatResponse(res);
        } catch (Exception e) {
            return new ChatResponse("Có lỗi khi tra cứu trạng thái đơn hàng.");
        }
    }

    private ChatResponse handleSearchProducts(JsonNode args) {
        String query = args.has("query") ? args.get("query").asText().trim() : "";
        BigDecimal minPrice = args.has("minPrice") ? BigDecimal.valueOf(args.get("minPrice").asDouble()) : null;
        BigDecimal maxPrice = args.has("maxPrice") ? BigDecimal.valueOf(args.get("maxPrice").asDouble()) : null;

        // Xử lý từ khóa "tất cả", "all", "danh sách" -> hiển thị tất cả sản phẩm
        boolean showAll = query.isEmpty() ||
                query.equalsIgnoreCase("tất cả") ||
                query.equalsIgnoreCase("tat ca") ||
                query.equalsIgnoreCase("all") ||
                query.equalsIgnoreCase("danh sách") ||
                query.equalsIgnoreCase("danh sach");

        String searchQuery = showAll ? "" : query;
        int limit = showAll ? 10 : 5;

        List<Product> products = productRepository.searchForAi(
                searchQuery,
                minPrice,
                maxPrice,
                PageRequest.of(0, limit));

        if (products.isEmpty()) {
            return new ChatResponse(
                    "Không tìm thấy sản phẩm phù hợp. Bạn có thể thử tìm kiếm với từ khóa khác nhé! 😊");
        }

        List<ProductDto> productDtos = products.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        // Build message
        StringBuilder message = new StringBuilder();

        if (products.size() == 1) {
            message.append(String.format(
                    "Tôi đã tìm thấy sản phẩm **%s** cho bạn. Bạn có thể xem hình ảnh và chi tiết ở thẻ bên dưới nhé! 🛒",
                    products.get(0).getName()));
        } else {
            if (showAll) {
                message.append(String.format("Đây là danh sách %d sản phẩm hiện có:\\n\\n", products.size()));
            } else {
                message.append(String.format("Tôi tìm thấy %d sản phẩm phù hợp cho bạn:\\n\\n", products.size()));
            }

            for (int i = 0; i < products.size(); i++) {
                Product p = products.get(i);
                String priceStr = formatPrice(p.getSalePrice());
                if (p.getDiscountPrice() != null && p.getDiscountPrice().compareTo(p.getSalePrice()) < 0) {
                    priceStr = String.format("%s (Giảm còn %s)", priceStr, formatPrice(p.getDiscountPrice()));
                }
                message.append(String.format("%d. **%s** - Giá: %s\\n",
                        i + 1, p.getName(), priceStr));
            }
            message.append("\\nBạn có thể xem hình ảnh và click vào thẻ sản phẩm bên dưới để xem chi tiết nhé! 🛒");
        }

        return new ChatResponse(message.toString(), productDtos);
    }

    private String formatPrice(BigDecimal price) {
        return String.format("%,d đ", price.longValue());
    }

    private ChatResponse handleGetProductDetails(JsonNode args) {
        int productId = args.get("productId").asInt();
        Optional<Product> productOpt = productRepository.findById(productId);

        if (productOpt.isEmpty()) {
            return new ChatResponse("Không tìm thấy sản phẩm với ID: " + productId);
        }

        Product product = productOpt.get();
        String priceStr = formatPrice(product.getSalePrice());
        if (product.getDiscountPrice() != null && product.getDiscountPrice().compareTo(product.getSalePrice()) < 0) {
            priceStr = String.format("%s (Khuyến mãi chỉ còn %s)", priceStr, formatPrice(product.getDiscountPrice()));
        }

        String message = String.format(
                "Tôi đã lấy được thông tin chi tiết của sản phẩm **%s**. Bạn có thể xem hình ảnh và mô tả đầy đủ ở phần thẻ bên dưới nhé!\n\n"
                        +
                        " **Thông tin tóm tắt:**\n" +
                        "- **Giá:** %s\n" +
                        "- **Tồn kho:** %d sản phẩm\n" +
                        "- **Mô tả:** %s",
                product.getName(),
                priceStr,
                product.getQty(),
                product.getDetail() != null ? product.getDetail() : "Chưa có mô tả");

        return new ChatResponse(message, List.of(convertToDto(product)));
    }

    private ProductDto convertToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setSlug(product.getSlug());
        dto.setSalePrice(product.getSalePrice());
        dto.setDiscountPrice(product.getDiscountPrice());
        dto.setImage(product.getImage());
        dto.setQty(product.getQty());
        return dto;
    }
}

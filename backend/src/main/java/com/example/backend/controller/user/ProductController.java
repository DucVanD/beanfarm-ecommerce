package com.example.backend.controller.user;

import com.example.backend.dto.ProductDto;
import com.example.backend.dto.CategoryHomeDto;
import com.example.backend.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

import java.math.BigDecimal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<Page<ProductDto>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(productService.getPage(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ProductDto> create(@RequestBody ProductDto dto) {
        return ResponseEntity.ok(productService.create(dto)); 
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ProductDto> update(
            @PathVariable Integer id,
            @RequestBody ProductDto dto) {
        return ResponseEntity.ok(productService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductDto>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(productService.search(keyword, page, size));
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<ProductDto>> filter(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<Integer> categoryId,
            @RequestParam(required = false) List<Integer> brandId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean hasPromotion,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity
                .ok(productService.filter(keyword, categoryId, brandId, status, minPrice, maxPrice, hasPromotion,
                        sortBy, page,
                        size));
    }

    // ✅ HATEOAS
    @GetMapping("/{id}/hateoas")
    public EntityModel<ProductDto> getByIdHateoas(@PathVariable Integer id) {

        ProductDto dto = productService.getById(id);
        if (dto == null) {
            throw new RuntimeException("Product not found with id: " + id);
        }

        return EntityModel.of(dto,
                linkTo(methodOn(ProductController.class).getById(id)).withSelfRel(),
                linkTo(methodOn(ProductController.class).update(id, dto)).withRel("update"),
                linkTo(methodOn(ProductController.class).delete(id)).withRel("delete"),
                linkTo(methodOn(ProductController.class).getAll(0, 12)).withRel("all"));
    }

    @GetMapping("/latest")
    public List<ProductDto> getLatestProducts(@RequestParam(defaultValue = "6") int limit) {
        return productService.getLatestProducts(limit);
    }

    @GetMapping("slug/{slug}")
    public ResponseEntity<ProductDto> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getBySlug(slug));
    }

    @GetMapping("/home-categories")
    public List<CategoryHomeDto> getHomeCategories() {
        return productService.getCategoriesHome();
    }

    @GetMapping("/{id}/related")
    public List<ProductDto> getRelatedProducts(
            @PathVariable Integer id,
            @RequestParam Integer categoryId,
            @RequestParam(defaultValue = "4") int limit) {
        return productService.getRelatedProducts(categoryId, id, limit);
    }

}

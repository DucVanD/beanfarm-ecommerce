
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaClock, FaPhone, FaEnvelope, FaPaperPlane, FaCopy, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import apiContact from "../../api/user/apiContact";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    content: ""
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [ticketCode, setTicketCode] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCopyTicketCode = () => {
    navigator.clipboard.writeText(ticketCode);
    toast.success("Đã copy mã yêu cầu!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiContact.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        title: formData.title || "Liên hệ chung",
        content: formData.content,
        type: "GENERAL",
        priority: "NORMAL"
      });

      // Lấy ticket code từ response
      setTicketCode(response.data.ticketCode);
      setShowSuccessModal(true);

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        title: "",
        content: ""
      });
    } catch (error) {
      console.error("Error submitting contact:", error);
      toast.error("Gửi yêu cầu thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-green-600">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 font-semibold">Liên hệ</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Contact Info & Form */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                NƠI GIẢI ĐÁP TOÀN BỘ MỌI THẮC MẮC CỦA BẠN?
              </h1>
              <p className="text-gray-600 mb-6">
                Bean Farm - Siêu thị trực tuyến mua sắm nông sản, chất lượng, tươi xanh.{" "}
                <span className="font-bold text-green-600">Giá siêu tốt - Giao siêu tốc.</span>
              </p>

              {/* Contact Details */}
              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <FaMapMarkerAlt className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Địa chỉ</h3>
                    <p className="text-gray-600">123 Đường Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh</p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <FaClock className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Thời gian làm việc</h3>
                    <p className="text-gray-600">8h - 22h từ thứ 2 đến chủ nhật</p>
                  </div>
                </div>

                {/* Hotline */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <FaPhone className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Hotline</h3>
                    <p className="text-gray-600">1900 6750</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <FaEnvelope className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                    <p className="text-gray-600">support@beanfarm.vn</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                LIÊN HỆ VỚI CHÚNG TÔI
              </h2>
              <p className="text-gray-600 mb-6">
                Nếu bạn có thắc mắc gì, có thể gửi yêu cầu cho chúng tôi, và chúng tôi sẽ liên lạc lại với bạn sớm nhất có thể.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề <span className="text-gray-400 text-xs">(Tùy chọn)</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nhập tiêu đề (nếu có)"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nhập email"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Nội dung
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows={5}
                    required
                    value={formData.content}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Nhập nội dung tin nhắn..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Gửi thông tin
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Google Map */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-96 lg:h-[600px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.669658423711!2d106.679803875838!3d10.759920059495758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f1b888ab257%3A0xd556ed7bc73ca591!2s123%20%C4%90%C6%B0%E1%BB%9Dng%20Nguy%E1%BB%85n%20V%C4%83n%20C%E1%BB%AF%2C%20Ph%C6%B0%E1%BB%9Dng%202%2C%20Qu%E1%BA%ADn%205%2C%20Th%C3%A0nh%20ph%E1%BB%91%20H%E1%BB%93%20Ch%C3%AD%20Minh!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bean Farm Location"
                ></iframe>
              </div>

              {/* Map Info Card */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Bean Farm - Siêu thị nông sản
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      123 Đường Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="text-yellow-500">★★★★★</span>
                        <span>4.8 (156 đánh giá)</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <a
                    href="https://maps.google.com/?q=123+Đường+Nguyễn+Văn+Cừ,+Quận+5,+TP.+Hồ+Chí+Minh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-center text-sm hover:bg-blue-700 transition-colors"
                  >
                    Chỉ đường
                  </a>
                  <a
                    href="https://maps.google.com/?q=123+Đường+Nguyễn+Văn+Cừ,+Quận+5,+TP.+Hồ+Chí+Minh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md text-center text-sm hover:bg-gray-200 transition-colors"
                  >
                    Xem bản đồ lớn hơn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fadeIn backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white text-center">
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-green-500 text-4xl" />
                </div>
              </div>
              <h3 className="text-2xl font-bold">Gửi yêu cầu thành công!</h3>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-gray-700 text-center">
                Yêu cầu hỗ trợ của bạn đã được tiếp nhận thành công.
              </p>

              {/* Ticket Code Display */}
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
                <p className="text-sm text-gray-600 text-center mb-2 font-medium">
                  Mã yêu cầu của bạn:
                </p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-2xl font-bold text-green-600 font-mono">
                    {ticketCode}
                  </code>
                  <button
                    onClick={handleCopyTicketCode}
                    className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                    title="Copy mã"
                  >
                    <FaCopy className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>
                    <strong>Lưu ý:</strong> Đây là yêu cầu đang chờ xử lý, đơn hàng chỉ được thay đổi sau khi nhân viên xác nhận thành công.
                  </span>
                </p>
              </div>

              {/* Info */}
              <div className="text-center text-sm text-gray-600 space-y-1">
                <p>
                  Nhân viên sẽ kiểm tra và phản hồi cho bạn trong giờ hành chính{" "}
                  <strong className="text-gray-800">(8:00 – 18:00)</strong>.
                </p>
                <p className="text-gray-500 italic">
                  Cảm ơn bạn đã liên hệ!
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 flex justify-center">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Contact;
import React, { useState, useEffect } from "react";
import {
  FaComments,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaTimes,
  FaChevronUp,
  FaFacebookMessenger,
  FaFacebook,
  FaYoutube,
  FaInstagram
} from "react-icons/fa";
import { SiZalo } from "react-icons/si";

const FooterUser = () => {
  const [showButton, setShowButton] = useState(false);      // Trạng thái nút Scroll Top
  const [showContactMenu, setShowContactMenu] = useState(false); // Trạng thái Menu Liên hệ

  // 1. Xử lý sự kiện cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Hàm cuộn lên đầu trang mượt mà
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* ================= FOOTER CONTENT ================= */}
      <footer className="mt-12 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Cột 1: Thông tin thương hiệu */}
          <div>
            <div className="flex items-center gap-2">
              {/* Logo - Hãy thay đường dẫn ảnh logo của bạn vào đây */}
              <img
                src="/src/assets/images/logo.png"
                alt="Bean Farm Logo"
                className="h-10 w-auto object-contain"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }}
              />
              <span className="text-2xl font-bold text-emerald-700 hidden">Bean Farm</span>
            </div>

            <p className="mt-4 text-gray-600 text-sm leading-relaxed hidden md:block">
              Bean Farm - Siêu thị trực tuyến mua sắm nông sản, chất lượng, tươi xanh.
              <span className="block font-medium text-emerald-600 mt-1">Giá siêu tốt - Giao siêu tốc.</span>
            </p>

            <div className="mt-5 space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-bold text-gray-800">Địa chỉ:</span> 123 Đường Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh
              </p>
              <p>
                <span className="font-bold text-gray-800">Hotline:</span>{" "}
                <a href="tel:19006750" className="text-emerald-700 font-bold hover:underline">1900 6750</a>
              </p>
              <p>
                <span className="font-bold text-gray-800">Email:</span>{" "}
                <a href="mailto:support@beanfarm.vn" className="text-emerald-700 font-bold hover:underline">support@beanfarm.vn</a>
              </p>
            </div>
          </div>

          {/* Cột 2: Chính sách (Hiển thị full trên mobile) */}
          <div>
            <h4 className="font-bold text-gray-800 text-lg mb-4 border-l-4 border-emerald-500 pl-3">
              Chính sách
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              {["Chính sách thành viên", "Chính sách thanh toán", "Chính sách đổi trả", "Bảo mật thông tin cá nhân"].map((item, i) => (
                <li key={i}>
                  <a href="#" className="hover:text-emerald-600 hover:translate-x-1 transition-all inline-block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Hướng dẫn (Ẩn trên mobile) */}
          <div className="hidden md:block">
            <h4 className="font-bold text-gray-800 text-lg mb-4 border-l-4 border-emerald-500 pl-3">
              Hướng dẫn
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              {["Hướng dẫn mua hàng", "Vận chuyển & Giao nhận", "Phương thức thanh toán", "Câu hỏi thường gặp (FAQ)"].map((item, i) => (
                <li key={i}>
                  <a href="#" className="hover:text-emerald-600 hover:translate-x-1 transition-all inline-block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Kết nối & Mạng xã hội */}
          <div>
            <h4 className="font-bold text-gray-800 text-lg mb-4 border-l-4 border-emerald-500 pl-3">
              Kết nối với chúng tôi
            </h4>
            <div className="flex gap-3 mb-6">
              <a href="#" className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition shadow-sm">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:scale-110 transition shadow-sm">
                <FaYoutube size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white flex items-center justify-center hover:scale-110 transition shadow-sm">
                <FaInstagram size={20} />
              </a>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 hidden md:flex items-center gap-3">
              <div className="bg-white border p-1 rounded">
                {/* Placeholder QR Code */}
                <div className="w-12 h-12 bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">QR CODE</div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-700">Zalo Mini App</p>
                <p className="text-[10px] text-gray-500">Quét mã để nhận ưu đãi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="bg-emerald-800 text-white/90 py-4 text-center text-sm border-t border-emerald-900">
          <div className="max-w-7xl mx-auto px-4">
            © 2026 Bean Farm. All rights reserved. | Thiết kế và phát triển bởi <span className="font-bold text-white">Bean Farm Team</span>
          </div>
        </div>
      </footer>


      {/* ================= FLOATING ACTION BUTTONS (NÚT NỔI) ================= */}
      <div className="fixed bottom-6 right-6 flex flex-col items-center gap-4 z-50">

        {/* 1. Nút Scroll Top (Chỉ hiện khi cuộn xuống) */}
        {showButton && (
          <button
            onClick={scrollToTop}
            className="w-10 h-10 bg-gray-600/50 hover:bg-emerald-600 backdrop-blur-sm text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1"
            title="Lên đầu trang"
          >
            <FaChevronUp size={16} />
          </button>
        )}

        {/* 2. Cụm Nút Liên Hệ Đa Năng */}
        <div className="relative group">

          {/* Menu Popup (Hiện ra khi state showContactMenu = true) */}
          <div
            className={`absolute bottom-full right-0 mb-4 w-60 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 origin-bottom-right 
            ${showContactMenu ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-90 translate-y-4 invisible pointer-events-none'}`}
          >
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold text-center border-b border-emerald-100">
              HỖ TRỢ TRỰC TUYẾN 24/7
            </div>

            <ul className="flex flex-col">
              {/* Chat với AI */}
              <li>
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openChatbot'));
                    setShowContactMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition border-b border-emerald-50 group/item text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md group-hover/item:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Mới ✨</span>
                    <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Chat với trợ lý AI</span>
                  </div>
                </button>
              </li>


              {/* Gọi Hotline */}
              <li>
                <a href="tel:19006750" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 group/item">
                  <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform">
                    <FaPhoneAlt size={14} />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Hotline</span>
                    <span className="text-sm font-bold text-gray-700">1900 6750</span>
                  </div>
                </a>
              </li>

              {/* Chat Zalo */}
              <li>
                <a href="https://zalo.me/YOUR_ZALO_ID" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 group/item">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform">
                    <SiZalo size={16} />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Chat Zalo</span>
                    <span className="text-sm font-medium text-gray-700">Bean Farm Support</span>
                  </div>
                </a>
              </li>

              {/* Chat Messenger */}
              <li>
                <a href="https://m.me/YOUR_PAGE_ID" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 group/item">
                  <div className="w-8 h-8 rounded-full bg-[#0084FF] text-white flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform">
                    <FaFacebookMessenger size={18} />
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Facebook</span>
                    <span className="text-sm font-medium text-gray-700">Chat Messenger</span>
                  </div>
                </a>
              </li>

              {/* Tìm cửa hàng */}
              <li>
                <a href="/contact" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group/item">
                  <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center shadow-sm group-hover/item:scale-110 transition-transform">
                    <FaMapMarkerAlt size={14} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Tìm cửa hàng</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Nút Toggle Chính (Tròn to) */}
          <button
            onClick={() => setShowContactMenu(!showContactMenu)}
            className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 relative z-50
              ${showContactMenu ? 'bg-gray-600 rotate-90 hover:bg-gray-700' : 'bg-emerald-600 hover:bg-emerald-700 animate-bounce'}`}
            title="Liên hệ với chúng tôi"
          >
            {showContactMenu ? <FaTimes size={24} /> : <FaComments size={26} />}

            {/* Chấm đỏ thông báo (Ping animation) */}
            {!showContactMenu && (
              <span className="absolute top-0 right-0 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
              </span>
            )}
          </button>
        </div>

      </div>
    </>
  );
};

export default FooterUser;
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiChat from '../api/apiChat';
import { getImageUrl } from '../api/config';
import '../styles/chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'model',
            content: 'Xin chào! Tôi là trợ lý AI của Siêu Thị Mini. Tôi có thể giúp bạn tìm kiếm sản phẩm, tư vấn mua sắm. Bạn cần tôi hỗ trợ gì không?',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Listen for external open event
    useEffect(() => {
        const handleOpen = (e) => {
            setIsOpen(true);
            if (e.detail && e.detail.initialMessage) {
                // Auto-send the initial message after a brief delay to ensure window is open
                setTimeout(() => {
                    handleAutoSendMessage(e.detail.initialMessage);
                }, 300);
            }
        };
        window.addEventListener('openChatbot', handleOpen);
        return () => window.removeEventListener('openChatbot', handleOpen);
    }, [messages]); // Dependency on messages to ensure handleAutoSendMessage has latest state

    const handleAutoSendMessage = async (msgText) => {
        if (isLoading) return;

        const userMessage = msgText;
        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const history = messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));

            const response = await apiChat.sendMessage(userMessage, history);
            setMessages([
                ...newMessages,
                {
                    role: 'model',
                    content: response.message,
                    products: response.products,
                },
            ]);
        } catch (error) {
            console.error('Chat error:', error);
            toast.error('Có lỗi xảy ra khi gửi tin nhắn');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        // Add user message
        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Prepare history (exclude current message)
            const history = messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));

            const response = await apiChat.sendMessage(userMessage, history);

            // Add AI response
            setMessages([
                ...newMessages,
                {
                    role: 'model',
                    content: response.message,
                    products: response.products,
                },
            ]);
        } catch (error) {
            console.error('Chat error:', error);
            toast.error('Có lỗi xảy ra khi gửi tin nhắn');
            setMessages([
                ...newMessages,
                {
                    role: 'model',
                    content: 'Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau! 😔',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                                <div className="chatbot-avatar">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="chatbot-title">Trợ lý AI</h3>
                                    <p className="chatbot-subtitle">Siêu Thị Mini</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="chatbot-close-btn"
                                aria-label="Close chatbot"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.role}`}>
                                <div className="message-content">
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="product-cards">
                                            {msg.products.map((product) => (
                                                <div key={product.id} className="product-card">
                                                    <img
                                                        src={getImageUrl(product.image, 'product')}
                                                        alt={product.name}
                                                        className="product-image"
                                                    />
                                                    <div className="product-info">
                                                        <h4 className="product-name">{product.name}</h4>
                                                        <div className="product-price-wrapper">
                                                            {product.discountPrice && product.discountPrice < product.salePrice ? (
                                                                <>
                                                                    <span className="product-price-discount">
                                                                        {product.discountPrice.toLocaleString('vi-VN')} đ
                                                                    </span>
                                                                    <span className="product-price-original">
                                                                        {product.salePrice.toLocaleString('vi-VN')} đ
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="product-price-discount">
                                                                    {product?.salePrice?.toLocaleString('vi-VN')} đ
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Link
                                                            to={`/product/${product.slug}`}
                                                            className="product-link"
                                                        >
                                                            Xem chi tiết →
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message model">
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chatbot-input">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Nhập tin nhắn..."
                            rows={1}
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading || !input.trim()}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;

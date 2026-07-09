import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword, verifyCode, resetPassword } from '../../api/apiAuth';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Step 1: Send OTP to email
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Vui lòng nhập email');
            return;
        }

        setLoading(true);
        try {
            const response = await forgotPassword(email);
            toast.success(response.message || 'Mã OTP đã được gửi đến email của bạn');
            setStep(2);
            setCountdown(300); // 5 minutes countdown
            startCountdown();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gửi mã OTP thất bại');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            toast.error('Vui lòng nhập mã OTP 6 số');
            return;
        }

        setLoading(true);
        try {
            await verifyCode(email, otp);
            toast.success('Mã xác thực hợp lệ');
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Mã xác thực không đúng');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email, otp, newPassword);
            toast.success('Đổi mật khẩu thành công!');
            setStep(4);
            setTimeout(() => navigate('/registered'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setLoading(false);
        }
    };

    // Countdown timer
    const startCountdown = () => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (countdown > 0) return;
        await handleSendOtp({ preventDefault: () => { } });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Quên mật khẩu
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {step === 1 && 'Nhập email để nhận mã xác thực'}
                        {step === 2 && 'Nhập mã OTP đã gửi đến email'}
                        {step === 3 && 'Tạo mật khẩu mới'}
                        {step === 4 && 'Hoàn tất!'}
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="flex justify-center space-x-2">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-2 w-16 rounded-full ${step >= s ? 'bg-indigo-600' : 'bg-gray-300'
                                }`}
                        />
                    ))}
                </div>

                {/* Step 1: Email */}
                {step === 1 && (
                    <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Nhập email của bạn"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP */}
                {step === 2 && (
                    <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
                        <div>
                            <label htmlFor="otp" className="sr-only">
                                Mã OTP
                            </label>
                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                maxLength="6"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 text-center text-2xl tracking-widest focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="000000"
                            />
                        </div>
                        {countdown > 0 && (
                            <p className="text-center text-sm text-gray-600">
                                Mã có hiệu lực trong: <span className="font-semibold text-indigo-600">{formatTime(countdown)}</span>
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Đang xác thực...' : 'Xác thực'}
                        </button>
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={countdown > 0}
                            className="w-full text-center text-sm text-indigo-600 hover:text-indigo-500 disabled:text-gray-400"
                        >
                            {countdown > 0 ? 'Gửi lại mã' : 'Gửi lại mã OTP'}
                        </button>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                        <div className="space-y-4">
                            <div className="relative">
                                <label htmlFor="newPassword" className="sr-only">
                                    Mật khẩu mới
                                </label>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showNewPassword ? "text" : "password"}
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
                                    placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                                />
                                <div
                                    className="absolute right-3 top-2.5 text-gray-500 cursor-pointer hover:text-indigo-600 transition-colors"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </div>
                            </div>
                            <div className="relative">
                                <label htmlFor="confirmPassword" className="sr-only">
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
                                    placeholder="Xác nhận mật khẩu mới"
                                />
                                <div
                                    className="absolute right-3 top-2.5 text-gray-500 cursor-pointer hover:text-indigo-600 transition-colors"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                        </button>
                    </form>
                )}

                {/* Step 4: Success */}
                {step === 4 && (
                    <div className="text-center space-y-4">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Đổi mật khẩu thành công!</h3>
                        <p className="text-sm text-gray-600">Đang chuyển hướng đến trang đăng nhập...</p>
                    </div>
                )}

                {/* Back to Login */}
                {step !== 4 && (
                    <div className="text-center">
                        <Link to="/registered" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Quay lại đăng nhập
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;

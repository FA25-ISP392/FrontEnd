import { useState } from "react";
import { CheckCircle, X } from "lucide-react";
import { useForgotPassword } from "../../hooks/useForgotPassword";

export default function ForgotPasswordSidebar({
  isOpen,
  onClose,
  onBackToLogin,
}) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    forgotPassword,
    isLoading,
    error,
    success,
    clearError,
    clearSuccess,
  } = useForgotPassword();

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearError();
    await forgotPassword(email);
  };

  const maskEmail = (raw) => {
    const email = String(raw || "").trim();
    const [local = "", domain = ""] = email.split("@");
    if (!local || !domain) return email;

    const visible = local.slice(0, 5);
    return `${visible}${local.length > 5 ? "***" : "*"}@${domain}`;
  };

  const masked = maskEmail(email);

  const handleBackToLogin = () => {
    setEmail("");
    clearError();
    clearSuccess?.();
    onClose();
    onBackToLogin?.();
  };

  const handleResend = async () => {
    clearError();
    await forgotPassword(email);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 transition-opacity duration-300">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300">
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quên Mật Khẩu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="animate-fadeIn">
            {!success ? (
              <>
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm rounded-lg bg-red-50 border border-red-200 text-red-700">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError();
                      }}
                      disabled={isLoading}
                      className="form-input-enhanced"
                      placeholder="Nhập địa chỉ email của bạn"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-submit-enhanced"
                  >
                    {isLoading ? "Đang gửi..." : "Gửi liên kết khôi phục"}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Nhớ mật khẩu?{" "}
                    <button
                      onClick={handleBackToLogin}
                      className="text-orange-600 hover:text-orange-700 font-medium transition-all duration-300 hover:underline"
                    >
                      Đăng nhập tại đây
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Email đã được gửi!
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Chúng tôi đã gửi liên kết đặt lại mật khẩu đến{" "}
                  <span className="font-medium text-gray-900">{masked}</span>.
                  Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleBackToLogin}
                    className="btn-submit-enhanced w-full"
                  >
                    Quay lại đăng nhập
                  </button>
                  <button
                    onClick={handleResend}
                    disabled={isLoading}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors duration-300"
                  >
                    {isLoading ? "Đang gửi lại..." : "Gửi lại email"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

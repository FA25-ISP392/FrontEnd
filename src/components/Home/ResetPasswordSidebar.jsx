import { useState } from "react";
import { CheckCircle, X, Eye, EyeOff } from "lucide-react";
import { useResetPassword } from "../../hooks/useResetPassword";

export default function ResetPasswordSidebar({
  isOpen,
  onClose,
  onBackToLogin,
  token,
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { resetPassword, isLoading, error, success, clearError, clearSuccess } =
    useResetPassword();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    await resetPassword(token, newPassword, confirmPassword);
  };

  const handleBackToLogin = () => {
    setNewPassword("");
    setConfirmPassword("");
    clearError();
    clearSuccess();
    onClose();
    onBackToLogin?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 transition-opacity duration-300">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Đặt Lại Mật Khẩu
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
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
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          clearError();
                        }}
                        disabled={isLoading}
                        className="form-input-enhanced pr-10"
                        placeholder="Nhập mật khẩu mới (8–30 ký tự)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          clearError();
                        }}
                        disabled={isLoading}
                        className="form-input-enhanced pr-10"
                        placeholder="Nhập lại mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* giống Forgot: chỉ disable khi loading */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-submit-enhanced"
                  >
                    {isLoading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Nhớ mật khẩu?{" "}
                    <button
                      onClick={handleBackToLogin}
                      className="text-orange-600 hover:text-orange-700 font-medium hover:underline"
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
                  Đặt lại mật khẩu thành công!
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Bạn có thể đăng nhập với mật khẩu mới.
                </p>
                <button
                  onClick={handleBackToLogin}
                  className="btn-submit-enhanced w-full"
                >
                  Đăng nhập ngay
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

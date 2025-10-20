import { useCustomerLogin } from "../../hooks/useCustomerLogin";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { loginWithGooglePopup } from "../../lib/googleAuth";

export default function LoginForm({
  onSubmit,
  onSwitchToRegister,
  onForgotPassword,
}) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useCustomerLogin();
  const [isGoogleLoading, setGoogleLoading] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    clearError();
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await login({
      username: formData.username,
      password: formData.password,
      onSuccess: () => {
        if (typeof onSubmit === "function") onSubmit(formData);
      },
    });
  };

  const handleGoogleLogin = async () => {
    if (isGoogleLoading) return;
    setGoogleLoading(true);
    try {
      await loginWithGooglePopup();
      if (typeof onSubmit === "function") onSubmit();
    } catch (e) {
      console.error(e);
      alert(e?.message || "Đăng nhập Google thất bại.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên Đăng Nhập
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            disabled={isLoading}
            className="form-input-enhanced"
            placeholder="Nhập tên đăng nhập"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mật Khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              className="form-input-enhanced pr-10"
              placeholder="Nhập mật khẩu"
            />
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-300"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="mt-2 text-left">
            <button
              onClick={onForgotPassword}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-all duration-300 hover:underline"
            >
              Quên mật khẩu?
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-submit-enhanced"
        >
          {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Hoặc</span>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isGoogleLoading
              ? "Đang xác thực Google..."
              : "Đăng nhập bằng Google"}
          </button>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Bạn chưa có tài khoản?{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-orange-600 hover:text-orange-700 font-medium transition-all duration-300 hover:underline"
          >
            Hãy Đăng Ký
          </button>
        </p>
      </div>
    </div>
  );
}

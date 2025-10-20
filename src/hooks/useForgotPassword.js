import { useState } from "react";
import apiConfig from "../api/apiConfig";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [err, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const clearError = () => setError("");
  const clearSuccess = () => setSuccess(false);

  const forgotPassword = async (rawEmail) => {
    const email = String(rawEmail || "").trim();
    if (!email) {
      setError("Vui lòng nhập email.");
      return { success: false };
    }
    if (!EMAIL_REGEX.test(email)) {
      setError("Email không đúng định dạng.");
      return { success: false };
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await apiConfig.post("/auth/forgot-password", null, {
        params: { email },
      });
      setSuccess(true);
      return { success: true };
    } catch (err) {
      const status = err?.status || err?.response?.status;
      if (status === 404) {
        setSuccess(true);
        return { success: true };
      }
      let msg = "Không thể xử lý lúc này. Vui lòng thử lại sau.";
      if (status === 400)
        msg = "Yêu cầu không hợp lệ. Vui lòng kiểm tra email.";
      else if (status === 429)
        msg = "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.";
      else if (status >= 500) msg = "Máy chủ đang bận. Vui lòng thử lại sau.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    forgotPassword,
    isLoading,
    error: err,
    success,
    clearError,
    clearSuccess,
  };
}

import { useState } from "react";
import apiConfig from "../api/apiConfig";

const MIN_LEN = 8;
const MAX_LEN = 30;

export function useResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const clearError = () => setError("");
  const clearSuccess = () => setSuccess(false);

  const resetPassword = async (token, newPassword, confirmPassword) => {
    const pw = String(newPassword || "");
    const cf = String(confirmPassword || "");

    if (!pw || !cf) {
      setError("Vui lòng nhập đầy đủ hai ô mật khẩu.");
      return { success: false };
    }
    if (pw.length < MIN_LEN || pw.length > MAX_LEN) {
      setError(`Mật khẩu phải từ ${MIN_LEN} đến ${MAX_LEN} ký tự.`);
      return { success: false };
    }
    if (pw !== cf) {
      setError("Mật khẩu xác nhận không khớp.");
      return { success: false };
    }
    if (!token) {
      setError("Thiếu mã xác thực (token). Vui lòng mở lại link trong email.");
      return { success: false };
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await apiConfig.post("/auth/reset-password", {
        token,
        newPassword: pw,
      });
      setSuccess(true);
      return { success: true };
    } catch (err) {
      const status = err?.status || err?.response?.status;
      let msg = "Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.";
      if (status === 400) msg = "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại.";
      else if (status === 401) msg = "Mã xác thực đã hết hạn hoặc không đúng.";
      else if (status === 429)
        msg = "Bạn thao tác quá nhanh. Vui lòng thử lại sau.";
      else if (status >= 500) msg = "Máy chủ đang bận. Vui lòng thử lại sau.";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  return { resetPassword, isLoading, error, success, clearError, clearSuccess };
}

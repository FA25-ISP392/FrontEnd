import { createCustomer } from "../../lib/apiCustomer";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function RegisterForm({ onSwitchToLogin }) {
  const [formRegister, setFormRegister] = useState({
    username: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrs, setFieldErrs] = useState({});
  const [formMsg, setFormMsg] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    switch (name) {
      case "username": {
        next = value
          .toLowerCase()
          .replace(/[^a-z0-9._-]/g, "")
          .slice(0, 30);
        break;
      }
      case "fullName": {
        next = value.replace(/\s+/g, " ").trimStart().slice(0, 50);
        break;
      }
      case "phone": {
        next = value.replace(/\D/g, "").slice(0, 10);
        break;
      }
      default:
        break;
    }

    setFormRegister((prev) => ({ ...prev, [name]: next }));
    setFieldErrs((prev) => ({ ...prev, [name]: "" }));
  };

  function validateCreate(value) {
    const errs = {};
    const cleaned = {
      username: (value.username || "").trim(),
      password: value.password || "",
      confirmPassword: value.confirmPassword || "",
      fullName: (value.fullName || "").trim(),
      email: (value.email || "").trim(),
      phone: (value.phone || "").trim(),
    };

    if (!cleaned.username) {
      errs.username = "Vui lòng nhập tên đăng nhập.";
    } else if (cleaned.username.length < 3 || cleaned.username.length > 30) {
      errs.username = "Tên đăng nhập phải từ 3–30 ký tự.";
    } else if (!/^[a-z0-9._-]+$/.test(cleaned.username)) {
      errs.username =
        "Chỉ gồm a–z, 0–9, dấu chấm (.), gạch dưới (_), gạch nối (-).";
    }

    if (!cleaned.password) {
      errs.password = "Vui lòng nhập mật khẩu.";
    } else if (cleaned.password.length < 8 || cleaned.password.length > 30) {
      errs.password = "Mật khẩu phải từ 8–30 ký tự.";
    } else if (/\s/.test(cleaned.password)) {
      errs.password = "Mật khẩu không được chứa khoảng trắng.";
    }

    if (cleaned.confirmPassword !== cleaned.password) {
      errs.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    if (!cleaned.fullName) {
      errs.fullName = "Vui lòng nhập họ và tên.";
    } else if (cleaned.fullName.length < 2 || cleaned.fullName.length > 50) {
      errs.fullName = "Họ tên phải từ 2–50 ký tự.";
    } else if (/\d/.test(cleaned.fullName)) {
      errs.fullName = "Họ tên không được chứa chữ số.";
    }

    if (!cleaned.email) {
      errs.email = "Vui lòng nhập email.";
    } else {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned.email);
      if (!emailOk) errs.email = "Email không hợp lệ.";
    }

    if (!cleaned.phone) {
      errs.phone = "Vui lòng nhập số điện thoại.";
    } else {
      const onlyDigits = cleaned.phone.replace(/\D/g, "");
      if (!/^0[1-9]\d{8}$/.test(onlyDigits)) {
        errs.phone = "Số điện thoại phải 10 số, bắt đầu bằng 0.";
      }
      cleaned.phone = onlyDigits;
    }

    return { errs, cleaned };
  }

  function focusFirstError(errs) {
    const firstKey = Object.keys(errs)[0];
    const selector =
      firstKey === "username"
        ? "input[name='username']"
        : firstKey === "password"
        ? "input[name='password']"
        : firstKey === "confirmPassword"
        ? "input[name='confirmPassword']"
        : firstKey === "fullName"
        ? "input[name='fullName']"
        : firstKey === "email"
        ? "input[name='email']"
        : firstKey === "phone"
        ? "input[name='phone']"
        : null;
    if (selector) {
      const tmp = document.querySelector(selector);
      if (tmp) tmp.focus();
    }
  }

  function parseBackendError(err) {
    const status = err?.response?.status;
    const data = err?.response?.data || {};
    const tmp = {};

    if (status === 400 || status === 409) {
      const list =
        data?.errors ||
        data?.result ||
        data?.fieldErrors ||
        data?.violations ||
        data?.details ||
        data?.subErrors ||
        [];
      if (Array.isArray(list)) {
        for (const it of list) {
          const field = String(
            it.field || it.fieldName || it.property || it.path || it.param || ""
          ).toLowerCase();
          const msg =
            it.defaultMessage || it.message || data?.message || "Không hợp lệ.";
          if (field.includes("user")) tmp.username = msg;
          if (field.includes("email")) tmp.email = msg;
          if (field.includes("phone")) tmp.phone = msg;
          if (field.includes("name")) tmp.fullName = msg;
          if (field.includes("pass")) tmp.password = msg;
        }
      }

      const low = String(data?.message || err.message || "").toLowerCase();
      const dup = /(exist|exists|duplicate|already|unique|trùng)/i;
      if (!tmp.username && /user(name)?/.test(low) && dup.test(low))
        tmp.username = "Tên đăng nhập đã tồn tại.";
      if (!tmp.email && /email/.test(low) && dup.test(low))
        tmp.email = "Email đã tồn tại.";
      if (!tmp.phone && /(phone|sđt)/i.test(low) && dup.test(low))
        tmp.phone = "Số điện thoại đã tồn tại.";
    }

    return {
      fieldErrors: tmp,
      message: data?.message || err.message || "Có lỗi xảy ra.",
    };
  }

  const handleSubmit = async (tmp) => {
    tmp.preventDefault();
    setFormMsg("");
    setFieldErrs({});

    const { errs, cleaned } = validateCreate(formRegister);
    if (Object.keys(errs).length) {
      setFieldErrs(errs);
      requestAnimationFrame(() => focusFirstError(errs));
      return;
    }

    try {
      setLoading(true);
      await createCustomer(cleaned);
      setFormMsg("Tạo tài khoản thành công! Vui lòng đăng nhập...");
      setTimeout(() => {
        onSwitchToLogin?.();
      }, 1200);
    } catch (err) {
      console.error(err);
      const { fieldErrors, message } = parseBackendError(err);
      if (Object.keys(fieldErrors).length) {
        setFieldErrs(fieldErrors);
        requestAnimationFrame(() => focusFirstError(fieldErrors));
      } else {
        setFormMsg(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formMsg && (
          <p
            className={`text-sm ${
              formMsg.includes("thành công") ? "text-green-600" : "text-red-600"
            }`}
          >
            {formMsg}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên Đăng Nhập
          </label>
          <input
            type="text"
            name="username"
            value={formRegister.username}
            onChange={(event) => {
              handleInputChange(event);
              setFieldErrs((prev) => ({ ...prev, username: "" }));
            }}
            required
            autoComplete="username"
            maxLength={30}
            className="form-input-enhanced"
            placeholder="Nhập tên đăng nhập"
          />
          {fieldErrs.username && (
            <p className="text-xs text-red-600 mt-1">{fieldErrs.username}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mật Khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formRegister.password}
              onChange={(event) => {
                handleInputChange(event);
                setFieldErrs((prev) => ({ ...prev, password: "" }));
              }}
              required
              autoComplete="new-password"
              maxLength={30}
              className="form-input-enhanced pr-10"
              placeholder="Nhập mật khẩu"
            />
            <button
              type="button"
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
          {fieldErrs.password && (
            <p className="text-xs text-red-600 mt-1">{fieldErrs.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhắc Lại Mật Khẩu
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formRegister.confirmPassword}
              onChange={(event) => {
                handleInputChange(event);
                setFieldErrs((prev) => ({ ...prev, confirmPassword: "" }));
              }}
              required
              autoComplete="new-password"
              maxLength={30}
              className="form-input-enhanced pr-10"
              placeholder="Nhập lại mật khẩu"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-300"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {fieldErrs.confirmPassword && (
            <p className="text-xs text-red-600 mt-1">
              {fieldErrs.confirmPassword}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ và Tên
          </label>
          <input
            type="text"
            name="fullName"
            value={formRegister.fullName}
            onChange={(event) => {
              handleInputChange(event);
              setFieldErrs((prev) => ({ ...prev, fullName: "" }));
            }}
            required
            maxLength={50}
            className="form-input-enhanced"
            placeholder="Nhập họ và tên"
          />
          {fieldErrs.fullName && (
            <p className="text-xs text-red-600 mt-1">{fieldErrs.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số Điện Thoại
          </label>
          <input
            type="tel"
            name="phone"
            value={formRegister.phone}
            onChange={(event) => {
              handleInputChange(event);
              setFieldErrs((prev) => ({ ...prev, phone: "" }));
            }}
            required
            inputMode="numeric"
            pattern="\d*"
            autoComplete="tel"
            maxLength={10}
            className="form-input-enhanced"
            placeholder="Nhập số điện thoại"
          />
          {fieldErrs.phone && (
            <p className="text-xs text-red-600 mt-1">{fieldErrs.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formRegister.email}
            onChange={(event) => {
              handleInputChange(event);
              setFieldErrs((prev) => ({ ...prev, email: "" }));
            }}
            required
            autoComplete="email"
            className="form-input-enhanced"
            placeholder="Nhập email"
          />
          {fieldErrs.email && (
            <p className="text-xs text-red-600 mt-1">{fieldErrs.email}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-submit-enhanced"
        >
          {loading ? "Đang xử lý..." : "Đăng Ký"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Bạn đã có tài khoản?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-orange-600 hover:text-orange-700 font-medium transition-all duration-300 hover:underline"
          >
            Đăng Nhập Tại Đây
          </button>
        </p>
      </div>
    </div>
  );
}

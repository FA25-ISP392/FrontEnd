import { useState, useEffect, useMemo, useCallback } from "react";
import { X, User, Phone, Mail, Save } from "lucide-react";
import {
  listCustomers,
  updateCustomer,
  normalizeCustomer,
  findCustomerByUsername,
} from "../../lib/apiCustomer";

const normStr = (v) => String(v ?? "").trim();
const onlyDigits = (v) => normStr(v).replace(/\D/g, "");
const getSelfKey = (u) => String(u?.id ?? u?.customerId ?? u?.username ?? "");

export default function EditAccountModal({ isOpen, onClose, userInfo }) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [allCustomers, setAllCustomers] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isOpen || allCustomers.length) return;
      try {
        const data = await listCustomers();
        if (mounted) setAllCustomers(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setAllCustomers([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isOpen, allCustomers.length]);

  useEffect(() => {
    if (!isOpen || !userInfo) return;
    setFormData({
      fullName: userInfo.fullName || "",
      phone: userInfo.phone || "",
      email: userInfo.email || "",
    });
  }, [isOpen, userInfo]);

  const isDirty = useMemo(() => {
    if (!userInfo) return false;
    const cur = {
      fullName: normStr(formData.fullName),
      phone: onlyDigits(formData.phone),
      email: normStr(formData.email),
    };
    const old = {
      fullName: normStr(userInfo.fullName),
      phone: onlyDigits(userInfo.phone),
      email: normStr(userInfo.email),
    };
    return (
      cur.fullName !== old.fullName ||
      cur.phone !== old.phone ||
      cur.email !== old.email
    );
  }, [formData, userInfo]);

  const validate = useCallback((f) => {
    const errors = {};
    const fullName = normStr(f.fullName);
    const email = normStr(f.email);
    const phone = onlyDigits(f.phone);

    if (!fullName) errors.fullName = "Vui lòng nhập họ và tên";
    else if (fullName.length < 2 || fullName.length > 50)
      errors.fullName = "Họ và tên phải từ 2 đến 50 ký tự";

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Email không hợp lệ";

    if (phone && !/^0[1-9]\d{8}$/.test(phone))
      errors.phone = "Số điện thoại phải gồm 10 số và bắt đầu bằng 0";

    return { errors, normalized: { fullName, email, phone } };
  }, []);

  const checkDuplicateEmailPhone = useCallback(
    ({ email, phone, selfKey }) => {
      const e = normStr(email).toLowerCase();
      const p = onlyDigits(phone);
      for (const c of allCustomers) {
        if (!c) continue;
        const ck = getSelfKey(c);
        if (ck && ck === String(selfKey)) continue;
        const ce = normStr(c.email).toLowerCase();
        const cp = onlyDigits(c.phone);
        if (e && ce && e === ce) return { email: "Email đã tồn tại." };
        if (p && cp && p === cp) return { phone: "Số điện thoại đã tồn tại." };
      }
      return {};
    },
    [allCustomers]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const resolveCustomerId = useCallback(async () => {
    if (userInfo?.customerId) return userInfo.customerId;
    if (userInfo?.id) return userInfo.id;
    if (userInfo?.username) {
      const found = await findCustomerByUsername(userInfo.username);
      return found?.customerId ?? found?.id ?? null;
    }
    return null;
  }, [userInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (!isDirty) {
        setMessage({ type: "error", text: "Không có thay đổi nào để lưu." });
        return;
      }

      const { errors, normalized } = validate(formData);
      if (Object.keys(errors).length) {
        setMessage({
          type: "error",
          text: "Dữ liệu chưa hợp lệ, vui lòng kiểm tra lại.",
        });
        return;
      }

      const selfId = await resolveCustomerId();
      if (!selfId) throw new Error("Không xác định được tài khoản hiện tại.");

      const selfKey = getSelfKey({ id: selfId, username: userInfo?.username });
      const dup = checkDuplicateEmailPhone({
        email: normalized.email,
        phone: normalized.phone,
        selfKey,
      });
      if (dup.email || dup.phone) {
        setMessage({
          type: "error",
          text: "Email hoặc số điện thoại đã tồn tại.",
        });
        return;
      }

      const serverUser = await updateCustomer(selfId, normalized);
      const normalizedUser = normalizeCustomer(serverUser);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      window.dispatchEvent(new Event("auth:changed"));

      setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
      setTimeout(() => {
        onClose();
        setMessage({ type: "", text: "" });
      }, 1200);
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Cập nhật thất bại." });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 transition-opacity duration-300">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Sửa thông tin tài khoản
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Nhập họ và tên"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Nhập email"
                />
              </div>
            </div>

            {message.text && (
              <div
                className={`p-3 rounded-lg text-sm font-medium text-center ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-300"
                    : "bg-red-50 text-red-700 border border-red-300"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading || !isDirty}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

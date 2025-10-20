import { useState, useEffect } from "react";
import { updateDish, normalizeDish } from "../../lib/apiDish";
import { X, Save } from "lucide-react";

export default function EditDishModal({
  isEditingDish,
  setIsEditingDish,
  editingItem,
  setEditingItem,
  saveDish,
}) {
  const [form, setForm] = useState({
    dish_name: "",
    price: "",
    category: "PIZZA",
    description: "",
    calo: "",
    picture: "",
    is_available: true,
  });
  const [saving, setSaving] = useState(false);
  const [fieldErrs, setFieldErrs] = useState({});
  const [err, setErr] = useState("");

  const CATEGORIES = [
    "PIZZA",
    "Pasta",
    "Main Course",
    "Salad",
    "Dessert",
    "Appetizer",
    "Beverage",
  ];

  useEffect(() => {
    if (editingItem) {
      setForm({
        dish_name: editingItem.name || "",
        price: editingItem.price || "",
        category: editingItem.category || "PIZZA",
        description: editingItem.description || "",
        calo: editingItem.calories || "",
        picture: editingItem.picture || "",
        is_available:
          editingItem.status === 1 || editingItem.is_available === true,
      });
    }
    setErr("");
    setFieldErrs({});
  }, [editingItem, isEditingDish]);

  const setF = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const validate = (f) => {
    const errs = {};
    if (!f.dish_name || f.dish_name.trim().length < 2)
      errs.dish_name = "Tên món ăn phải từ 2 ký tự trở lên.";
    if (!f.price || Number(f.price) <= 0) errs.price = "Giá phải là số dương.";
    if (!f.category) errs.category = "Vui lòng chọn danh mục.";
    if (!f.description || f.description.trim().length < 10)
      errs.description = "Mô tả phải ít nhất 10 ký tự.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setFieldErrs({});
    const errs = validate(form);
    if (Object.keys(errs).length) return setFieldErrs(errs);

    try {
      setSaving(true);
      const payload = {
        dishName: form.dish_name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        calo: form.calo ? Number(form.calo) : 0,
        category: form.category,
        picture: form.picture.trim(),
        isAvailable: Boolean(form.is_available),
        status: form.is_available ? "available" : "unavailable",
      };

      const updated = await updateDish(editingItem.id, payload);
      const normalized = normalizeDish({
        ...updated,
        isAvailable: payload.isAvailable,
      });

      saveDish?.(normalized);
      setIsEditingDish(false);
      setEditingItem(null);
    } catch (e) {
      setErr(e.message || "Có lỗi xảy ra khi cập nhật món ăn.");
    } finally {
      setSaving(false);
    }
  };

  if (!isEditingDish) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white rounded-t-2xl flex justify-between items-center">
          <h2 className="text-xl font-bold">Chỉnh Sửa Món Ăn</h2>
          <button
            onClick={() => setIsEditingDish(false)}
            className="p-2 hover:bg-white/20 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          {/* Các field input */}
          {/* ... giữ nguyên phần form như bạn đã có ... */}

          {err && <p className="text-sm text-red-600">{err}</p>}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditingDish(false)}
              className="flex-1 border px-4 py-3 rounded-xl text-neutral-700 hover:bg-neutral-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition"
            >
              <Save className="inline h-4 w-4 mr-2" />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

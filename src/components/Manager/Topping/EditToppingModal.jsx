import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { createTopping, updateTopping } from "../../../lib/apiTopping";

export default function EditToppingModal({
  isEditingTopping,
  setIsEditingTopping,
  editingItem,
  setEditingItem,
  setToppings,
}) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    calories: "",
    gram: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Khi click Sửa topping → tự đổ dữ liệu vào form
  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name || "",
        price: editingItem.price || "",
        calories: editingItem.calories || "",
        gram: editingItem.gram || "",
      });
    } else {
      setForm({ name: "", price: "", calories: "", gram: "" });
    }
  }, [editingItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      setError("Tên topping và giá là bắt buộc");
      return;
    }
    setSaving(true);
    setError("");

    try {
      if (editingItem?.id) {
        // Cập nhật topping
        const updated = await updateTopping(editingItem.id, {
          name: form.name,
          price: Number(form.price),
          calories: Number(form.calories),
          gram: Number(form.gram),
        });
        setToppings((prev) =>
          prev.map((t) =>
            t.id === editingItem.id ? updated.result ?? updated : t,
          ),
        );
        alert("Cập nhật topping thành công!");
      } else {
        // Thêm mới topping
        const created = await createTopping({
          name: form.name,
          price: Number(form.price),
          calories: Number(form.calories),
          gram: Number(form.gram),
          quantity: 0,
        });

        setToppings((prev) => [...prev, created.result ?? created]);
        alert("Thêm topping thành công!");
      }
      setIsEditingTopping(false);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Lỗi khi lưu topping");
    } finally {
      setSaving(false);
    }
  };

  if (!isEditingTopping) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-800">
            {editingItem ? "Chỉnh sửa topping" : "Thêm topping mới"}
          </h2>
          <button
            onClick={() => {
              setIsEditingTopping(false);
              setEditingItem(null);
            }}
            className="p-2 text-gray-500 hover:text-red-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên topping
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Giá (VNĐ)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Calories</label>
            <input
              type="number"
              name="calories"
              value={form.calories}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gram</label>
            <input
              type="number"
              name="gram"
              value={form.gram}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => {
              setIsEditingTopping(false);
              setEditingItem(null);
            }}
            className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

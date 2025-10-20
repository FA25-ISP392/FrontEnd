import { useEffect, useState } from "react";
import { Plus, Pencil, Utensils, X } from "lucide-react";
import {
  listDish,
  getDish,
  createDish,
  updateDish,
  deleteDish,
  normalizeDish,
} from "../../../lib/apiDish";
import { listTopping } from "../../../lib/apiTopping";
import { addDishToppingsBatch } from "../../../lib/apiDishTopping";

/* ===================== Helpers ===================== */
const CATEGORIES = [
  "PIZZA",
  "PASTA",
  "Main Course",
  "Salad",
  "Dessert",
  "Appetizer",
  "Beverage",
];

const TYPES = ["BUILD_MUSCLE", "MAINTAIN_WEIGHT", "LOSE_WEIGHT"];

const fmtVND = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const statusLabel = (isAvail) => (isAvail ? "Được bán" : "Không được bán");
const statusChipClass = (isAvail) =>
  isAvail
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-rose-50 text-rose-700 border-rose-200";

/* ===================== Modal ===================== */
function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h3 className="font-semibold text-lg">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ===================== Form ===================== */
function DishForm({ initial, onSubmit, saving }) {
  const [form, setForm] = useState({
    dishName: initial?.name || "",
    category: initial?.category || CATEGORIES[0],
    type: initial?.type || TYPES[0],
    price: Number(initial?.price ?? 0),
    calo: Number(initial?.calories ?? 0),
    description: initial?.description || "",
    isAvailable: Boolean(initial?.is_available ?? true),
    imageFile: null,
    toppings: initial?.optionalToppings?.map((t) => t.toppingId) || [],
  });

  const [allToppings, setAllToppings] = useState([]);
  const [loadingToppings, setLoadingToppings] = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingToppings(true);
      try {
        const res = await listTopping();
        setAllToppings(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingToppings(false);
      }
    })();
  }, []);

  const handleChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const toggleTopping = (id) =>
    setForm((prev) => ({
      ...prev,
      toppings: prev.toppings.includes(id)
        ? prev.toppings.filter((tid) => tid !== id)
        : [...prev.toppings, id],
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* tên + danh mục */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Tên món ăn"
          value={form.dishName}
          onChange={(e) => handleChange("dishName", e.target.value)}
          required
        />
        <Select
          label="Danh mục"
          value={form.category}
          onChange={(e) => handleChange("category", e.target.value)}
          options={CATEGORIES}
        />
      </div>

      {/* type + calo */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Loại (Type)"
          value={form.type}
          onChange={(e) => handleChange("type", e.target.value)}
          options={TYPES}
        />
        <Input
          label="Calories (kcal)"
          type="number"
          value={form.calo}
          onChange={(e) => handleChange("calo", e.target.value)}
        />
      </div>

      {/* giá + trạng thái */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Giá (VND)"
          type="number"
          value={form.price}
          onChange={(e) => handleChange("price", e.target.value)}
        />
        <div>
          <label className="text-sm text-gray-600">Trạng thái</label>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="avail"
                checked={form.isAvailable === true}
                onChange={() => handleChange("isAvailable", true)}
              />
              Được bán
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="avail"
                checked={form.isAvailable === false}
                onChange={() => handleChange("isAvailable", false)}
              />
              Không được bán
            </label>
          </div>
        </div>
      </div>

      {/* mô tả */}
      <Textarea
        label="Mô tả món ăn"
        value={form.description}
        onChange={(e) => handleChange("description", e.target.value)}
      />

      {/* hình ảnh */}
      <div>
        <label className="text-sm text-gray-600">Ảnh món ăn</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleChange("imageFile", e.target.files[0])}
          className="mt-2 block w-full text-sm"
        />
        {form.imageFile && (
          <img
            src={URL.createObjectURL(form.imageFile)}
            alt="preview"
            className="mt-2 w-32 h-32 object-cover rounded-xl border"
          />
        )}
      </div>

      {/* topping */}
      <div>
        <label className="text-sm text-gray-600 mb-2 block">
          Chọn topping đi kèm
        </label>
        {loadingToppings ? (
          <div className="text-sm text-gray-500">
            Đang tải danh sách topping...
          </div>
        ) : allToppings.length === 0 ? (
          <div className="text-sm text-gray-500 italic">
            Chưa có topping nào.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
            {allToppings.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTopping(t.id)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                  form.toppings.includes(t.id)
                    ? "bg-orange-100 border-orange-300 text-orange-700"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="text-right pt-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl"
        >
          {saving ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </form>
  );
}

/* Reusable components */
function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        {...props}
        className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring"
      />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <textarea
        {...props}
        rows={3}
        className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring"
      />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <select
        {...props}
        className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

/* ===================== Main Page ===================== */
export default function ManagerDishPage() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await listDish();
        setDishes(list);
      } catch (e) {
        alert("Không tải được danh sách món ăn");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCreate = async (form) => {
    if (!form.dishName || !form.price) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        dishName: form.dishName,
        description: form.description,
        price: Number(form.price),
        calo: Number(form.calo),
        category: form.category,
        type: form.type,
        isAvailable: Boolean(form.isAvailable),
        imageFile: form.imageFile,
      };

      const created = await createDish(payload);
      const dish = created?.result ?? created;

      if (form.toppings?.length > 0) {
        await addDishToppingsBatch(dish.dishId, form.toppings);
      }

      alert("✅ Thêm món ăn thành công!");
      setOpenCreate(false);
      setDishes((prev) => [...prev, dish]);
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi thêm món ăn!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-neutral-800">Quản lý món ăn</h1>
        <button
          onClick={() => setOpenCreate(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl hover:bg-orange-700"
        >
          <Plus className="h-5 w-5" /> Thêm món ăn
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Đang tải danh sách món ăn...</div>
      ) : dishes.length === 0 ? (
        <div className="text-gray-500 italic">Chưa có món ăn nào.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dishes.map((d) => (
            <div
              key={d.id}
              className="rounded-2xl border p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <Utensils className="text-orange-600" />
                <div>
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-sm text-gray-500">{d.category}</p>
                </div>
              </div>
              <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                {d.description}
              </p>
              <p className="mt-2 font-semibold text-orange-600">
                {fmtVND(d.price)}
              </p>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Thêm món ăn mới"
      >
        <DishForm onSubmit={handleCreate} saving={saving} />
      </Modal>
    </div>
  );
}

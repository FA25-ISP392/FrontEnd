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

/* ===================== Modal (inline) ===================== */
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

/* ===================== Card ===================== */
function DishCard({ dish, onClick, onEdit }) {
  return (
    <div className="group bg-white rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden flex flex-col w-full max-w-[400px] min-h-[380px] mx-auto">
      <div className="flex items-start justify-between p-5 pb-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center">
            <Utensils className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 truncate max-w-[220px]">
              {dish.name}
            </h3>
            <p className="text-sm text-gray-500">{dish.category || "—"}</p>
          </div>
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full border ${statusChipClass(
            dish.is_available,
          )}`}
        >
          {statusLabel(dish.is_available)}
        </span>
      </div>

      <div className="px-5 text-gray-700 text-sm mt-2 flex-1 line-clamp-3">
        {dish.description || "—"}
      </div>

      <div className="px-5 mt-4 flex items-center justify-between">
        <div className="font-semibold text-orange-600 text-lg">
          {fmtVND(dish.price)}
        </div>
        <div className="text-sm text-gray-500">{dish.calories ?? 0} kcal</div>
      </div>

      <div className="px-5 pb-5 pt-4 flex gap-3 mt-auto">
        <button
          onClick={() => onClick?.(dish)}
          className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium hover:bg-gray-50"
        >
          Xem chi tiết
        </button>
        <button
          onClick={() => onEdit?.(dish)}
          className="flex-1 rounded-xl border border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 py-3 text-sm font-medium flex items-center justify-center gap-2"
        >
          <Pencil className="h-4 w-4" /> Sửa
        </button>
      </div>
    </div>
  );
}

/* ===================== Detail View ===================== */
function DishDetail({ data }) {
  if (!data) return null;
  const d = normalizeDish(data);
  const toppings = Array.isArray(data?.optionalToppings)
    ? data.optionalToppings
    : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Info label="Tên món" value={d.name} />
        <Info label="Danh mục" value={d.category || "—"} />
        <Info label="Giá" value={fmtVND(d.price)} />
        <Info
          label="Trạng thái"
          value={statusLabel(d.is_available)}
          className={statusChipClass(d.is_available)}
        />
        <Info label="Calories" value={`${d.calories ?? 0} kcal`} />
      </div>
      <div>
        <div className="text-sm text-gray-500 mb-1">Mô tả</div>
        <div className="rounded-xl border bg-gray-50 p-3 text-sm">
          {d.description || "—"}
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-500 mb-2">Topping đi kèm</div>
        {toppings.length === 0 ? (
          <div className="text-sm text-gray-500">Không có topping.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {toppings.map((t) => (
              <div
                key={t.toppingId}
                className="rounded-full border px-3 py-1 text-sm bg-orange-50 text-orange-700 border-orange-200"
              >
                {t.name} • {fmtVND(t.price)} • {t.calories} kcal
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value, className }) {
  return (
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`font-medium ${className || ""}`}>{value}</div>
    </div>
  );
}

/* ===================== Form (đầy đủ) ===================== */
function DishForm({ initial, onSubmit, saving }) {
  const [form, setForm] = useState({
    dishName: initial?.name || "",
    category: initial?.category || CATEGORIES[0],
    price: Number(initial?.price ?? 0),
    calo: Number(initial?.calories ?? 0),
    description: initial?.description || "",
    isAvailable: Boolean(initial?.is_available ?? true),
    picture: initial?.picture || "",
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

  const toggleTopping = (id) => {
    setForm((prev) => {
      const exists = prev.toppings.includes(id);
      return {
        ...prev,
        toppings: exists
          ? prev.toppings.filter((tid) => tid !== id)
          : [...prev.toppings, id],
      };
    });
  };

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

      {/* giá + calo */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Giá (VND)"
          type="number"
          value={form.price}
          onChange={(e) => handleChange("price", e.target.value)}
        />
        <Input
          label="Calories (kcal)"
          type="number"
          value={form.calo}
          onChange={(e) => handleChange("calo", e.target.value)}
        />
      </div>

      <Textarea
        label="Mô tả"
        value={form.description}
        onChange={(e) => handleChange("description", e.target.value)}
      />

      {/* chọn topping */}
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

      {/* trạng thái + ảnh */}
      <div className="grid grid-cols-2 gap-4">
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
        <Input
          label="Ảnh (link / tên file)"
          value={form.picture}
          onChange={(e) => handleChange("picture", e.target.value)}
        />
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
  const [detail, setDetail] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await listDish();
        setDishes(list);
      } catch (e) {
        alert(e?.message || "Không tải được danh sách món ăn");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openDishDetail = async (dish) => {
    try {
      const d = await getDish(dish.id);
      setDetail(d);
      setOpenDetail(true);
    } catch {
      alert("Không lấy được chi tiết món ăn");
    }
  };

  /* THÊM MÓN */
  const handleCreate = async (form) => {
    if (!form.dishName || !form.price) {
      alert("Vui lòng nhập đầy đủ thông tin món ăn!");
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
        picture: form.picture,
        isAvailable: Boolean(form.isAvailable),
      };

      const created = await createDish(payload);
      const dish = created?.result ?? created;

      if (form.toppings?.length > 0) {
        await addDishToppingsBatch(dish.dishId, form.toppings);
      }

      alert("✅ Thêm món ăn thành công!");
      setOpenCreate(false);
      setDishes((prev) => [...prev, dish]);
    } catch (e) {
      console.error(e);
      alert("❌ Lỗi khi thêm món ăn hoặc topping!");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = async (dish) => {
    try {
      const d = await getDish(dish.id);
      setEditing(d);
      setOpenEdit(true);
    } catch {
      alert("Không tải được món ăn để chỉnh sửa");
    }
  };

  /* SỬA MÓN */
  const handleEdit = async (form) => {
    if (!editing) return;
    setSaving(true);

    try {
      // 🧩 Lấy id món ăn (dùng dishId nếu có, fallback sang id)
      const id = editing.dishId || editing.id;
      if (!id) throw new Error("Không tìm thấy ID món ăn để cập nhật!");

      // 🧾 Payload gửi lên API update món
      const payload = {
        dishName: form.dishName || editing.name,
        description: form.description,
        price: Number(form.price),
        calo: Number(form.calo),
        category: form.category,
        picture: form.picture,
        isAvailable: Boolean(form.isAvailable),
      };

      console.log("🟠 Gửi update dish:", payload);

      // 🧠 Gọi API update món
      const updated = await updateDish(id, payload);
      const norm = normalizeDish(updated);

      // 🧩 In ra topping để kiểm tra
      console.log(
        "🧩 Gửi batch topping cho dishId:",
        id,
        "với:",
        form.toppings,
      );

      // 🟢 Gọi API batch topping (nếu có topping)
      if (Array.isArray(form.toppings) && form.toppings.length > 0) {
        await addDishToppingsBatch(id, form.toppings);
        console.log("✅ Batch topping thành công");
      } else {
        console.log("⚪ Không có topping để cập nhật, bỏ qua batch");
      }

      // ✅ Cập nhật state UI
      alert("✅ Cập nhật món ăn và topping thành công!");
      setDishes((prev) => prev.map((x) => (x.id === norm.id ? norm : x)));
      setOpenEdit(false);
      setEditing(null);
    } catch (e) {
      console.error("❌ Lỗi khi cập nhật món ăn:", e);
      if (e.response) {
        console.error("🔴 Response từ backend:", e.response.data);
        alert(
          `❌ Backend báo lỗi ${e.response.status}: ${
            e.response.data?.message || "Không xác định"
          }`,
        );
      } else {
        alert("❌ Lưu món ăn không thành công!");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dish) => {
    if (!confirm(`Xóa món "${dish.name}"?`)) return;
    try {
      await deleteDish(dish.id);
      setDishes((p) => p.filter((x) => x.id !== dish.id));
    } catch {
      alert("Lỗi khi xóa món ăn");
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
            <DishCard
              key={d.id}
              dish={d}
              onClick={openDishDetail}
              onEdit={handleOpenEdit}
            />
          ))}
        </div>
      )}

      <Modal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        title="Chi tiết món ăn"
      >
        <DishDetail data={detail} />
      </Modal>

      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Thêm món ăn"
      >
        <DishForm onSubmit={handleCreate} saving={saving} />
      </Modal>

      <Modal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        title="Chỉnh sửa món ăn"
      >
        <DishForm
          initial={normalizeDish(editing || {})}
          onSubmit={handleEdit}
          saving={saving}
        />
      </Modal>
    </div>
  );
}

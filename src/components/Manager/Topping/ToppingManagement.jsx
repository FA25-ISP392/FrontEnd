import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Salad } from "lucide-react";
import { listTopping, deleteTopping } from "../../../lib/apiTopping";

export default function ToppingsManagement({
  toppings,
  setToppings,
  setIsEditingTopping,
  setEditingItem,
  loading,
}) {
  const [confirmingId, setConfirmingId] = useState(null);
  const [loadingLocal, setLoadingLocal] = useState(false);

  // 🟢 Load danh sách topping từ API khi component mount
  useEffect(() => {
    (async () => {
      try {
        setLoadingLocal(true);
        const res = await listTopping();
        setToppings(res);
      } catch (err) {
        console.error("Không thể tải danh sách topping:", err);
        alert("Không thể tải danh sách topping từ server!");
      } finally {
        setLoadingLocal(false);
      }
    })();
  }, [setToppings]);

  // 🧩 Hàm xoá topping
  const handleDeleteTopping = async (id) => {
    try {
      await deleteTopping(id);
      setToppings((prev) => prev.filter((t) => t.id !== id));
      alert("Xóa topping thành công!");
    } catch (err) {
      alert("Lỗi khi xóa topping: " + (err.message || "Không xác định"));
    }
  };

  // 🔹 Format giá tiền VNĐ
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Salad className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Quản Lý Topping
            </h3>
            <p className="text-sm text-neutral-600">
              Quản lý các loại topping cho món ăn
            </p>
          </div>
        </div>

        {/* Nút thêm topping */}
        <button
          onClick={() => {
            setEditingItem(null);
            setIsEditingTopping(true);
          }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm Topping
        </button>
      </div>

      {/* Bảng danh sách topping */}
      <div className="bg-white/70 backdrop-blur rounded-2xl shadow border border-neutral-200 overflow-hidden">
        <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 px-6 py-4 border-b border-neutral-200">
          <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-neutral-700">
            <div>Tên topping</div>
            <div>Giá</div>
            <div>Calories</div>
            <div>Gram</div>
            <div className="col-span-2">Hành động</div>
          </div>
        </div>

        <div className="divide-y divide-neutral-200">
          {loading || loadingLocal ? (
            <div className="p-6 text-neutral-500">Đang tải danh sách...</div>
          ) : toppings.length === 0 ? (
            <div className="p-6 text-neutral-500">Chưa có topping nào.</div>
          ) : (
            toppings.map((topping) => (
              <div
                key={topping.id}
                className="px-6 py-4 hover:bg-neutral-50 transition-colors"
              >
                <div className="grid grid-cols-6 gap-4 items-center">
                  <div className="font-medium text-neutral-900 truncate">
                    {topping.name}
                  </div>
                  <div className="text-green-600 font-semibold">
                    {formatPrice(topping.price)}
                  </div>
                  <div className="text-neutral-600">{topping.calories}</div>
                  <div className="text-neutral-600">{topping.gram}</div>

                  {/* Hành động */}
                  <div className="flex gap-2 items-center col-span-2">
                    <button
                      onClick={() => {
                        setEditingItem(topping);
                        setIsEditingTopping(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirmingId === topping.id) {
                          handleDeleteTopping(topping.id);
                          setConfirmingId(null);
                        } else {
                          setConfirmingId(topping.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      {confirmingId === topping.id ? (
                        "Xác nhận?"
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>

                    {confirmingId === topping.id && (
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="ml-2 text-neutral-500 hover:text-neutral-700 text-sm"
                      >
                        Huỷ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { listDish } from "../../lib/apiDish";
import {
  listDailyPlans,
  createDailyPlan,
  updateDailyPlan,
  ITEM_TYPES,
} from "../../lib/apiDailyPlan";
import { getCurrentUser } from "../../lib/auth";
import { Plus, Minus, Send, Pencil, Clock } from "lucide-react";

export default function ChefDailyPlan() {
  const [dishes, setDishes] = useState([]);
  const [plans, setPlans] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  // ✅ Lấy ngày hôm nay theo giờ Việt Nam (Asia/Ho_Chi_Minh)
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  const user = getCurrentUser();
  const staffId = user?.staffId || user?.id;

  // 🧩 Load danh sách món ăn + kế hoạch hôm nay
  useEffect(() => {
    (async () => {
      try {
        const [dishList, planList] = await Promise.all([
          listDish(),
          listDailyPlans(),
        ]);

        const todayPlans = planList.filter(
          (p) => p.planDate === today && p.staffId === staffId,
        );

        const mapped = {};
        todayPlans.forEach((p) => (mapped[p.itemId] = p.plannedQuantity));

        setDishes(dishList);
        setPlans(todayPlans);
        setQuantities(mapped);
      } catch (err) {
        console.error("❌ Lỗi khi tải kế hoạch:", err);
      }
    })();
  }, [staffId, today]);

  // 🧩 Tăng / giảm số lượng
  const handleQuantityChange = (dishId, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [dishId]: Math.max(0, (prev[dishId] || 0) + delta),
    }));
  };

  // 🧩 Cho phép nhập trực tiếp
  const handleQuantityInput = (dishId, value) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 0) return;
    setQuantities((prev) => ({ ...prev, [dishId]: parsed }));
  };

  // 🧩 Gửi hoặc chỉnh sửa kế hoạch
  const handleSubmitOrEdit = async (dishId) => {
    const qty = quantities[dishId] || 0;
    if (qty <= 0) return alert("Vui lòng chọn số lượng hợp lệ!");
    setLoadingId(dishId);

    try {
      const existing = plans.find((p) => p.itemId === dishId);

      if (existing) {
        // 🟡 Cập nhật (ghi đè)
        await updateDailyPlan(existing.planId, {
          plannedQuantity: qty,
          remainingQuantity: qty,
        });
        alert("✅ Đã cập nhật yêu cầu thành công!");
      } else {
        // 🟢 Tạo mới kế hoạch
        await createDailyPlan({
          itemId: dishId,
          itemType: ITEM_TYPES.DISH,
          plannedQuantity: qty,
          planDate: today,
          staffId,
        });
        alert("✅ Đã gửi yêu cầu thành công!");
      }

      // Reload lại dữ liệu sau khi gửi
      const refreshed = await listDailyPlans();
      setPlans(
        refreshed.filter((p) => p.planDate === today && p.staffId === staffId),
      );
    } catch (err) {
      console.error("❌", err);
      alert("Lỗi khi gửi yêu cầu, vui lòng thử lại!");
    } finally {
      setLoadingId(null);
    }
  };

  // 🧩 Xác định trạng thái từng món
  const getPlanState = (dishId) => {
    const plan = plans.find((p) => p.itemId === dishId);
    if (!plan) return "none";
    if (plan.status) return "approved";
    return "pending";
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <h3 className="text-xl font-bold mb-6 text-neutral-900">
        Lên Kế Hoạch Trong Ngày
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dishes.map((dish) => {
          const planState = getPlanState(dish.id);
          const qty = quantities[dish.id] || 0;

          // Ẩn món đã được duyệt (đã phê duyệt)
          if (planState === "approved") return null;

          const isEditing = planState === "pending";
          const buttonLabel = isEditing ? "Chỉnh sửa yêu cầu" : "Gửi yêu cầu";

          return (
            <div
              key={dish.id}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Tên món */}
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-neutral-900">{dish.name}</h4>
                <span className="text-xs text-neutral-500">
                  {dish.category}
                </span>
              </div>

              {/* Nhập số lượng */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Số lượng:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(dish.id, -1)}
                    disabled={loadingId === dish.id}
                    className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <input
                    type="number"
                    value={qty}
                    min="0"
                    onChange={(e) =>
                      handleQuantityInput(dish.id, e.target.value)
                    }
                    className="w-14 text-center font-semibold border rounded-lg border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    disabled={loadingId === dish.id}
                  />

                  <button
                    onClick={() => handleQuantityChange(dish.id, 1)}
                    disabled={loadingId === dish.id}
                    className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center hover:bg-green-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Nút gửi yêu cầu */}
              <button
                onClick={() => handleSubmitOrEdit(dish.id)}
                disabled={loadingId === dish.id}
                className={`w-full py-2 rounded-xl text-white font-medium transition-all ${
                  isEditing
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500"
                }`}
              >
                {loadingId === dish.id ? (
                  <span>Đang xử lý...</span>
                ) : isEditing ? (
                  <>
                    <Pencil className="inline h-4 w-4 mr-1" /> {buttonLabel}
                  </>
                ) : (
                  <>
                    <Send className="inline h-4 w-4 mr-1" /> {buttonLabel}
                  </>
                )}
              </button>

              {/* Hiển thị trạng thái chờ duyệt */}
              {isEditing && (
                <div className="mt-2 flex items-center gap-2 text-blue-600 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Đang chờ phê duyệt...</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

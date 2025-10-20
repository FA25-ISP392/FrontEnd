import { useState, useEffect } from "react";
import { listDish } from "../../lib/apiDish";
import {
  listDailyPlans,
  createDailyPlansBatch,
  ITEM_TYPES,
} from "../../lib/apiDailyPlan";
import { getCurrentUser } from "../../lib/auth";
import { Plus, Minus, Send, Clock } from "lucide-react";

export default function ChefDailyPlan() {
  const [dishes, setDishes] = useState([]);
  const [plans, setPlans] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ✅ Lấy ngày hiện tại theo giờ Việt Nam
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
  const user = getCurrentUser();
  const staffId = user?.staffId || user?.id;

  // 🧩 Load danh sách món + kế hoạch hôm nay
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
        if (todayPlans.length > 0) setIsSubmitted(true);
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

  // 🧩 Gửi tất cả món 1 lần
  const handleSubmitAll = async () => {
    const selected = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([dishId, qty]) => ({
        itemId: Number(dishId),
        itemType: ITEM_TYPES.DISH,
        plannedQuantity: qty,
        planDate: today,
        staffId,
      }));

    if (selected.length === 0) {
      alert("Vui lòng chọn ít nhất 1 món có số lượng > 0!");
      return;
    }

    setLoading(true);
    try {
      await createDailyPlansBatch(selected);
      alert("✅ Đã gửi kế hoạch tổng! Đang chờ duyệt...");
      setIsSubmitted(true);
    } catch (err) {
      console.error("❌ Lỗi gửi kế hoạch tổng:", err);
      alert("Gửi kế hoạch thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Kiểm tra món đã gửi (đang chờ duyệt)
  const isPending = (dishId) => {
    return plans.some((p) => p.itemId === dishId && !p.status);
  };

  // 🧩 Kiểm tra món đã được duyệt
  const isApproved = (dishId) => {
    return plans.some((p) => p.itemId === dishId && p.status);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <h3 className="text-xl font-bold mb-6 text-neutral-900">
        Lên Kế Hoạch Trong Ngày
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {dishes.map((dish) => {
          const qty = quantities[dish.id] || 0;
          const disabled = loading || isSubmitted || isApproved(dish.id);

          return (
            <div
              key={dish.id}
              className={`rounded-xl p-4 border shadow-sm ${
                isApproved(dish.id)
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-neutral-900">{dish.name}</h4>
                <span className="text-xs text-neutral-500">
                  {dish.category}
                </span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Số lượng:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(dish.id, -1)}
                    disabled={disabled}
                    className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 disabled:opacity-40"
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
                    disabled={disabled}
                    className="w-14 text-center font-semibold border rounded-lg border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500"
                  />

                  <button
                    onClick={() => handleQuantityChange(dish.id, 1)}
                    disabled={disabled}
                    className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center hover:bg-green-200 disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {isApproved(dish.id) && (
                <div className="text-green-600 text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Đã được duyệt</span>
                </div>
              )}

              {isPending(dish.id) && (
                <div className="text-blue-600 text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Đang chờ phê duyệt...</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isSubmitted && (
        <button
          onClick={handleSubmitAll}
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 transition-all"
        >
          {loading ? (
            "Đang gửi kế hoạch..."
          ) : (
            <>
              <Send className="inline w-5 h-5 mr-2" /> Gửi kế hoạch tổng
            </>
          )}
        </button>
      )}
    </div>
  );
}

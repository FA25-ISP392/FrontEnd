import { useEffect, useState } from "react";
import {
  listDailyPlans,
  updateDailyPlan,
  approveAllDailyPlans,
} from "../../lib/apiDailyPlan";

export default function ManagerDailyPlan() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  // 🧩 Load kế hoạch chưa duyệt
  useEffect(() => {
    (async () => {
      const data = await listDailyPlans();
      setPlans(data.filter((p) => p.planDate === today && !p.status));
    })();
  }, [today]);

  // 🧩 Cập nhật số lượng từng món
  const handleQuantityChange = (planId, value) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.planId === planId ? { ...p, plannedQuantity: Number(value) } : p,
      ),
    );
  };

  const handleUpdateQuantity = async (plan) => {
    try {
      await updateDailyPlan(plan.planId, {
        plannedQuantity: plan.plannedQuantity,
        remainingQuantity: plan.plannedQuantity,
      });
      alert(`✅ Đã cập nhật số lượng cho "${plan.itemName}"`);
    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
      alert("Không thể cập nhật số lượng!");
    }
  };

  // ✅ Duyệt tất cả
  const handleApproveAll = async () => {
    if (!window.confirm("Xác nhận duyệt toàn bộ kế hoạch hôm nay?")) return;
    setLoading(true);
    try {
      await approveAllDailyPlans(plans);
      alert("✅ Đã duyệt toàn bộ kế hoạch!");
      setPlans([]);
    } catch (err) {
      console.error("❌ Lỗi duyệt tổng:", err);
      alert("Không thể duyệt toàn bộ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-neutral-900">
        Duyệt Kế Hoạch Trong Ngày
      </h2>

      {plans.length === 0 ? (
        <p className="text-gray-500 italic">Không có kế hoạch chờ duyệt.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {plans.map((p) => (
              <div
                key={p.planId}
                className="bg-white p-4 rounded-xl shadow border hover:shadow-md transition-all"
              >
                <h4 className="font-semibold mb-1">{p.itemName}</h4>
                <p className="text-sm text-gray-500 mb-2">
                  Món: <span className="font-medium">{p.itemType}</span>
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="number"
                    value={p.plannedQuantity}
                    min="0"
                    onChange={(e) =>
                      handleQuantityChange(p.planId, e.target.value)
                    }
                    className="border rounded-md px-2 py-1 w-20 text-center"
                  />
                  <button
                    onClick={() => handleUpdateQuantity(p)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleApproveAll}
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 transition-all"
          >
            {loading ? "Đang duyệt..." : "✅ Duyệt toàn bộ kế hoạch"}
          </button>
        </>
      )}
    </div>
  );
}

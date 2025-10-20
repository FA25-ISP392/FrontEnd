import { useEffect, useState } from "react";
import {
  listDailyPlans,
  updateDailyPlan,
  deleteDailyPlan,
} from "../../lib/apiDailyPlan";

export default function ManagerDailyPlan() {
  const [plans, setPlans] = useState([]);

  // ✅ Lấy ngày hiện tại theo giờ Việt Nam
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  // 🧩 Load danh sách kế hoạch chờ duyệt
  useEffect(() => {
    (async () => {
      const data = await listDailyPlans();
      setPlans(data.filter((p) => p.planDate === today && !p.status));
    })();
  }, [today]);

  // 🟢 Duyệt món
  const handleApprove = async (plan) => {
    try {
      await updateDailyPlan(plan.planId, { status: true });
      alert(`Đã duyệt "${plan.itemName}"`);
      setPlans((prev) => prev.filter((p) => p.planId !== plan.planId));
    } catch (err) {
      console.error("❌ Lỗi duyệt:", err);
      alert("Không thể duyệt món này!");
    }
  };

  // 🔴 Từ chối món (và xoá)
  const handleReject = async (plan) => {
    if (!window.confirm(`Từ chối "${plan.itemName}"?`)) return;
    try {
      await deleteDailyPlan(plan.planId);
      alert(`Đã từ chối và xoá "${plan.itemName}"`);
      setPlans((prev) => prev.filter((p) => p.planId !== plan.planId));
    } catch (err) {
      console.error("❌ Lỗi từ chối:", err);
      alert("Không thể xoá kế hoạch!");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-neutral-900">
        Yêu Cầu Kế Hoạch Trong Ngày
      </h2>

      {/* Danh sách kế hoạch */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div
            key={p.planId}
            className="bg-white p-4 rounded-xl shadow border hover:shadow-md transition-all"
          >
            <h4 className="font-semibold mb-1">{p.itemName}</h4>
            <p className="text-sm text-gray-600 mb-3">
              Số lượng: {p.plannedQuantity}
            </p>
            <div className="flex gap-2 justify-between">
              <button
                onClick={() => handleApprove(p)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
              >
                Duyệt
              </button>
              <button
                onClick={() => handleReject(p)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Từ chối
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

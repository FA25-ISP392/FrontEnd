import { useEffect, useState } from "react";
import { listDailyPlans } from "../../lib/apiDailyPlan";
import { CheckCircle } from "lucide-react";

export default function ChefDailyDishes() {
  const [approvedPlans, setApprovedPlans] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await listDailyPlans();
      const today = new Date().toISOString().split("T")[0];
      setApprovedPlans(
        res.filter((p) => p.status === true && p.planDate === today),
      );
    })();
  }, []);

  return (
    <div className="bg-white/80 rounded-2xl p-6 shadow-lg border border-white/20">
      <h3 className="text-xl font-bold mb-4 text-neutral-900">
        Món Trong Ngày (Đã Được Duyệt)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {approvedPlans.map((p) => (
          <div
            key={p.id}
            className="bg-green-50 border border-green-200 rounded-xl p-4"
          >
            <h4 className="font-semibold text-green-700">{p.itemName}</h4>
            <p className="text-sm text-neutral-600">
              Số lượng: {p.plannedQuantity}
            </p>
            <div className="flex items-center gap-2 mt-2 text-green-700 text-sm">
              <CheckCircle className="h-4 w-4" />
              Đã được {p.approverName || "Manager"} duyệt
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

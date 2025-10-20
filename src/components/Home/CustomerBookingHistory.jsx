import { useEffect, useMemo, useState } from "react";
import { X, Edit3 } from "lucide-react";
import {
  getBookingHistory,
  cancelBooking,
  updateBooking1,
} from "../../lib/apiBooking";
import { fmtVNDateTime } from "../../lib/datetimeBooking";
import CustomerBookingEditModal from "./CustomerBookingEditModal";

const statusBadge = (status) => {
  const s = String(status || "PENDING").toUpperCase();
  const map = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECT: "bg-red-100 text-red-800",
    REJECTED: "bg-red-100 text-red-800",
    CANCELLED: "bg-neutral-200 text-neutral-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs ${
        map[s] || "bg-gray-100 text-gray-700"
      }`}
    >
      {s}
    </span>
  );
};

const tableName = (id) => (id || id === 0 ? `Table ${id}` : "-");

export default function CustomerBookingHistory({ isOpen, onClose, userInfo }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null);
  const customerId = useMemo(() => {
    return (
      userInfo?.id ||
      userInfo?.customerId ||
      userInfo?.customer?.id ||
      userInfo?.userId ||
      null
    );
  }, [userInfo]);

  useEffect(() => {
    if (!isOpen) return;
    if (!customerId) {
      setErr("Thiếu customerId.");
      return;
    }
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const list = await getBookingHistory(customerId);
        setItems(list);
      } catch (e) {
        setErr(e.message || "Không thể tải lịch sử đặt bàn");
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, customerId]);

  const refresh = async () => {
    if (!customerId) return;
    const list = await getBookingHistory(customerId);
    setItems(list);
  };

  const handleCancel = async (id) => {
    if (!confirm("Bạn có chắc muốn hủy đơn này không?")) return;
    console.log("[UI] Click hủy đơn:", id);
    try {
      const after = await cancelBooking(id);
      console.log("[API] Cancel ok, server trả:", after);
      await refresh();
    } catch (e) {
      console.error("Cancel booking failed:", {
        message: e?.message,
        status: e?.status,
        url: e?.url,
        data: e?.data,
      });
      alert(e.message || "Hủy đơn thất bại.");
    }
  };

  const handleUpdateBooking = async (id, form) => {
    try {
      await updateBooking1(id, form);
      await refresh();
      setEditing(null);
    } catch (e) {
      alert(e.message || "Cập nhật thất bại.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-neutral-900">
              Lịch sử đặt bàn
            </h2>
            <button
              className="p-2 hover:bg-neutral-100 rounded-lg"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-neutral-500">Đang tải...</div>
            ) : err ? (
              <div className="bg-red-50 text-red-700 rounded-lg p-3">{err}</div>
            ) : items.length === 0 ? (
              <div className="text-neutral-500">
                Bạn chưa có đơn đặt bàn nào.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-orange-50 text-neutral-900">
                    <tr>
                      <th className="px-4 py-2 text-left">STT</th>
                      <th className="px-4 py-2 text-center">Số Người</th>
                      <th className="px-4 py-2 text-center">Bàn Mong Muốn</th>
                      <th className="px-4 py-2 text-center">Thời Gian Tới</th>
                      <th className="px-4 py-2 text-center">Trạng Thái</th>
                      <th className="px-4 py-2 text-center">Bàn Được Gán</th>
                      <th className="px-4 py-2 text-center">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((b, i) => {
                      const st = String(b.status || "PENDING").toUpperCase();
                      const editable = st === "PENDING";
                      return (
                        <tr key={b.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-2">{i + 1}</td>
                          <td className="px-4 py-2 text-center">{b.seat}</td>
                          <td className="px-4 py-2 text-center">
                            {b.preferredTable
                              ? tableName(b.preferredTable)
                              : "-"}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {fmtVNDateTime(b.bookingDate)}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {statusBadge(st)}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {b.assignedTableId
                              ? tableName(b.assignedTableId)
                              : "-"}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              disabled={!editable}
                              onClick={() => {
                                console.log(
                                  "[UI] Open Edit modal for booking:",
                                  b.id
                                );
                                setEditing(b);
                              }}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                                editable
                                  ? "text-blue-600 hover:bg-blue-50"
                                  : "text-neutral-400 cursor-not-allowed"
                              }`}
                              title="Yêu cầu hủy / đổi bàn mong muốn"
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <CustomerBookingEditModal
        open={!!editing}
        booking={editing}
        onClose={() => setEditing(null)}
        onCancelBooking={handleCancel}
        onUpdateBooking={handleUpdateBooking}
      />
    </div>
  );
}

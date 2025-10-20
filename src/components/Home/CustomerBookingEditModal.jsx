import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function CustomerBookingEditModal({
  open = false,
  booking = null,
  onClose = () => {},
  onCancelBooking = async () => {},
  onUpdateBooking = async () => {},
  saving = false,
}) {
  const [form, setForm] = useState({
    wantTable: "",
    guests: 1,
    date: "",
    time: "",
  });

  useEffect(() => {
    if (!open || !booking) return;
    setForm({
      wantTable: booking?.preferredTable || "",
      guests: booking?.seat || 1,
      date: booking
        ? new Date(booking.bookingDate).toISOString().slice(0, 10)
        : "",
      time: booking
        ? new Date(booking.bookingDate).toLocaleTimeString("vi-VN", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
    });
  }, [open, booking]);
  if (!open || !booking) return null;

  const editable = String(booking.status || "").toUpperCase() === "PENDING";
  const canCancel = editable;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await onUpdateBooking(booking.id, form);
      alert("Cập nhật thành công!");
      onClose();
    } catch (e) {
      alert(e.message || "Không thể cập nhật đơn.");
    }
  };

  const handleCancel = async () => {
    try {
      console.log("[UI] Hủy đơn:", booking.id);
      await onCancelBooking(booking.id);
      alert("Đã hủy đơn thành công!");
      onClose();
    } catch (e) {
      console.error("Cancel booking failed:", e);
      alert(e.message || "Hủy đơn thất bại.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-2xl">
          <h3 className="text-lg font-bold">Chỉnh sửa đơn đặt #{booking.id}</h3>
          <button
            className="p-2 hover:bg-white/20 rounded-lg"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm text-neutral-700">
          <p>
            Bạn có thể chỉnh sửa thông tin đặt bàn khi đơn đang{" "}
            <b className="text-yellow-600">chờ duyệt</b>. Sau khi được duyệt,
            bạn không thể thay đổi nữa.
          </p>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Bàn mong muốn
            </label>
            <select
              name="wantTable"
              value={form.wantTable}
              onChange={handleChange}
              disabled={!editable}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100"
            >
              <option value="">Không có yêu cầu đặc biệt</option>
              <option value="1">Bàn 1 (2 người)</option>
              <option value="2">Bàn 2 (2 người)</option>
              <option value="3">Bàn 3 (4 người)</option>
              <option value="4">Bàn 4 (4 người)</option>
              <option value="5">Bàn 5 (6 người)</option>
              <option value="6">Bàn 6 (6 người)</option>
              <option value="7">Bàn 7 (8 người)</option>
              <option value="8">Bàn 8 (8 người)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">
              Số người
            </label>
            <input
              type="number"
              name="guests"
              min="1"
              max="8"
              value={form.guests}
              onChange={handleChange}
              disabled={!editable}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Ngày đến
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                disabled={!editable}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Giờ đến
              </label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                disabled={!editable}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="pt-4 border-t flex items-center justify-between">
            <div className="text-xs text-neutral-500">
              Trạng thái hiện tại: <b>{booking.status}</b>
            </div>
            <div className="flex gap-2">
              <button
                disabled={saving || !canCancel}
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm disabled:opacity-50"
              >
                Hủy đơn
              </button>
              <button
                disabled={!editable || saving}
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-50"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

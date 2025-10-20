import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { isoToVNParts, buildISOFromVN } from "../../lib/datetimeBooking";

export default function BookingEditModal({
  open = false,
  booking = null,
  onClose = () => {},
  onSave = async () => {},
  saving = false,
}) {
  const [seat, setSeat] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const clamp = (v, lo = 1, hi = 8) => Math.max(lo, Math.min(hi, v | 0 || lo));
  const pad = (n) => String(n).padStart(2, "0");
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(
    today.getDate()
  )}`;
  const nowHM = `${pad(today.getHours())}:${pad(today.getMinutes())}`;

  useEffect(() => {
    if (!open || !booking) return;
    setSeat(Number(booking.seat || 1));
    const { date: d, time: t } = isoToVNParts(booking.bookingDate);
    setDate(d);
    setTime(t);
  }, [open, booking]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const seatNum = Number(seat) || 1;
    if (seatNum < 1 || seatNum > 8) {
      alert("Số người phải trong khoảng 1–8.");
      return;
    }
    const iso = buildISOFromVN(date, time);
    if (new Date(iso).getTime() < Date.now()) {
      alert("Thời điểm đến không được ở quá khứ.");
      return;
    }
    const payload = {
      id: booking.id,
      seat: seatNum,
      bookingDate: iso,
    };
    await onSave(payload);
  };

  if (!open || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl border border-white/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">Chỉnh sửa đơn đặt bàn</h3>
              <p className="text-orange-100 text-sm">
                Cập nhật thông tin đặt bàn cho khách hàng
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thông tin khách hàng */}
            <div className="bg-gradient-to-r from-neutral-50 to-orange-50 rounded-xl p-4 border border-neutral-200">
              <h4 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Thông tin khách hàng
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Tên khách hàng
                  </label>
                  <input
                    disabled
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 bg-neutral-100 text-neutral-700 text-sm"
                    value={booking.customerName || ""}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    disabled
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 bg-neutral-100 text-neutral-700 text-sm"
                    value={booking.phone || "Chưa cập nhật"}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Email
                  </label>
                  <input
                    disabled
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 bg-neutral-100 text-neutral-700 text-sm"
                    value={booking.email || "Chưa cập nhật"}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Thông tin có thể chỉnh sửa */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
              <h4 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Thông tin có thể chỉnh sửa
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Số người *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    className="w-full rounded-lg border border-orange-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
                    value={seat}
                    onChange={(e) => setSeat(clamp(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Ngày đến *
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-orange-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={todayStr}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Giờ đến *
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-lg border border-orange-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    min={date === todayStr ? nowHM : undefined}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-lg border border-neutral-300 hover:bg-neutral-100 transition-colors duration-200 font-medium text-neutral-700"
                disabled={saving}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 disabled:opacity-60 transition-all duration-200 font-medium shadow-lg flex items-center gap-2"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

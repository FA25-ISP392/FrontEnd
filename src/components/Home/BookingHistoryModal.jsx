import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function BookingHistoryModal({ isOpen, onClose, userInfo }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userInfo) {
      fetchBookingHistory();
    }
  }, [isOpen, userInfo]);

  const fetchBookingHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const history = await getBookingHistory(userInfo.id);
      setBookings(history);
    } catch (err) {
      setError(err.message || "Không thể tải lịch sử đặt bàn");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "PENDING":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "Đã xác nhận";
      case "CANCELLED":
        return "Đã hủy";
      case "PENDING":
        return "Chờ xác nhận";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "text-green-600 bg-green-50";
      case "CANCELLED":
        return "text-red-600 bg-red-50";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 transition-opacity duration-300">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Lịch sử đặt bàn
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-gray-600">Đang tải...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {!loading && !error && bookings.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có lịch sử đặt bàn
                </h3>
                <p className="text-gray-500">
                  Bạn chưa có lịch sử đặt bàn nào. Hãy thử đặt bàn để trải
                  nghiệm dịch vụ của chúng tôi!
                </p>
              </div>
            )}

            {!loading && !error && bookings.length > 0 && (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        Mã đặt bàn: #{booking.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        <div>
                          <p className="text-sm text-gray-500">Ngày</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(booking.date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <div>
                          <p className="text-sm text-gray-500">Giờ</p>
                          <p className="font-medium text-gray-900">
                            {formatTime(booking.time)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-orange-500" />
                        <div>
                          <p className="text-sm text-gray-500">Số khách</p>
                          <p className="font-medium text-gray-900">
                            {booking.guests} người
                          </p>
                        </div>
                      </div>

                      {booking.preferredTable && (
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <div>
                            <p className="text-sm text-gray-500">
                              Bàn ưa thích
                            </p>
                            <p className="font-medium text-gray-900">
                              Bàn {booking.preferredTable}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {booking.specialRequests && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">
                          Yêu cầu đặc biệt
                        </p>
                        <p className="text-sm text-gray-700">
                          {booking.specialRequests}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Đặt lúc:{" "}
                        {new Date(booking.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

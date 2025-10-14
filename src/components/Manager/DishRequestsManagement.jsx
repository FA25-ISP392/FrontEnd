import { useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  UtensilsCrossed,
  User,
  Calendar,
  AlertCircle,
  Filter,
} from "lucide-react";

export default function DishRequestsManagement({
  requests,
  onApproveRequest,
  onRejectRequest,
}) {
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected

  const filteredRequests = requests.filter((request) => {
    if (filter === "all") return true;
    return request.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "from-yellow-500 to-orange-500";
      case "approved":
        return "from-green-500 to-emerald-500";
      case "rejected":
        return "from-red-500 to-rose-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      default:
        return "Không xác định";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return Clock;
      case "approved":
        return CheckCircle;
      case "rejected":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
          <UtensilsCrossed className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Quản Lý Yêu Cầu Món Ăn
          </h3>
          <p className="text-sm text-neutral-600">
            Duyệt các yêu cầu thay đổi số lượng món ăn từ Chef
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "all", label: "Tất cả", count: requests.length },
          {
            key: "pending",
            label: "Chờ duyệt",
            count: requests.filter((r) => r.status === "pending").length,
          },
          {
            key: "approved",
            label: "Đã duyệt",
            count: requests.filter((r) => r.status === "approved").length,
          },
          {
            key: "rejected",
            label: "Từ chối",
            count: requests.filter((r) => r.status === "rejected").length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
              filter === tab.key
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                : "bg-white/80 text-neutral-600 hover:bg-white hover:text-neutral-900"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                filter === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Summary Alert */}
      {requests.filter((r) => r.status === "pending").length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6 border border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h4 className="font-semibold text-neutral-900">
              Yêu cầu mới cần duyệt
            </h4>
          </div>
          <p className="text-sm text-neutral-600">
            Chef đã gửi {requests.filter((r) => r.status === "pending").length}{" "}
            yêu cầu thay đổi số lượng món ăn vào ngày hôm nay
          </p>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-neutral-500 font-medium">
              {filter === "all"
                ? "Không có yêu cầu nào"
                : `Không có yêu cầu ${getStatusText(filter)}`}
            </p>
            <p className="text-sm text-neutral-400 mt-1">
              Yêu cầu từ Chef sẽ hiển thị ở đây
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const StatusIcon = getStatusIcon(request.status);
            return (
              <div
                key={request.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${getStatusColor(
                        request.status,
                      )} rounded-lg flex items-center justify-center`}
                    >
                      <StatusIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors duration-300">
                        {request.dishName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-neutral-400" />
                        <span className="text-sm text-neutral-600">
                          {request.chefName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(
                      request.status,
                    )} text-white`}
                  >
                    {getStatusText(request.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className={`h-4 w-4 text-blue-600`} />
                      <span className="text-sm font-medium text-blue-800">
                        Ngày gửi
                      </span>
                    </div>
                    <p className="font-semibold text-blue-900">
                      {request.date}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
                    <div className="flex items-center gap-2 mb-1">
                      <UtensilsCrossed className={`h-4 w-4 text-orange-600`} />
                      <span className="text-sm font-medium text-orange-800">
                        Số lượng yêu cầu
                      </span>
                    </div>
                    <p className="font-semibold text-orange-900">
                      {request.requestedQuantity}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className={`h-4 w-4 text-gray-600`} />
                      <span className="text-sm font-medium text-gray-800">
                        Thời gian
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {new Date(
                        request.createdAt || Date.now(),
                      ).toLocaleTimeString("vi-VN")}
                    </p>
                  </div>
                </div>

                {request.status === "pending" && (
                  <div className="flex gap-3 pt-4 border-t border-neutral-100">
                    <button
                      onClick={() => onApproveRequest(request.id)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-4 rounded-xl transition-all duration-300 font-medium flex items-center justify-center gap-2 hover:scale-105"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Phê Duyệt
                    </button>
                    <button
                      onClick={() => onRejectRequest(request.id)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white py-3 px-4 rounded-xl transition-all duration-300 font-medium flex items-center justify-center gap-2 hover:scale-105"
                    >
                      <XCircle className={`h-4 w-4`} />
                      Từ Chối
                    </button>
                  </div>
                )}

                {request.status !== "pending" && (
                  <div className="pt-4 border-t border-neutral-100">
                    <div className="flex items-center gap-2 text-sm">
                      <StatusIcon className="h-4 w-4" />
                      <span
                        className={
                          request.status === "approved"
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        Yêu cầu đã được{" "}
                        {request.status === "approved"
                          ? "phê duyệt"
                          : "từ chối"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Tổng yêu cầu",
              value: requests.length,
              color: "text-gray-700",
              icon: UtensilsCrossed,
            },
            {
              label: "Chờ duyệt",
              value: requests.filter((r) => r.status === "pending").length,
              color: "text-yellow-700",
              icon: Clock,
            },
            {
              label: "Đã duyệt",
              value: requests.filter((r) => r.status === "approved").length,
              color: "text-green-700",
              icon: CheckCircle,
            },
            {
              label: "Từ chối",
              value: requests.filter((r) => r.status === "rejected").length,
              color: "text-red-700",
              icon: XCircle,
            },
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">{stat.label}</p>
                  <p className={`font-semibold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { Check, X, Edit, Calendar } from "lucide-react";
import { useState } from "react";
import { fmtVNDateTime } from "../../lib/datetimeBooking";
import TableLayout from "./TableLayout";
import TableAssignmentModal from "./TableAssignmentModal";
import TableBookingsModal from "./TableBookingsModal";
import {
  approveBookingWithTable,
  listBookingsByTableDate,
} from "../../lib/apiBooking";

export default function BookingManagement({
  bookings = [],
  setBookings,
  setIsEditingBooking,
  setEditingItem,
  loading = false,
  deletingIds = new Set(),
  page = 1,
  pageInfo = { page: 1, size: 6, totalPages: 1, totalElements: 0 },
  onPageChange = () => {},
  onApprove,
  onReject,
  onEdit,
  tables = [],
  onAssignTable,
  statusFilter = "ALL",
  onStatusChange = () => {},
}) {
  const [confirmingId, setConfirmingId] = useState(null);
  const [showTableAssignment, setShowTableAssignment] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [showTableBookings, setShowTableBookings] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const { totalPages, totalElements, size: pageSize } = pageInfo;
  const [tableBookings, setTableBookings] = useState([]);
  const [tableBookingsDate, setTableBookingsDate] = useState(() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
  const [loadingTableBookings, setLoadingTableBookings] = useState(false);

  async function fetchTableBookings(tableId, dateStr) {
    setLoadingTableBookings(true);
    try {
      const items = await listBookingsByTableDate(tableId, dateStr);
      setTableBookings(items);
    } catch (e) {
      console.error(e);
      setTableBookings([]);
    } finally {
      setLoadingTableBookings(false);
    }
  }

  const buildPages = () => {
    const maxLength = 5;
    if (totalPages <= maxLength) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const left = Math.max(1, page - 2);
    const right = Math.min(totalPages, page + 2);
    const pages = [];
    if (left > 1) pages.push(1, "…");
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < totalPages) pages.push("…", totalPages);
    return pages;
  };

  const from = totalElements === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalElements);

  const handleApprove = (booking) => {
    setSelectedBooking(booking);
    setShowTableAssignment(true);
  };

  const handleAssignTable = async (bookingId, tableId) => {
    try {
      await onAssignTable?.(bookingId, tableId);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: "APPROVED", assignedTableId: tableId }
            : b
        )
      );
      setShowTableAssignment(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error("Lỗi khi gán bàn:", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Không thể gán bàn cho đơn đặt."
      );
    }
  };

  const handleTableClick = (tableId) => {
    setSelectedTableId(tableId);
    const table = tables.find((t) => t.id === tableId);
    if (table) {
      setSelectedTable(table);
      setShowTableBookings(true);
      fetchTableBookings(table.id, tableBookingsDate);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "REJECT" } : b))
      );
      await onReject?.(bookingId);
    } catch (error) {
      console.error("Lỗi khi từ chối đặt bàn:", error);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "PENDING" } : b))
      );
    }
  };

  const handleEdit = (booking) => {
    setEditingItem?.(booking);
    setIsEditingBooking?.(true);
  };

  const tableNameById = (id) => {
    if (!id && id !== 0) return "-";
    const t = tables.find((x) => String(x.id) === String(id));
    const name = t?.name || `Table ${id}`;
    return String(name).replace(/^Bàn\s*/i, "Table ");
  };

  return (
    <div className="space-y-6">
      <TableLayout
        tables={tables}
        onTableClick={handleTableClick}
        selectedTableId={selectedTableId}
      />

      <div className="bg-white/80 rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              Danh sách đơn đặt bàn
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span className="text-sm font-medium text-neutral-700">
                  Lọc theo trạng thái:
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[
                  {
                    value: "ALL",
                    label: "Tất Cả",
                    color:
                      "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                    activeColor: "bg-neutral-600 text-white",
                  },
                  {
                    value: "PENDING",
                    label: "Chờ Duyệt",
                    color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
                    activeColor: "bg-yellow-500 text-white",
                  },
                  {
                    value: "APPROVED",
                    label: "Chấp Nhận",
                    color: "bg-green-100 text-green-700 hover:bg-green-200",
                    activeColor: "bg-green-500 text-white",
                  },
                  {
                    value: "REJECTED",
                    label: "Từ Chối",
                    color: "bg-red-100 text-red-700 hover:bg-red-200",
                    activeColor: "bg-red-500 text-white",
                  },
                  {
                    value: "CANCELLED",
                    label: "Đã Hủy",
                    color: "bg-gray-100 text-gray-700 hover:bg-gray-200",
                    activeColor: "bg-gray-500 text-white",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onStatusChange(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                      statusFilter === option.value
                        ? option.activeColor
                        : option.color
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-neutral-700">
            <div className="col-span-2">Tên Khách Hàng</div>
            <div className="col-span-2">Số Điện Thoại</div>
            <div className="col-span-2">Email</div>
            <div className="col-span-1">Số Người</div>
            <div className="col-span-1">Bàn Mong Muốn</div>
            <div className="col-span-2">Thời gian tới</div>
            <div className="col-span-1">Bàn được gán</div>
            <div className="col-span-1">Hành Động</div>
          </div>
        </div>

        <div className="divide-y divide-neutral-200">
          {loading ? (
            <div className="p-6 text-neutral-500">Đang tải danh sách...</div>
          ) : bookings.length === 0 ? (
            <div className="p-6 text-neutral-500">
              Chưa có yêu cầu đặt bàn nào.
            </div>
          ) : (
            bookings.map((b) => {
              const status = String(b.status || "PENDING").toUpperCase();
              const isLocked = [
                "APPROVED",
                "REJECT",
                "REJECTED",
                "CANCELLED",
              ].includes(status);
              return (
                <div key={b.id} className="px-6 py-3 hover:bg-neutral-50">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-2 font-medium text-neutral-900 truncate text-sm">
                      {b.customerName}
                    </div>

                    <div className="col-span-2 text-neutral-600 truncate text-sm">
                      {b.phone || "-"}
                    </div>

                    <div className="col-span-2 text-neutral-600 truncate text-sm">
                      {b.email || "-"}
                    </div>

                    <div className="col-span-1 text-neutral-600 text-center text-sm">
                      <span className="font-medium">{b.seat}</span>
                    </div>

                    <div className="col-span-1 text-neutral-600 text-center">
                      <span
                        className={`px-1 py-0.5 rounded-full text-xs ${
                          b.preferredTable
                            ? "bg-orange-100 text-orange-800 font-medium"
                            : "text-neutral-400"
                        }`}
                      >
                        {b.preferredTable
                          ? tableNameById(b.preferredTable)
                          : "-"}
                      </span>
                    </div>

                    <div className="col-span-2 text-neutral-600">
                      <div className="text-xs">
                        {fmtVNDateTime(b.bookingDate)}
                      </div>
                      <div className="mt-1">
                        {status === "PENDING" && (
                          <span className="px-1 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            Chờ duyệt
                          </span>
                        )}
                        {status === "APPROVED" && (
                          <span className="px-1 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                            Đã duyệt
                          </span>
                        )}
                        {(status === "REJECTED" || status === "REJECT") && (
                          <span className="px-1 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
                            Từ chối
                          </span>
                        )}
                        {status === "CANCELLED" && (
                          <span className="px-1 py-0.5 rounded-full text-xs bg-neutral-200 text-neutral-700">
                            Đã hủy
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-1 text-neutral-600 text-center">
                      <span
                        className={`px-1 py-0.5 rounded-full text-xs ${
                          b.assignedTableId
                            ? "bg-blue-100 text-blue-800 font-medium"
                            : "text-neutral-400"
                        }`}
                      >
                        {tableNameById(b.assignedTableId)}
                      </span>
                    </div>

                    <div className="col-span-1 flex gap-1 items-center justify-center">
                      {status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApprove(b)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Duyệt"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(b.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Từ chối"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleEdit(b)}
                        disabled={isLocked}
                        className={`p-1.5 text-blue-600 rounded-lg transition ${
                          isLocked
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-blue-50"
                        }`}
                        title="Sửa (số người, giờ tới)"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-gradient-to-r from-neutral-50 to-orange-50 px-6 py-4 border-t border-neutral-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg
                  className="h-4 w-4 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="text-sm text-neutral-700">
                {totalElements > 0 ? (
                  <span>
                    Hiển thị{" "}
                    <span className="font-semibold text-orange-600">
                      {from}
                    </span>{" "}
                    đến{" "}
                    <span className="font-semibold text-orange-600">{to}</span>{" "}
                    trong tổng số{" "}
                    <span className="font-semibold text-orange-600">
                      {totalElements}
                    </span>{" "}
                    đơn đặt bàn
                  </span>
                ) : (
                  <span className="text-neutral-500">Không có dữ liệu</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page <= 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  page <= 1
                    ? "text-neutral-400 bg-neutral-100 cursor-not-allowed"
                    : "text-neutral-700 bg-white border border-neutral-300 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 shadow-sm"
                }`}
              >
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Trước
              </button>

              <div className="flex items-center gap-1">
                {buildPages().map((p, i) =>
                  p === "…" ? (
                    <span
                      key={`e-${i}`}
                      className="px-3 py-2 text-neutral-500 font-medium"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => onPageChange(p)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        p === page
                          ? "bg-orange-500 text-white shadow-lg transform scale-105"
                          : "text-neutral-700 bg-white border border-neutral-300 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 shadow-sm"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() =>
                  onPageChange(Math.min(pageInfo.totalPages || 1, page + 1))
                }
                disabled={page >= (pageInfo.totalPages || 1)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  page >= (pageInfo.totalPages || 1)
                    ? "text-neutral-400 bg-neutral-100 cursor-not-allowed"
                    : "text-neutral-700 bg-white border border-neutral-300 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 shadow-sm"
                }`}
              >
                Sau
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <TableAssignmentModal
        isOpen={showTableAssignment}
        onClose={() => {
          setShowTableAssignment(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        tables={tables}
        onAssignTable={handleAssignTable}
      />

      <TableBookingsModal
        isOpen={showTableBookings}
        onClose={() => {
          setShowTableBookings(false);
          setSelectedTable(null);
        }}
        table={selectedTable}
        bookings={tableBookings}
        loading={loadingTableBookings}
        selectedDate={tableBookingsDate}
        onChangeDate={async (newDateStr) => {
          setTableBookingsDate(newDateStr);
          if (selectedTable)
            await fetchTableBookings(selectedTable.id, newDateStr);
        }}
      />
    </div>
  );
}

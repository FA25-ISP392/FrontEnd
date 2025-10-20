import apiConfig from "../api/apiConfig";
import { buildISOFromVN, normalizeISOFromAPI } from "../lib/datetimeBooking";

export async function createBooking({ date, time, guests, preferredTable }) {
  if (!localStorage.getItem("token")) {
    throw new Error("Bạn cần đăng nhập trước khi đặt bàn.");
  }

  const payload = {
    seat: Number(guests) || 1,
    bookingDate: buildISOFromVN(date, time),
    ...(preferredTable ? { wantTable: String(preferredTable) } : {}),
  };

  if (import.meta.env.DEV) {
    console.log("POST /booking payload:", payload);
  }
  return apiConfig.post("/booking", payload);
}

export const normalizeBooking = (b = {}) => ({
  id: b.bookingId ?? b.id,
  customerId: b.customerId ?? b.customer?.id ?? null,
  customerName: b.customerName ?? "",
  phone: b.customerPhone ?? "",
  email: b.customerEmail ?? "",
  seat: b.seat ?? 1,
  bookingDate: normalizeISOFromAPI(b.bookingDate),
  createdAt: b.createdAt ?? null,
  preferredTable: b.wantTable ?? "",
  assignedTableId: b.tableId ?? null,
  status: normalizeStatus(b.status),
});

function normalizeStatus(u) {
  const s = String(u || "PENDING").toUpperCase();
  if (s === "REJECT") return "REJECTED";
  if (s === "APPROVE") return "APPROVED";
  if (s === "CANCEL" || s === "CANCELED") return "CANCELLED";
  return s;
}

function mapFilterStatusForAPI(u) {
  const s = String(u || "ALL").toUpperCase();
  if (s === "ALL") return "ALL";
  if (s === "REJECTED" || s === "REJECT") return "REJECT";
  if (s === "APPROVED" || s === "APPROVE") return "APPROVED";
  if (["CANCELLED", "CANCELED", "CANCEL"].includes(s)) return "CANCEL";
  if (s === "PENDING") return "PENDING";
  return s;
}

function normalizeStatusFilter(status) {
  if (!status) return "ALL";
  const set = String(status).toUpperCase();
  if (set === "REJECT") return "REJECT";
  return set;
}

export async function listBookingsPaging({
  page = 1,
  size = 6,
  status = "ALL",
} = {}) {
  const setStatusPage = normalizeStatusFilter(status);
  const endpoint =
    setStatusPage !== "ALL"
      ? `/booking/status/${encodeURIComponent(setStatusPage)}`
      : "/booking";
  const res = await apiConfig.get(endpoint);
  const list = Array.isArray(res)
    ? res
    : Array.isArray(res?.result)
    ? res.result
    : Array.isArray(res?.content)
    ? res.content
    : [];

  const data = list
    .map(normalizeBooking)
    .sort(
      (firstKey, secondKey) =>
        new Date(secondKey.createdAt || secondKey.bookingDate) -
        new Date(firstKey.createdAt || firstKey.bookingDate)
    );

  const totalElements = data.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const start = (page - 1) * size;
  const end = start + size;

  return {
    items: data.slice(start, end),
    pageInfo: {
      page,
      size,
      totalPages,
      totalElements,
      numberOfElements: Math.min(size, totalElements - start),
      first: page === 1,
      last: page >= totalPages,
    },
  };
}

export async function updateBooking(id, payload) {
  const rawSeat = parseInt(payload.seat, 10) || 1;
  const seat = Math.max(1, Math.min(8, rawSeat));
  const bookingDate =
    payload.bookingDate ||
    (payload.date ? buildISOFromVN(payload.date, payload.time) : null);
  if (!bookingDate) throw new Error("Thiếu bookingDate hoặc date+time.");
  const body = { seat, bookingDate };
  if (import.meta.env.DEV) console.log("PUT /booking/%s body:", id, body);
  const res = await apiConfig.put(`/booking/${id}`, body);
  return normalizeBooking(res?.result ?? res);
}

export const approveBooking = (id) => updateBooking(id, { status: "APPROVED" });

export const rejectBooking = async (id) => {
  const res = await apiConfig.put(`/booking/${id}/reject`, {});
  return normalizeBooking(res?.result ?? res);
};

export async function approveBookingWithTable(bookingId, tableId) {
  if (!bookingId || !tableId)
    throw new Error("Thiếu bookingId hoặc tableId khi duyệt bàn.");

  const id = Number(bookingId);
  const tId = Number(tableId);
  try {
    return await apiConfig.put(`/booking/${id}/approved`, { tableId: tId });
  } catch (err1) {
    const code = err1?.response?.status;
    if (code !== 400) throw err1;
    try {
      return await apiConfig.put(`/booking/${id}/approved`, { tableID: tId });
    } catch (err2) {
      if (err2?.response?.status !== 400) throw err2;
      return await apiConfig.put(`/booking/${id}/approved`, null, {
        params: { tableId: tId },
      });
    }
  }
}

export async function listBookingsByTableDate(tableId, date) {
  if (!tableId) throw new Error("Thiếu tableId.");

  const toDateOnly = (date) => {
    if (!date) return new Date();
    const newDate = new Date(date);
    return isNaN(newDate) ? new Date() : newDate;
  };
  const d = toDateOnly(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const dayStr = `${year}-${month}-${day}`;

  const res = await apiConfig.get("/booking/by_tableDate", {
    params: { tableId: Number(tableId), date: dayStr },
  });

  const list = Array.isArray(res)
    ? res
    : Array.isArray(res?.result)
    ? res.result
    : Array.isArray(res?.content)
    ? res.content
    : [];

  return list.map(normalizeBooking);
}

export async function cancelBooking(id) {
  if (!id) throw new Error("Thiếu bookingId.");
  const res = await apiConfig.put(`/booking/${id}/cancel`, {});
  return normalizeBooking(res?.result ?? res);
}

export async function updateBooking1(id, payload) {
  const rawSeat = parseInt(payload.guests, 10) || 1;
  const seat = Math.max(1, Math.min(8, rawSeat));
  const bookingDate =
    payload.bookingDate ||
    (payload.date ? buildISOFromVN(payload.date, payload.time) : null);
  const body = {
    seat,
    bookingDate,
    ...(payload.wantTable ? { wantTable: Number(payload.wantTable) } : {}),
  };

  const res = await apiConfig.put(`/booking/${id}`, body);
  return normalizeBooking(res?.result ?? res);
}

export async function getBookingHistory(customerId) {
  if (!customerId) throw new Error("Thiếu customerId.");
  const res = await apiConfig.get(`/booking/customer/${customerId}`);
  const list = Array.isArray(res)
    ? res
    : Array.isArray(res?.result)
    ? res.result
    : Array.isArray(res?.content)
    ? res.content
    : [];
  return list.map(normalizeBooking);
}

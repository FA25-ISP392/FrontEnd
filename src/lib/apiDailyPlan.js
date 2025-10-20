// src/lib/apiDailyPlan.js
import apiConfig from "../api/apiConfig";
import { getCurrentUser } from "./auth";

/** Enum đúng theo Swagger */
export const ITEM_TYPES = {
  DISH: "DISH",
  TOPPING: "TOPPING",
};

/** Chuẩn hoá bản ghi plan */
export function normalizeDailyPlan(p = {}) {
  return {
    id: p.planId ?? p.id ?? null,
    planId: p.planId ?? p.id ?? null,
    itemId: p.itemId ?? null,
    itemName: p.itemName ?? "",
    itemType: p.itemType ?? "",
    planDate: p.planDate ?? "",
    plannedQuantity: Number(p.plannedQuantity ?? 0),
    remainingQuantity: Number(p.remainingQuantity ?? 0),
    status: Boolean(p.status),
    staffId: p.staffId ?? null,
    staffName: p.staffName ?? "",
    approvedByStaffId: p.approvedByStaffId ?? null,
    approverName: p.approverName ?? null,
  };
}

/** unwrap theo style apiConfig của bạn (có thể trả thẳng data hoặc {result}) */
function pickResult(res) {
  if (!res) return null;
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.result)) return res.result;
  if (res?.result && typeof res.result === "object") return res.result;
  return res;
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};
}

/* ========================= READ ========================= */

export async function listDailyPlans() {
  const res = await apiConfig.get("/daily-plans", authHeaders());
  const data = pickResult(res) ?? [];
  return Array.isArray(data) ? data.map(normalizeDailyPlan) : [];
}

export async function getDailyPlan(planId) {
  const res = await apiConfig.get(`/daily-plans/${planId}`, authHeaders());
  return normalizeDailyPlan(pickResult(res) ?? {});
}

/* ========================= CREATE ========================= */

/**
 * Tạo 1 kế hoạch (POST /daily-plans)
 * ⚠️ Body phải là **một object** (không phải array)
 */
export async function createDailyPlan(payload) {
  const user = getCurrentUser() || {};
  const staffId = payload?.staffId ?? user?.staffId ?? user?.id;

  const body = {
    itemId: Number(payload.itemId),
    itemType: String(payload.itemType || ITEM_TYPES.DISH).toUpperCase(),
    plannedQuantity: Number(payload.plannedQuantity),
    planDate: payload.planDate, // "YYYY-MM-DD"
    staffId: Number(staffId),
  };

  const res = await apiConfig.post("/daily-plans", body, authHeaders());
  const data = pickResult(res);
  if (Array.isArray(data)) return data.map(normalizeDailyPlan);
  return normalizeDailyPlan(data || {});
}

/**
 * Tạo nhiều kế hoạch (POST /daily-plans/batch)
 * ⚠️ Body phải là **mảng** các object
 */
export async function createDailyPlansBatch(listPayload = []) {
  const user = getCurrentUser() || {};
  const staffId = user?.staffId ?? user?.id;

  const body = listPayload.map((p) => ({
    itemId: Number(p.itemId),
    itemType: String(p.itemType || ITEM_TYPES.DISH).toUpperCase(),
    plannedQuantity: Number(p.plannedQuantity),
    planDate: p.planDate,
    staffId: Number(p.staffId ?? staffId),
  }));

  const res = await apiConfig.post("/daily-plans/batch", body, authHeaders());
  const data = pickResult(res) ?? [];
  return Array.isArray(data) ? data.map(normalizeDailyPlan) : [];
}

/* ========================= UPDATE ========================= */

/**
 * Cập nhật (PUT /daily-plans/{id})
 * Chef: { plannedQuantity?, remainingQuantity? }
 * Manager/Admin: thêm { status? }
 */
export async function updateDailyPlan(planId, payload = {}) {
  const body = {};
  if (payload.plannedQuantity != null)
    body.plannedQuantity = Number(payload.plannedQuantity);
  if (payload.remainingQuantity != null)
    body.remainingQuantity = Number(payload.remainingQuantity);
  if (typeof payload.status === "boolean") body.status = payload.status;

  const res = await apiConfig.put(
    `/daily-plans/${planId}`,
    body,
    authHeaders(),
  );
  return normalizeDailyPlan(pickResult(res) ?? {});
}

/* ========================= MANAGER actions ========================= */

// ✅ Duyệt kế hoạch
export async function approveDailyPlan(planId) {
  // BE của bạn không có /approve riêng, dùng PUT với { status: true }
  return updateDailyPlan(planId, { status: true });
}

// ⚠️ Từ chối (fallback dùng updateDailyPlan nếu chưa có DELETE)
export async function rejectDailyPlan(planId) {
  return updateDailyPlan(planId, { status: false });
}

/* ========================= DELETE ========================= */

/**
 * ❌ Xoá kế hoạch (Manager từ chối xoá luôn record)
 * Nếu BE chưa có DELETE /daily-plans/{id} → dùng rejectDailyPlan() thay thế
 */
export async function deleteDailyPlan(planId) {
  if (!planId) throw new Error("Thiếu planId để xoá!");
  try {
    const res = await apiConfig.delete(`/daily-plans/${planId}`, authHeaders());
    return pickResult(res);
  } catch (err) {
    console.warn(
      "⚠️ DELETE không khả dụng, fallback sang updateDailyPlan(status=false)",
    );
    return rejectDailyPlan(planId);
  }
}

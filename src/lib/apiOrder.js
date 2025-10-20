import apiConfig from "../api/apiConfig";

export const normalizeOrder = (o = {}) => ({
  orderId: o.orderId ?? o.id,
  customerId: o.customerId ?? o.customer?.id ?? null,
  tableId: o.tableId ?? o.table?.tableId ?? null,
  orderDate: o.orderDate ?? o.createdAt ?? null,
  status: (o.status || "PENDING").toUpperCase(),
  orderDetails: Array.isArray(o.orderDetails) ? o.orderDetails : [],
});

export async function createOrder({ customerId, tableId }) {
  if (!customerId || isNaN(Number(customerId))) {
    throw new Error("Thiếu hoặc sai customerId.");
  }
  if (!tableId || isNaN(Number(tableId))) {
    throw new Error("Thiếu hoặc sai tableId.");
  }

  const payload = {
    customerId: Number(customerId),
    tableId: Number(tableId),
    orderDate: new Date().toISOString(),
  };
  console.log("POST /orders payload:", payload);
  const res = await apiConfig.post("/orders", payload);
  return normalizeOrder(res?.result ?? res);
}

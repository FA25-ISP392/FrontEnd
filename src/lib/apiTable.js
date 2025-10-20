import apiConfig from "../api/apiConfig";

const toStatus = (raw) => {
  const s = String(raw ?? "")
    .trim()
    .toUpperCase();
  if (["EMPTY", "RESERVED", "SERVING"].includes(s)) return s.toLowerCase();
  if (raw === true || Number(raw) === 1) return "empty";
  if (raw === false || Number(raw) === 0) return "serving";
  return "empty";
};

export const normalizeTable = (t = {}) => {
  const id = t.tableID ?? t.tableId ?? t.id ?? t.table_id ?? null;
  const name =
    t.tableName ?? t.name ?? t.table_name ?? (id ? `Table ${id}` : "");
  const number = parseInt(
    String(t.number ?? name).match(/\d+/)?.[0] ?? id ?? 0,
    10
  );
  const capacity =
    t.seatTable ?? t.seats ?? t.capacity ?? t.seat ?? t.seat_table ?? 0;
  const status = toStatus(
    t.status ?? t.isAvailable ?? t.available ?? t.is_available
  );
  const isAvailable = status === "empty";

  return {
    id,
    tableId: id,
    name,
    number,
    capacity,
    status,
    isAvailable,
  };
};

export async function listTables() {
  const res = await apiConfig.get("/tables");
  const list = Array.isArray(res)
    ? res
    : Array.isArray(res?.result)
    ? res.result
    : Array.isArray(res?.content)
    ? res.content
    : [];
  return list
    .map(normalizeTable)
    .filter((x) => x.id != null)
    .sort((a, b) => (a.number || a.id) - (b.number || b.id));
}

export async function getTable(id) {
  const res = await apiConfig.get(`/tables/${id}`);
  return normalizeTable(Array.isArray(res) ? res[0] : res);
}

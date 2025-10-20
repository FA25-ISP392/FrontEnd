import apiConfig from "../api/apiConfig";

// 🧩 Chuẩn hoá dữ liệu topping từ backend
export function normalizeTopping(t = {}) {
  return {
    id: t.toppingId ?? t.id ?? 0,
    name: t.name ?? "",
    price: Number(t.price ?? 0),
    calories: Number(t.calories ?? 0),
    gram: Number(t.gram ?? 0),
  };
}

// 🟢 Lấy danh sách topping
export async function listTopping(params = {}) {
  try {
    const token = localStorage.getItem("token");
    const res = await apiConfig.get("/topping", {
      params,
      headers: {
        // Authorization: `Bearer ${token}`,
      },
    });

    // API trả về { code, message, result: [...] }
    const arr = res?.result ?? res ?? [];
    return Array.isArray(arr) ? arr.map(normalizeTopping) : [];
  } catch (err) {
    console.error("❌ Lỗi khi load danh sách topping:", err);
    throw err;
  }
}

// 🟢 Lấy chi tiết topping theo ID
export async function getTopping(id) {
  if (!id) throw new Error("Thiếu ID topping");
  try {
    const token = localStorage.getItem("token");
    const res = await apiConfig.get(`/topping/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // API trả về { code, message, result: { toppingId, name, ... } }
    const data = res?.result ?? res;
    return normalizeTopping(data);
  } catch (err) {
    console.error("❌ Lỗi khi lấy topping:", err);
    throw err;
  }
}

// 🟢 Tạo topping mới
export async function createTopping(payload) {
  try {
    const token = localStorage.getItem("token");
    const res = await apiConfig.post(
      "/topping",
      {
        name: payload.name,
        price: Number(payload.price),
        calories: Number(payload.calories),
        gram: Number(payload.gram),
        quantity: Number(payload.quantity ?? 0),
      },
      {
        headers: {
          // Authorization: `Bearer ${token}`,
          // "Content-Type": "application/json",
        },
      },
    );

    const data = res?.result ?? res;
    return normalizeTopping(data);
  } catch (err) {
    console.error("❌ Lỗi khi tạo topping:", err);
    throw err;
  }
}

// 🟢 Cập nhật topping
export async function updateTopping(id, payload) {
  if (!id) throw new Error("Thiếu ID topping để cập nhật");
  try {
    const token = localStorage.getItem("token");
    const res = await apiConfig.put(`/topping/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = res?.result ?? res;
    return normalizeTopping(data);
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật topping:", err);
    throw err;
  }
}

// 🟢 Xoá topping
export async function deleteTopping(id) {
  if (!id) throw new Error("Thiếu ID topping để xoá");
  try {
    const token = localStorage.getItem("token");
    const res = await apiConfig.delete(`/topping/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // API trả về { code, message, result: "string" }
    return res?.result ?? "Xóa thành công";
  } catch (err) {
    console.error("❌ Lỗi khi xoá topping:", err);
    throw err;
  }
}

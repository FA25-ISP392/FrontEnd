import apiConfig from "../api/apiConfig";

// Chuẩn hóa dữ liệu dish từ backend
export function normalizeDish(d = {}) {
  return {
    id: d.dishId ?? d.id,
    name: d.dish_name ?? d.dishName ?? "",
    price: d.price ?? 0,
    category: d.category ?? "",
    type: d.type ?? "",
    is_available:
      d.isAvailable ??
      d.is_available ??
      (d.status === "available" || d.status === 1),
    calories: d.calo ?? d.calories ?? 0,
    description: d.description ?? "",
    picture: d.picture ?? "",
  };
}

// 🟢 Tạo món ăn (có upload hình)
export async function createDish(payload) {
  const token = localStorage.getItem("token");
  const formData = new FormData();

  // object dish JSON
  formData.append(
    "dish",
    new Blob(
      [
        JSON.stringify({
          dishName: payload.dishName,
          description: payload.description,
          price: payload.price,
          calo: payload.calo,
          category: payload.category,
          isAvailable: payload.isAvailable,
          type: payload.type || "BUILD_MUSCLE",
        }),
      ],
      { type: "application/json" },
    ),
  );

  // file hình ảnh
  if (payload.imageFile instanceof File) {
    formData.append("image", payload.imageFile);
  } else {
    console.warn("⚠️ Không có hình ảnh hoặc không phải File object");
  }

  const res = await apiConfig.post("/dish", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return res;
}

// 🟡 Lấy danh sách món ăn
export async function listDish(params = {}) {
  const token = localStorage.getItem("token");
  const res = await apiConfig.get("/dish", {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  const arr = Array.isArray(res) ? res : [];
  return arr.map(normalizeDish);
}

// 🟢 Lấy chi tiết món
export async function getDish(id) {
  const token = localStorage.getItem("token");
  const res = await apiConfig.get(`/dish/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
}

// 🟠 Cập nhật món ăn
export async function updateDish(id, payload) {
  const token = localStorage.getItem("token");
  const res = await apiConfig.put(`/dish/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
}

// 🔴 Xóa món ăn
export async function deleteDish(id) {
  const token = localStorage.getItem("token");
  const res = await apiConfig.delete(`/dish/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
}

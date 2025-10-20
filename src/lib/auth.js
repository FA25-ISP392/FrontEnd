import apiConfig from "../api/apiConfig";
import { findStaffByUsername } from "./apiStaff";
import { ensureCustomerForUser } from "../lib/apiCustomer";

export const roleRoutes = {
  ADMIN: "/admin",
  MANAGER: "/manager",
  STAFF: "/staff",
  CHEF: "/chef",
};

// ==================== JWT & SESSION ====================
export function parseJWT(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);
    const json = atob(base64);
    return JSON.parse(json);
  } catch (e) {
    console.error("decode JWT error:", e);
    return null;
  }
}

export function getRoleFromToken(decoded) {
  return (
    decoded?.role || decoded?.roles?.[0] || decoded?.authorities?.[0] || null
  );
}

export function saveSession({ token, user }) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getCurrentUser() {
  const raw = localStorage.getItem("user");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getCurrentRole() {
  const token = getToken();
  if (!token) return null;
  const d = parseJWT(token);
  return getRoleFromToken(d);
}

export function getRolesArray(decoded) {
  if (!decoded) return [];
  const raw = decoded.role || decoded.roles || decoded.authorities || [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.filter(Boolean).map((r) =>
    String(r)
      .replace(/^ROLE_/i, "")
      .toUpperCase(),
  );
}

export function hasRole(decoded, role) {
  return getRolesArray(decoded).includes(String(role).toUpperCase());
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function resolveRouteByRole(role) {
  if (!role) return "/";
  const key = role.toString().toUpperCase();
  return roleRoutes[key] ?? "/";
}

export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;
  const decoded = parseJWT(token);
  if (!decoded) return false;
  if (decoded.exp && Date.now() / 1000 >= decoded.exp) return false;
  return true;
}

// export async function apiLogin({ username, password }) {
//   const data = await apiConfig.post("/auth/token", { username, password });

//   const token = data?.token;
//   const authenticated = data?.authenticated ?? true;

//   if (!token || authenticated === false) {
//     throw new Error("Xác thực thất bại. Vui lòng thử lại.");
//   }

//   const decoded = parseJWT(token);
//   const role = getRoleFromToken(decoded) || "STAFF";

//   let profile = null;
//   try {
//     profile = await findStaffByUsername(username);
//   } catch {}

//   return {
//     token,
//     role,
//     user: profile ? profile : { username, fullName: username },
//   };
// }

export async function apiLogin({ username, password }) {
  const data = await apiConfig.post("/auth/token", { username, password });

  const token = data?.token;
  const authenticated = data?.authenticated ?? true;

  if (!token || authenticated === false) {
    throw new Error("Xác thực thất bại. Vui lòng thử lại.");
  }

  const decoded = parseJWT(token);
  const role = getRoleFromToken(decoded) || "STAFF";

  let profile = null;
  try {
    profile = await findStaffByUsername(username);
  } catch {}

  const user = profile
    ? profile
    : {
        username,
        fullName: username,
        id: decoded?.id ?? decoded?.staffId ?? decoded?.userId ?? null,
        staffId: decoded?.staffId ?? decoded?.id ?? null,
        role,
      };

  // ✅ Lưu session để getCurrentUser() có thể đọc được
  saveSession({ token: `Bearer ${token}`, user });

  return { token, role, user };
}

export async function apiLoginCustomer({ username, password }) {
  const data = await apiConfig.post("/auth/token", { username, password });
  const token =
    data?.token || data?.accessToken || data?.id_token || data?.result?.token;
  const authenticated = data?.authenticated ?? true;

  if (!token || authenticated === false) {
    throw new Error("Xác thực thất bại. Vui lòng thử lại.");
  }

  const decoded = parseJWT(token) || {};
  if (!hasRole(decoded, "CUSTOMER")) {
    const err = new Error("Tài khoản không phải KHÁCH HÀNG.");
    err.code = "NOT_CUSTOMER";
    throw err;
  }

  const baseProfile = {
    username,
    fullName: decoded?.fullName || username,
    email: decoded?.email || "",
    phone: decoded?.phone || "",
    role: "CUSTOMER",
  };

  const cus = await ensureCustomerForUser({
    username: baseProfile.username,
    fullName: baseProfile.fullName,
    email: baseProfile.email,
    phone: baseProfile.phone,
  });

  const customerId = cus?.customerId ?? cus?.id ?? null;
  const profile = {
    ...baseProfile,
    fullName: cus?.fullName || baseProfile.fullName,
    email: cus?.email || baseProfile.email,
    phone: cus?.phone || baseProfile.phone,
    customerId,
  };
  saveSession({ token: `Bearer ${token}`, user: profile });
  window.dispatchEvent(new Event("auth:changed"));
  return { token, role: "CUSTOMER", user: profile };
}

export function logoutCustomer(redirectTo = "/home") {
  clearSession();
  window.location.href = redirectTo;
}

export function logout(redirectTo = "/") {
  clearSession();
  window.location.href = redirectTo;
}

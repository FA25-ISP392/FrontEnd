import axios from "axios";
import { getToken } from "../lib/auth";

const USE_PROXY = true;
const BASE_HOT = "https://backend2-production-00a1.up.railway.app";
const API_PREFIX = "/isp392";
const PROXY_PREFIX = "/api";

const baseURL = USE_PROXY ? PROXY_PREFIX : `${BASE_HOT}${API_PREFIX}`;

const apiConfig = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

//Gắn Bearer token
apiConfig.interceptors.request.use((config) => {
  const isAuthLogin = (config.url || "").includes("/auth/token");
  if (!isAuthLogin) {
    const tk = getToken();
    if (tk) config.headers.Authorization = `Bearer ${tk}`;
  }
  return config;
});

//Chuẩn hóa respone
apiConfig.interceptors.response.use(
  // ---- SUCCESS HANDLER ----
  (res) => {
    if (res.status === 204) return null;
    const d = res.data ?? {};
    if (d?.code === 0 || d?.code === 1000) return d.result ?? d;
    if (d?.token || d?.accessToken || d?.id_token) return d;
    if (d?.result?.token || d?.result?.accessToken || d?.result?.id_token) {
      return d.result;
    }
    if (typeof d === "string" && d.length > 20) return { token: d };
    throw new Error(d?.message || "Yêu cầu thất bại.");
  },

  // ---- ERROR HANDLER ----
  (error) => {
    const data = error?.response?.data;
    const errorList = data?.result || data?.errors || [];
    const detailedMsg = Array.isArray(errorList)
      ? errorList
          .map((e) => e?.defaultMessage || e?.message || JSON.stringify(e))
          .join(" | ")
      : data?.message || "Không thể kết nối server.";

    const wrapped = new Error(detailedMsg);
    wrapped.response = error.response;
    wrapped.status = error?.response?.status;
    wrapped.data = data;
    wrapped.url = error?.config?.url;
    return Promise.reject(wrapped);
  }
);

export default apiConfig;

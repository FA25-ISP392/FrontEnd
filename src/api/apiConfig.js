import axios from "axios";
import { getToken } from "../lib/auth";

const USE_PROXY = import.meta.env.DEV;
const BASE_HOT = "https://api-monngon88.purintech.id.vn";
// const BASE_HOT = "https://backend-production-0865.up.railway.app";
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

apiConfig.interceptors.request.use((config) => {
  const raw = getToken();
  const token = raw ? String(raw).replace(/^Bearer\s+/i, "") : "";
  if (token && !(config.url || "").includes("/auth")) {
    if (typeof config.headers?.set === "function") {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiConfig.interceptors.response.use(
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
  },
);

export default apiConfig;

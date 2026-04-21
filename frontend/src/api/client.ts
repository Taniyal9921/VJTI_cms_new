import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

/**
 * Dev: baseURL `/api` + Vite proxy → http://127.0.0.1:8000/api (see vite.config.ts).
 * Prod / direct API: set VITE_API_URL to origin including `/api`, e.g. `http://localhost:8000/api`.
 * If you set only the host (no `/api`), we append `/api` so paths stay aligned with FastAPI.
 */
export function resolveApiBase(): string {
  const raw = import.meta.env.VITE_API_URL?.trim();
  if (!raw) return "/api";
  const base = raw.replace(/\/+$/, "");
  if (base.endsWith("/api")) return base;
  return `${base}/api`;
}

export const api = axios.create({
  baseURL: resolveApiBase(),
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem("cms_token", token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem("cms_token");
  }
}

const existing = localStorage.getItem("cms_token");
if (existing) {
  api.defaults.headers.common.Authorization = `Bearer ${existing}`;
}

export function formatApiErrorDetail(detail: unknown): string {
  if (detail == null) return "";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (item && typeof item === "object" && "msg" in item) {
          return String((item as { msg: string }).msg);
        }
        return JSON.stringify(item);
      })
      .filter(Boolean)
      .join("; ");
  }
  if (typeof detail === "object") return JSON.stringify(detail);
  return String(detail);
}

api.interceptors.response.use(
  (r) => r,
  (err: AxiosError<{ detail?: unknown }>) => {
    const msg = formatApiErrorDetail(err.response?.data?.detail) || err.message;
    const reqUrl = err.config?.url ?? "";
    const isAuthAttempt = reqUrl.includes("/auth/login") || reqUrl.includes("/auth/register");
    if (err.response?.status === 401 && !isAuthAttempt) {
      setAuthToken(null);
    }
    if (msg) toast.error(msg);
    return Promise.reject(err);
  },
);

/** * Returns the backend root (e.g., http://localhost:8000) 
 * by stripping the "/api" suffix from the resolved base URL.
 */
export function getFileBaseUrl(): string {
  const base = resolveApiBase();
  // Vite dev: API and /uploads are proxied from the same origin (5173) — avoid hardcoding :8000 so media + API stay consistent.
  if (base === "/api" && typeof window !== "undefined") {
    return window.location.origin;
  }
  if (base === "/api") {
    return "http://127.0.0.1:8000";
  }
  return base.replace(/\/api$/, "");
}

/** Absolute URL for static uploads (images/videos) served under `/uploads/...` on the API host. */
export function mediaUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getFileBaseUrl().replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
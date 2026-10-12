import axios, { AxiosError } from "axios";
import { clearToken, getToken } from "./auth";
import type { ApiFieldError } from "@/types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const isAuthCall = error.config?.url?.startsWith("/auth/login") || error.config?.url?.startsWith("/auth/signup");
    if (error.response?.status === 401 && !isAuthCall && typeof window !== "undefined") {
      clearToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

interface ErrorBody {
  message?: string;
  details?: ApiFieldError[];
}

// export function getErrorMessage(err: unknown): string {
//   if (axios.isAxiosError<ErrorBody>(err)) {
//     return err.response?.data?.message ?? "Cannot reach server. Is the backend running?";
//   }
//   return "Something went wrong";
// }

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError<ErrorBody>(err)) {
    if (!err.response) return "Cannot reach server. Is the backend running?";
    return err.response.data?.message ?? `Request failed (${err.response.status})`;
  }
  return "Something went wrong";
}

/** BRE failures ya validation errors ki list (422 / 400 ke `details`) */
export function getErrorDetails(err: unknown): ApiFieldError[] {
  if (axios.isAxiosError<ErrorBody>(err) && Array.isArray(err.response?.data?.details)) {
    return err.response.data.details;
  }
  return [];
}
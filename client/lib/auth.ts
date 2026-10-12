import { ROLES, type Role } from "@/types";

export const TOKEN_COOKIE = "lms_token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days, backend JWT_EXPIRES_IN se match

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${TOKEN_COOKIE}=`));
  return match ? decodeURIComponent(match.split("=")[1] ?? "") : null;
}

export function setToken(token: string) {
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

export function clearToken() {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function homePathForRole(role: Role): string {
  switch (role) {
    case ROLES.BORROWER:
      return "/apply";
    case ROLES.ADMIN:
    case ROLES.SALES:
      return "/dashboard/sales";
    case ROLES.SANCTION:
      return "/dashboard/sanction";
    case ROLES.DISBURSEMENT:
      return "/dashboard/disbursement";
    case ROLES.COLLECTION:
      return "/dashboard/collection";
  }
}
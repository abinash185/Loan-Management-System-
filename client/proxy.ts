import { NextResponse, type NextRequest } from "next/server";
import { ROLES, type Role } from "@/types";
import { TOKEN_COOKIE, homePathForRole } from "@/lib/auth";

interface TokenPayload {
  role?: Role;
  exp?: number;
}

// UX guard: signature verify nahi karta, backend har API par asli check karta hai
function readToken(token: string | undefined): TokenPayload | null {
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as TokenPayload;
    if (!payload.role || !(Object.values(ROLES) as string[]).includes(payload.role)) return null;
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const payload = readToken(request.cookies.get(TOKEN_COOKIE)?.value);
  const redirect = (to: string) => NextResponse.redirect(new URL(to, request.url));

  // Login/signup: logged-in user ko apne home par bhejo
  if (pathname === "/login" || pathname === "/signup") {
    return payload?.role ? redirect(homePathForRole(payload.role)) : NextResponse.next();
  }

  // Baaki sab protected hai
  if (!payload?.role) return redirect("/login");
  const role = payload.role;

  if (pathname.startsWith("/apply") && role !== ROLES.BORROWER) {
    return redirect(homePathForRole(role));
  }

  if (pathname.startsWith("/dashboard")) {
    if (role === ROLES.BORROWER) return redirect("/apply");
    // /dashboard/<module>: role module se match kare, admin ko sab allowed
    const module = pathname.split("/")[2];
    if (module && role !== ROLES.ADMIN && module !== role) return redirect(homePathForRole(role));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup", "/apply/:path*", "/dashboard/:path*"],
};
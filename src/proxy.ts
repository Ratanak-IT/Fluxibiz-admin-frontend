import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = [
  "/apps",
  "/dashboard",
  "/overview",
  "/businesses",
  "/categories",
  "/units",
  "/channels",
  "/audit-logs",
  "/users",
  "/settings",
  "/account",
];
const authRoutes = ["/login", "/callback"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (authRoutes.includes(pathname) && sessionCookie) {
    return NextResponse.redirect(new URL("/apps", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/callback",
    "/apps/:path*",
    "/dashboard/:path*",
    "/overview/:path*",
    "/businesses/:path*",
    "/categories/:path*",
    "/units/:path*",
    "/channels/:path*",
    "/audit-logs/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/account/:path*",
  ],
};

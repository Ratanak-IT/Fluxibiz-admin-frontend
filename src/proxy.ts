import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = [
  "/apps",
  "/dashboard",
  "/overview",
  "/businesses",
  "/business-owners",
  "/subscriptions",
  "/logs",
  "/staff",
  "/profile",
  "/businesses/categories",
  "/units",
  "/channels",
  "/audit-logs",
  "/users",
  "/settings",
  "/account",
];

const publicRoutes = ["/login", "/callback"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
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
    "/business-owners/:path*",
    "/subscriptions/:path*",
    "/logs/:path*",
    "/staff/:path*",
    "/profile/:path*",
    "/businesses/categories/:path*",
    "/units/:path*",
    "/channels/:path*",
    "/audit-logs/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/account/:path*",
  ],
};

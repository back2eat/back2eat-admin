import { NextResponse } from "next/server";

export function middleware(request) {
  const token    = request.cookies.get("adminToken")?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/login") {
    if (token) return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.next();
  }
  if (!token) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/restaurants/:path*",
    "/orders/:path*",
    "/users/:path*",
    "/payouts/:path*",
    "/coupons/:path*",
    "/login",
  ],
};
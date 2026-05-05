import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "./lib/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const session = req.cookies.get(ADMIN_COOKIE)?.value;
  if (session === "1") return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { hasPageContent } from "@/lib/edge/check-page-content";

/** Prefixes that should never be intercepted for Puck content rendering */
const EXCLUDED_PREFIXES = [
  "/api/",
  "/edit/",
  "/puck-render/",
  "/_next/",
  "/portal/",
  "/ops/",
  "/admin/",
  "/onboard/",
  "/matters/",
  "/intake/",
  "/start/",
  "/resume/",
  "/pay/",
  "/dashboard/",
];

/** Exact paths that should never be intercepted */
const EXCLUDED_EXACT = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/verify-pending",
  "/create-account",
  "/test-oauth",
];

function isExcludedPath(pathname: string): boolean {
  // Skip static files
  if (pathname.includes(".")) return true;

  for (const prefix of EXCLUDED_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  for (const exact of EXCLUDED_EXACT) {
    if (pathname === exact) return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. ?edit param → redirect to /edit/{path}
  if (searchParams.has("edit")) {
    const editPath = pathname === "/" ? "/home" : pathname.replace(/^\//, "");
    const editUrl = new URL(`/edit/${editPath}`, request.url);
    return NextResponse.redirect(editUrl);
  }

  // 2. Portal auth check (existing behavior)
  if (pathname.startsWith("/portal")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      const nextPath = pathname + request.nextUrl.search;
      loginUrl.searchParams.set("next", nextPath);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Puck content rewrite — check if this page has published Puck content
  if (!isExcludedPath(pathname)) {
    const slug = pathname === "/" ? "home" : pathname.replace(/^\//, "");
    const hasPuck = await hasPageContent(slug);
    if (hasPuck) {
      const rewriteUrl = new URL(`/puck-render/${slug}`, request.url);
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|fonts/).*)"],
};

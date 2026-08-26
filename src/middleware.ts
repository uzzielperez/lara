import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/profile",
  "/applications",
  "/programs",
  "/swipe",
  "/cv",
  "/visa",
  "/accommodation",
  "/chat",
  "/intake",
  "/report",
  "/pricing",
];

function getSessionToken(request: NextRequest): string | undefined {
  return (
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value
  );
}

export async function middleware(request: NextRequest) {
  const sessionToken = getSessionToken(request);
  const { pathname } = request.nextUrl;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminRoute = pathname.startsWith("/admin");

  if ((isProtectedRoute || isAdminRoute) && !sessionToken) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (
    (pathname.startsWith("/auth/signin") || pathname.startsWith("/auth/signup")) &&
    sessionToken
  ) {
    const next = request.nextUrl.searchParams.get("callbackUrl");
    const dest = new URL("/auth/post-login", request.url);
    if (next?.startsWith("/") && !next.startsWith("//")) {
      dest.searchParams.set("next", next);
    }
    return NextResponse.redirect(dest);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

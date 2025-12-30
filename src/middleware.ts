import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();

  // Define protected routes
  const protectedRoutes = [
    "/profile",
    "/applications",
    "/swipe",
    "/cv",
    "/visa",
    "/accommodation",
  ];

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth/signin",
    "/auth/signup",
    "/auth/error",
    "/api/auth",
  ];

  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If accessing a protected route without session, redirect to sign in
  if (isProtectedRoute && !session) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If accessing auth pages while already signed in, redirect to home
  if (
    (pathname.startsWith("/auth/signin") ||
      pathname.startsWith("/auth/signup")) &&
    session
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};


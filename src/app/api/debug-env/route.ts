import { NextResponse } from "next/server";

// Debug endpoint to check environment variables (remove in production)
export async function GET() {
  return NextResponse.json({
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasAuthUrl: !!process.env.AUTH_URL,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    // Show first few chars to verify they're not empty strings
    googleIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + "...",
    authUrlValue: process.env.AUTH_URL,
    nextAuthUrlValue: process.env.NEXTAUTH_URL,
  });
}

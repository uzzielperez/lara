import { NextResponse } from "next/server";
import { assertDebugAccess } from "@/lib/debug-guard";

export async function GET() {
  const blocked = await assertDebugAccess();
  if (blocked) return blocked;

  return NextResponse.json({
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasAuthUrl: !!process.env.AUTH_URL,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasGroqApiKey: !!process.env.GROQ_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    authUrlValue: process.env.AUTH_URL,
    nextAuthUrlValue: process.env.NEXTAUTH_URL,
  });
}

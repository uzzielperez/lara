import { NextResponse } from "next/server";

export async function GET() {
  // Do not expose secrets; only indicate presence/length for debugging.
  const authUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const dbUrl = process.env.DATABASE_URL;

  return NextResponse.json({
    AUTH_URL: authUrl || null,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
    AUTH_SECRET_set: Boolean(authSecret),
    AUTH_SECRET_len: authSecret?.length ?? 0,
    NEXTAUTH_SECRET_len: process.env.NEXTAUTH_SECRET?.length ?? 0,
    GOOGLE_CLIENT_ID_set: Boolean(googleClientId),
    GOOGLE_CLIENT_SECRET_set: Boolean(googleClientSecret),
    DATABASE_URL_set: Boolean(dbUrl),
  });
}

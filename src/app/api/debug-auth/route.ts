import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertDebugAccess } from "@/lib/debug-guard";

export async function GET() {
  const blocked = await assertDebugAccess();
  if (blocked) return blocked;

  try {
    const session = await auth();

    return NextResponse.json({
      status: "auth_configured",
      hasSession: !!session,
      sessionUser: session?.user?.email || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "auth_error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Debug endpoint to check auth configuration
export async function GET() {
  try {
    // Try to get the session (will work even if not logged in)
    const session = await auth();
    
    return NextResponse.json({
      status: "auth_configured",
      hasSession: !!session,
      sessionUser: session?.user?.email || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: "auth_error",
      error: error instanceof Error ? error.message : "Unknown error",
      errorName: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack?.split("\n").slice(0, 10) : null,
    }, { status: 500 });
  }
}

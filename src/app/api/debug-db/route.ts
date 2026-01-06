import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Debug endpoint to check database connection
export async function GET() {
  try {
    // Try to connect and run a simple query
    const userCount = await prisma.userProfile.count();
    const programCount = await prisma.program.count();
    
    return NextResponse.json({
      status: "connected",
      userCount,
      programCount,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + "...",
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack?.split("\n").slice(0, 5) : null,
    }, { status: 500 });
  }
}

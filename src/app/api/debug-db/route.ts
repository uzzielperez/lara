import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { assertDebugAccess } from "@/lib/debug-guard";

export async function GET() {
  const blocked = await assertDebugAccess();
  if (blocked) return blocked;

  try {
    const userCount = await prisma.userProfile.count();
    const programCount = await prisma.program.count();

    return NextResponse.json({
      status: "connected",
      userCount,
      programCount,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + "...",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

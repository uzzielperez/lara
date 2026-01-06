import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Debug endpoint to check accounts and sessions
export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      select: {
        id: true,
        provider: true,
        providerAccountId: true,
        userId: true,
        type: true,
      },
    });

    const sessions = await prisma.session.findMany({
      select: {
        id: true,
        userId: true,
        expires: true,
      },
    });

    const profiles = await prisma.userProfile.findMany({
      include: {
        user: true
      }
    });

    const users = await prisma.user.findMany();

    return NextResponse.json({
      accountCount: accounts.length,
      accounts: accounts.map(a => ({ 
        provider: a.provider, 
        providerAccountId: a.providerAccountId?.substring(0, 10) + "...",
        userId: a.userId,
      })),
      sessionCount: sessions.length,
      profileCount: profiles.length,
      profiles: profiles.map(p => ({
        id: p.id,
        userId: p.userId,
        name: p.user?.name,
        email: p.user?.email,
        role: p.role,
      })),
      userCount: users.length,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
      }))
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

// DELETE to clear problematic accounts/sessions
export async function DELETE() {
  try {
    // Clear sessions and accounts (but keep UserProfiles and Users)
    const deletedSessions = await prisma.session.deleteMany();
    const deletedAccounts = await prisma.account.deleteMany();
    
    return NextResponse.json({
      message: "Cleared sessions and accounts",
      deletedSessions: deletedSessions.count,
      deletedAccounts: deletedAccounts.count,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

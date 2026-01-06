import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// Middleware to check admin role
async function requireAdmin() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { role: true },
  });

  if (!userProfile || userProfile.role !== "ADMIN") {
    return { error: "Forbidden - Admin access required", status: 403 };
  }

  return { session, userProfile };
}

// GET: Fetch all users (admin only)
export async function GET(request: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ("error" in adminCheck) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.userProfile.count({ where });

    // Fetch users with pagination
    const users = await prisma.userProfile.findMany({
      where,
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        role: true,
        nationalityCode: true,
        cvUsesCount: true,
        subscriptionStatus: true,
        createdAt: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get stats
    const totalUsers = await prisma.userProfile.count();
    const totalAdmins = await prisma.userProfile.count({ where: { role: "ADMIN" } });
    const totalPremium = await prisma.userProfile.count({ 
      where: { subscriptionStatus: "PREMIUM" } 
    });

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalUsers,
        totalAdmins,
        totalPremium,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH: Update user (admin only - e.g., change role)
export async function PATCH(request: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ("error" in adminCheck) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const { userProfileId, role, subscriptionStatus } = body as {
      userProfileId: string;
      role?: "USER" | "ADMIN";
      subscriptionStatus?: string;
    };

    if (!userProfileId) {
      return NextResponse.json({ error: "User Profile ID is required" }, { status: 400 });
    }

    // Update the user
    const user = await prisma.userProfile.update({
      where: { id: userProfileId },
      data: {
        ...(role && { role }),
        ...(subscriptionStatus !== undefined && { subscriptionStatus }),
      },
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        role: true,
        subscriptionStatus: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

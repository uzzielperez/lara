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

// GET: Fetch all applications (admin only)
export async function GET(request: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ("error" in adminCheck) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (status && status !== "ALL") {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { program: { title: { contains: search, mode: "insensitive" } } },
        { program: { school: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    // Get total count
    const total = await prisma.application.count({ where });

    // Fetch applications with pagination
    const applications = await prisma.application.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            nationalityCode: true,
            cvUsesCount: true,
            subscriptionStatus: true,
          },
        },
        program: {
          include: {
            school: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get summary stats
    const stats = await prisma.application.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const statusCounts = stats.reduce((acc, s) => {
      acc[s.status] = s._count.status;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total,
        ...statusCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching admin applications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH: Update any application status (admin only)
export async function PATCH(request: Request) {
  try {
    const adminCheck = await requireAdmin();
    if ("error" in adminCheck) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const { applicationId, status, notes } = body as {
      applicationId: string;
      status?: string;
      notes?: string;
    };

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    // Update the application
    const application = await prisma.application.update({
      where: { id: applicationId },
      data: {
        ...(status && { status: status as "SAVED" | "APPLIED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" }),
        ...(notes !== undefined && { notes }),
        ...(status === "APPLIED" && { appliedAt: new Date() }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        program: {
          include: {
            school: true,
          },
        },
      },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

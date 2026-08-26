import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaffAccess } from "@/lib/admin-guard";
import { isPaidPathwayClient } from "@/lib/pathway";

export async function GET() {
  try {
    const staffCheck = await requireStaffAccess();
    if ("error" in staffCheck) {
      return NextResponse.json({ error: staffCheck.error }, { status: staffCheck.status });
    }

    const [
      totalUsers,
      totalApplications,
      premiumUsers,
      schools,
      programs,
      pathwayPaid,
      statusGroups,
      recentApplications,
    ] = await Promise.all([
      prisma.userProfile.count({ where: { userId: { not: null } } }),
      prisma.application.count(),
      prisma.userProfile.count({
        where: {
          subscriptionStatus: {
            in: ["PREMIUM", "MONTHLY", "STARTER", "LIFETIME", "ACTIVE"],
          },
        },
      }),
      prisma.school.count(),
      prisma.program.count(),
      prisma.userProfile.count({
        where: {
          OR: [
            { pathwayAdmissionPaid: true },
            { pathwayVisaPaid: true },
            { pathwayLandingPaid: true },
          ],
        },
      }),
      prisma.application.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.application.findMany({
        take: 8,
        orderBy: { updatedAt: "desc" },
        include: {
          user: { include: { user: { select: { name: true, email: true } } } },
          program: { include: { school: { select: { name: true } } } },
        },
      }),
    ]);

    const applicationStats: Record<string, number> = {};
    for (const g of statusGroups) {
      applicationStats[g.status] = g._count.status;
    }

    const pipelineProfiles = await prisma.userProfile.findMany({
      where: { userId: { not: null } },
      select: {
        id: true,
        chatUsesCount: true,
        intakeCompletedAt: true,
        subscriptionStatus: true,
        pathwayAdmissionPaid: true,
        pathwayVisaPaid: true,
        pathwayLandingPaid: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const freemiumPipeline = pipelineProfiles.filter(
      (p) =>
        p.user?.email &&
        !p.user.email.includes("filipinas-abroad.com") &&
        !isPaidPathwayClient(p)
    );

    const paidPathway = pipelineProfiles.filter(
      (p) => p.user?.email && isPaidPathwayClient(p)
    );

    return NextResponse.json({
      stats: {
        totalUsers,
        totalApplications,
        premiumUsers,
        schools,
        programs,
        pathwayPaid,
        freemiumSignups: freemiumPipeline.length,
        applicationStats,
      },
      recentApplications,
      freemiumPipeline,
      paidPathway,
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// GET: Fetch all applications for the current user
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!userProfile) {
      return NextResponse.json({ applications: [] });
    }

    // Fetch all applications with program and school details
    const applications = await prisma.application.findMany({
      where: { userId: userProfile.id },
      include: {
        program: {
          include: {
            school: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create a new application (save a program)
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { programId, status = "SAVED", notes } = body as {
      programId: string;
      status?: "SAVED" | "APPLIED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
      notes?: string;
    };

    if (!programId) {
      return NextResponse.json({ error: "Program ID is required" }, { status: 400 });
    }

    // Get or create user's profile
    let userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!userProfile) {
      userProfile = await prisma.userProfile.create({
        data: {
          userId: session.user.id,
          email: session.user.email || undefined,
          name: session.user.name || undefined,
        },
      });
    }

    // Upsert the application (create or update if exists)
    const application = await prisma.application.upsert({
      where: {
        userId_programId: {
          userId: userProfile.id,
          programId,
        },
      },
      update: {
        status,
        notes,
        appliedAt: status === "APPLIED" ? new Date() : undefined,
      },
      create: {
        userId: userProfile.id,
        programId,
        status,
        notes,
        appliedAt: status === "APPLIED" ? new Date() : undefined,
      },
      include: {
        program: {
          include: {
            school: true,
          },
        },
      },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH: Update an application status
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, status, notes } = body as {
      applicationId: string;
      status?: "SAVED" | "APPLIED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
      notes?: string;
    };

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    // Get user's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Verify the application belongs to this user
    const existingApp = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: userProfile.id,
      },
    });

    if (!existingApp) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Update the application
    const application = await prisma.application.update({
      where: { id: applicationId },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(status === "APPLIED" && !existingApp.appliedAt && { appliedAt: new Date() }),
      },
      include: {
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

// DELETE: Remove an application
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("id");

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    // Get user's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Verify the application belongs to this user
    const existingApp = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: userProfile.id,
      },
    });

    if (!existingApp) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Delete the application
    await prisma.application.delete({
      where: { id: applicationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

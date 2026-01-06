import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// GET: Fetch user profile data
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!userProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile: userProfile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST/PUT: Update user profile data
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      nationalityCode, 
      budgetMinMonthly, 
      budgetMaxMonthly, 
      targetCountries, 
      degreeLevels, 
      desiredStart,
      summary 
    } = body;

    // Use upsert to handle both new and existing profiles
    const userProfile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        nationalityCode,
        budgetMinMonthly: budgetMinMonthly ? parseInt(budgetMinMonthly) : undefined,
        budgetMaxMonthly: budgetMaxMonthly ? parseInt(budgetMaxMonthly) : undefined,
        targetCountries,
        degreeLevels,
        desiredStart: desiredStart ? new Date(desiredStart) : undefined,
        // summary field doesn't exist in schema yet, but we'll add it if needed
        // for now we stick to schema
      },
      create: {
        userId: session.user.id,
        nationalityCode,
        budgetMinMonthly: budgetMinMonthly ? parseInt(budgetMinMonthly) : undefined,
        budgetMaxMonthly: budgetMaxMonthly ? parseInt(budgetMaxMonthly) : undefined,
        targetCountries,
        degreeLevels,
        desiredStart: desiredStart ? new Date(desiredStart) : undefined,
      },
    });

    return NextResponse.json({ profile: userProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { DegreeLevel } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { requireStaffAccess } from "@/lib/admin-guard";

const DEGREE_LEVELS = Object.values(DegreeLevel);

export async function GET(request: Request) {
  try {
    const staffCheck = await requireStaffAccess();
    if ("error" in staffCheck) {
      return NextResponse.json({ error: staffCheck.error }, { status: staffCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const schoolId = searchParams.get("schoolId");

    const programs = await prisma.program.findMany({
      where: {
        ...(schoolId ? { schoolId } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { city: { contains: search, mode: "insensitive" } },
                { school: { name: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: { school: { select: { id: true, name: true } } },
      orderBy: [{ school: { name: "asc" } }, { title: "asc" }],
      take: 200,
    });

    return NextResponse.json({ programs, degreeLevels: DEGREE_LEVELS });
  } catch (error) {
    console.error("Admin programs GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const staffCheck = await requireStaffAccess();
    if ("error" in staffCheck) {
      return NextResponse.json({ error: staffCheck.error }, { status: staffCheck.status });
    }

    const body = await request.json();
    const {
      schoolId,
      title,
      degreeLevel,
      durationMonths,
      tuitionAnnual,
      currency,
      applicationDeadline,
      language,
      city,
      countryCode,
      description,
    } = body as {
      schoolId?: string;
      title?: string;
      degreeLevel?: DegreeLevel;
      durationMonths?: number | null;
      tuitionAnnual?: number | null;
      currency?: string;
      applicationDeadline?: string | null;
      language?: string | null;
      city?: string;
      countryCode?: string;
      description?: string | null;
    };

    if (!schoolId || !title?.trim() || !degreeLevel || !city?.trim() || !countryCode?.trim()) {
      return NextResponse.json(
        { error: "schoolId, title, degreeLevel, city, and countryCode are required" },
        { status: 400 }
      );
    }

    if (!DEGREE_LEVELS.includes(degreeLevel)) {
      return NextResponse.json({ error: "Invalid degreeLevel" }, { status: 400 });
    }

    const program = await prisma.program.create({
      data: {
        schoolId,
        title: title.trim(),
        degreeLevel,
        durationMonths: durationMonths ?? null,
        tuitionAnnual: tuitionAnnual ?? null,
        currency: currency?.trim() || "EUR",
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        language: language?.trim() || null,
        city: city.trim(),
        countryCode: countryCode.trim().toUpperCase(),
        description: description?.trim() || null,
      },
      include: { school: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ program }, { status: 201 });
  } catch (error) {
    console.error("Admin programs POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const staffCheck = await requireStaffAccess();
    if ("error" in staffCheck) {
      return NextResponse.json({ error: staffCheck.error }, { status: staffCheck.status });
    }

    const body = await request.json();
    const {
      id,
      schoolId,
      title,
      degreeLevel,
      durationMonths,
      tuitionAnnual,
      currency,
      applicationDeadline,
      language,
      city,
      countryCode,
      description,
    } = body as {
      id?: string;
      schoolId?: string;
      title?: string;
      degreeLevel?: DegreeLevel;
      durationMonths?: number | null;
      tuitionAnnual?: number | null;
      currency?: string;
      applicationDeadline?: string | null;
      language?: string | null;
      city?: string;
      countryCode?: string;
      description?: string | null;
    };

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    if (degreeLevel && !DEGREE_LEVELS.includes(degreeLevel)) {
      return NextResponse.json({ error: "Invalid degreeLevel" }, { status: 400 });
    }

    const program = await prisma.program.update({
      where: { id },
      data: {
        ...(schoolId !== undefined && { schoolId }),
        ...(title !== undefined && { title: title.trim() }),
        ...(degreeLevel !== undefined && { degreeLevel }),
        ...(durationMonths !== undefined && { durationMonths }),
        ...(tuitionAnnual !== undefined && { tuitionAnnual }),
        ...(currency !== undefined && { currency: currency.trim() }),
        ...(applicationDeadline !== undefined && {
          applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        }),
        ...(language !== undefined && { language: language?.trim() || null }),
        ...(city !== undefined && { city: city.trim() }),
        ...(countryCode !== undefined && { countryCode: countryCode.trim().toUpperCase() }),
        ...(description !== undefined && { description: description?.trim() || null }),
      },
      include: { school: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ program });
  } catch (error) {
    console.error("Admin programs PATCH:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const staffCheck = await requireStaffAccess();
    if ("error" in staffCheck) {
      return NextResponse.json({ error: staffCheck.error }, { status: staffCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const appCount = await prisma.application.count({ where: { programId: id } });
    if (appCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete — students have applications for this program" },
        { status: 400 }
      );
    }

    await prisma.program.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin programs DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

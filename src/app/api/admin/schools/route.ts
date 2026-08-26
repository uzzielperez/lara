import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStaffAccess } from "@/lib/admin-guard";

export async function GET(request: Request) {
  try {
    const staffCheck = await requireStaffAccess();
    if ("error" in staffCheck) {
      return NextResponse.json({ error: staffCheck.error }, { status: staffCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();

    const schools = await prisma.school.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { city: { contains: search, mode: "insensitive" } },
              { countryCode: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: { _count: { select: { programs: true } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ schools });
  } catch (error) {
    console.error("Admin schools GET:", error);
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
    const { name, countryCode, city, website, description } = body as {
      name?: string;
      countryCode?: string;
      city?: string;
      website?: string;
      description?: string;
    };

    if (!name?.trim() || !countryCode?.trim() || !city?.trim()) {
      return NextResponse.json(
        { error: "name, countryCode, and city are required" },
        { status: 400 }
      );
    }

    const school = await prisma.school.create({
      data: {
        name: name.trim(),
        countryCode: countryCode.trim().toUpperCase(),
        city: city.trim(),
        website: website?.trim() || null,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({ school }, { status: 201 });
  } catch (error) {
    console.error("Admin schools POST:", error);
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
    const { id, name, countryCode, city, website, description } = body as {
      id?: string;
      name?: string;
      countryCode?: string;
      city?: string;
      website?: string;
      description?: string;
    };

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const school = await prisma.school.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(countryCode !== undefined && { countryCode: countryCode.trim().toUpperCase() }),
        ...(city !== undefined && { city: city.trim() }),
        ...(website !== undefined && { website: website.trim() || null }),
        ...(description !== undefined && { description: description.trim() || null }),
      },
    });

    return NextResponse.json({ school });
  } catch (error) {
    console.error("Admin schools PATCH:", error);
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

    const programCount = await prisma.program.count({ where: { schoolId: id } });
    if (programCount > 0) {
      return NextResponse.json(
        { error: "Delete programs first — school still has linked programs" },
        { status: 400 }
      );
    }

    await prisma.school.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin schools DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

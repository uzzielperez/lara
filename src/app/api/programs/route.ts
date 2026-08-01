import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

/** List programs from Neon for discovery browse. */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country")?.toUpperCase() || undefined;
    const q = searchParams.get("q")?.trim().toLowerCase() || undefined;
    const maxTuition = searchParams.get("maxTuition");
    const maxTuitionNum =
      maxTuition != null && maxTuition !== "" ? Number(maxTuition) : undefined;

    const programs = await prisma.program.findMany({
      where: {
        ...(country ? { countryCode: country } : {}),
        ...(typeof maxTuitionNum === "number" && !Number.isNaN(maxTuitionNum)
          ? { tuitionAnnual: { lte: maxTuitionNum } }
          : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { city: { contains: q, mode: "insensitive" } },
                { school: { name: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        school: { select: { name: true, website: true } },
      },
      orderBy: [{ applicationDeadline: "asc" }, { title: "asc" }],
      take: 100,
    });

    return NextResponse.json({
      programs: programs.map((p) => ({
        id: p.id,
        title: p.title,
        school: p.school.name,
        schoolId: p.schoolId,
        city: p.city,
        countryCode: p.countryCode,
        tuitionAnnual: p.tuitionAnnual,
        currency: p.currency,
        degreeLevel: p.degreeLevel,
        language: p.language,
        applicationDeadline: p.applicationDeadline
          ? p.applicationDeadline.toISOString()
          : null,
        website: p.school.website,
      })),
      source: "db",
      count: programs.length,
    });
  } catch (err) {
    console.error("Programs API error:", err);
    return NextResponse.json(
      { error: "Failed to load programs", programs: [] },
      { status: 500 }
    );
  }
}

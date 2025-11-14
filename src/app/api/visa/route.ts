import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nationality = (searchParams.get("nationality") || "").toUpperCase();
  if (!nationality) return NextResponse.json({ items: [] });

  const records = await prisma.visaRequirement.findMany({
    where: { nationalityCode: nationality },
    orderBy: { destinationCountryCode: "asc" },
  });
  const items = records.map((r) => ({
    destinationCountryCode: r.destinationCountryCode,
    summary: r.summary,
    officialUrl: r.officialUrl ?? null,
  }));
  return NextResponse.json({ items });
}



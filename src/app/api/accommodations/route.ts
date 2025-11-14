import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") || undefined;
  const country = searchParams.get("country")?.toUpperCase() || undefined;

  const items = await prisma.accommodation.findMany({
    where: {
      ...(city ? { city } : {}),
      ...(country ? { countryCode: country } : {}),
    },
    take: 10,
    orderBy: { monthlyRent: "asc" },
  });

  return NextResponse.json({ items });
}



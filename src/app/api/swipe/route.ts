import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { programId, direction } = body as { programId: string; direction: "LEFT" | "RIGHT" };
  const cookieStore = await cookies();
  const deviceId = cookieStore.get("device_id")?.value;
  if (!deviceId || !programId || (direction !== "LEFT" && direction !== "RIGHT")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let user = await prisma.userProfile.findUnique({ where: { deviceId } });
  if (!user) {
    user = await prisma.userProfile.create({ data: { deviceId } });
  }

  await prisma.swipe.upsert({
    where: { userId_programId: { userId: user.id, programId } },
    update: { direction },
    create: { userId: user.id, programId, direction },
  });

  return NextResponse.json({ ok: true });
}



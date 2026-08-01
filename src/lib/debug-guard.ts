import { NextResponse } from "next/server";
import { auth } from "@/auth";

/** Block debug APIs in production unless caller is an ADMIN. */
export async function assertDebugAccess() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Lazy import to avoid edge/bundling issues in auth-only paths
  const prisma = (await import("@/lib/prisma")).default;
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { role: true },
  });

  if (profile?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

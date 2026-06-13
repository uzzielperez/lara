import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const VALID_PLANS = ["STARTER", "MONTHLY", "LIFETIME"];

/**
 * Activates a plan for the signed-in user.
 * NOTE: This is an MVP stand-in for a real checkout (Stripe etc.). It simply
 * marks the profile as premium so the guided flow and report unlock.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = (await request.json()) as { plan?: string };
    const normalized = (plan ?? "").toUpperCase();
    if (!VALID_PLANS.includes(normalized)) {
      return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
    }

    const expiresAt =
      normalized === "LIFETIME"
        ? null
        : normalized === "STARTER"
          ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 182)
          : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: { subscriptionStatus: normalized, subscriptionExpiresAt: expiresAt },
    });

    return NextResponse.json({ ok: true, plan: normalized });
  } catch (error) {
    console.error("Subscription activation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

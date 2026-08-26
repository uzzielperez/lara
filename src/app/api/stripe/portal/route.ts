import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getStripe, stripeEnabled } from "@/lib/stripe";

function appUrl(path: string): string {
  const base = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}

/** Stripe Customer Portal — manage subscription, payment method, invoices. */
export async function POST(request: Request) {
  try {
    if (!stripeEnabled()) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as { returnPath?: string };
    const returnPath = body.returnPath?.startsWith("/") ? body.returnPath : "/pricing";

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!profile?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account yet. Subscribe first from /pricing." },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripeCustomerId,
      return_url: appUrl(returnPath),
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.json({ error: "Could not open billing portal" }, { status: 500 });
  }
}

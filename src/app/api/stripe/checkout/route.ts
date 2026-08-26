import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  getCheckoutMode,
  getPriceId,
  getStripe,
  stripeEnabled,
  type CheckoutPlan,
} from "@/lib/stripe";

const VALID_PLANS: CheckoutPlan[] = [
  "MONTHLY",
  "STARTER",
  "LIFETIME",
  "DOWNLOAD",
  "PREMIUM",
  "PATHWAY_ADMISSION",
  "PATHWAY_VISA",
  "PATHWAY_LANDING",
];

function appUrl(path: string): string {
  const base = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function POST(request: Request) {
  try {
    if (!stripeEnabled()) {
      return NextResponse.json(
        { error: "Stripe is not configured on this deployment" },
        { status: 503 }
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      plan?: string;
      returnPath?: string;
    };
    const plan = (body.plan ?? "").toUpperCase() as CheckoutPlan;
    if (!VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
    }

    const priceId = getPriceId(plan);
    if (!priceId) {
      return NextResponse.json(
        { error: `Stripe price not configured for ${plan}` },
        { status: 503 }
      );
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, stripeCustomerId: true },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const stripe = getStripe();
    const mode = getCheckoutMode(plan);
    const returnPath = body.returnPath?.startsWith("/") ? body.returnPath : "/pricing";

    let customerId = profile.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email ?? undefined,
        name: session.user.name ?? undefined,
        metadata: { userId: session.user.id, userProfileId: profile.id },
      });
      customerId = customer.id;
      await prisma.userProfile.update({
        where: { id: profile.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: appUrl(`${returnPath}?checkout=success&plan=${plan}`),
      cancel_url: appUrl(`${returnPath}?checkout=cancelled`),
      metadata: {
        userId: session.user.id,
        userProfileId: profile.id,
        plan,
      },
      ...(mode === "subscription"
        ? {
            subscription_data: {
              metadata: { userId: session.user.id, userProfileId: profile.id, plan },
            },
          }
        : {}),
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }
}

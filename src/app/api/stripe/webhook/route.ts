import { NextResponse } from "next/server";
import type Stripe from "stripe";
import prisma from "@/lib/prisma";
import {
  getStripe,
  planActivationData,
  stripeEnabled,
  type CheckoutPlan,
} from "@/lib/stripe";

export const runtime = "nodejs";

async function applyPlanToProfile(userProfileId: string, plan: CheckoutPlan, subscriptionId?: string | null) {
  const activation = planActivationData(plan);
  await prisma.userProfile.update({
    where: { id: userProfileId },
    data: {
      ...activation,
      ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
    },
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const plan = session.metadata?.plan as CheckoutPlan | undefined;
  const userProfileId = session.metadata?.userProfileId;
  if (!plan || !userProfileId) return;

  await applyPlanToProfile(
    userProfileId,
    plan,
    typeof session.subscription === "string" ? session.subscription : null
  );

  if (session.customer && typeof session.customer === "string") {
    await prisma.userProfile.update({
      where: { id: userProfileId },
      data: { stripeCustomerId: session.customer },
    });
  }
}

export async function POST(request: Request) {
  if (!stripeEnabled()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userProfileId = sub.metadata?.userProfileId;
        if (userProfileId) {
          await prisma.userProfile.update({
            where: { id: userProfileId },
            data: {
              subscriptionStatus: "FREE",
              stripeSubscriptionId: null,
              subscriptionExpiresAt: null,
            },
          });
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userProfileId = sub.metadata?.userProfileId;
        if (userProfileId && sub.status === "active") {
          const plan = (sub.metadata?.plan as CheckoutPlan) || "MONTHLY";
          await applyPlanToProfile(userProfileId, plan, sub.id);
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

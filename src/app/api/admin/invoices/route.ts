import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { requireStaffAccess } from "@/lib/admin-guard";
import { getStripe, stripeEnabled, type CheckoutPlan } from "@/lib/stripe";

const PATHWAY_PLANS: CheckoutPlan[] = [
  "PATHWAY_ADMISSION",
  "PATHWAY_VISA",
  "PATHWAY_LANDING",
];

function getPriceEnvKey(plan: CheckoutPlan): string {
  const map: Record<string, string> = {
    PATHWAY_ADMISSION: "STRIPE_PRICE_PATHWAY_ADMISSION",
    PATHWAY_VISA: "STRIPE_PRICE_PATHWAY_VISA",
    PATHWAY_LANDING: "STRIPE_PRICE_PATHWAY_LANDING",
  };
  return map[plan] ?? "";
}

/**
 * Staff: create and send a Stripe Invoice for a pathway package.
 * Customer pays via hosted invoice page (Invoicing product).
 */
export async function POST(request: Request) {
  try {
    const staffCheck = await requireStaffAccess();
    if ("error" in staffCheck) {
      return NextResponse.json({ error: staffCheck.error }, { status: staffCheck.status });
    }

    if (!stripeEnabled()) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
    }

    const body = (await request.json()) as {
      userProfileId?: string;
      plan?: string;
      daysUntilDue?: number;
    };

    const plan = (body.plan ?? "").toUpperCase() as CheckoutPlan;
    if (!PATHWAY_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: "plan must be PATHWAY_ADMISSION, PATHWAY_VISA, or PATHWAY_LANDING" },
        { status: 400 }
      );
    }

    if (!body.userProfileId) {
      return NextResponse.json({ error: "userProfileId is required" }, { status: 400 });
    }

    const priceId = process.env[getPriceEnvKey(plan)];
    if (!priceId) {
      return NextResponse.json({ error: `Stripe price not configured for ${plan}` }, { status: 503 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { id: body.userProfileId },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!profile?.user?.email) {
      return NextResponse.json({ error: "Student profile or email not found" }, { status: 404 });
    }

    const stripe = getStripe();
    let customerId = profile.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.user.email,
        name: profile.user.name ?? undefined,
        metadata: { userProfileId: profile.id, userId: profile.userId ?? "" },
      });
      customerId = customer.id;
      await prisma.userProfile.update({
        where: { id: profile.id },
        data: { stripeCustomerId: customerId },
      });
    }

    await stripe.invoiceItems.create({
      customer: customerId,
      price: priceId,
      metadata: { plan, userProfileId: profile.id },
    });

    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: "send_invoice",
      days_until_due: body.daysUntilDue ?? 14,
      metadata: { plan, userProfileId: profile.id },
      auto_advance: true,
    });

    const finalized = await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.sendInvoice(finalized.id);

    return NextResponse.json({
      invoiceId: finalized.id,
      hostedInvoiceUrl: finalized.hosted_invoice_url,
      status: finalized.status,
    });
  } catch (error) {
    console.error("Admin invoice error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}

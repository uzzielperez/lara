import Stripe from "stripe";

export type CheckoutPlan =
  | "MONTHLY"
  | "STARTER"
  | "LIFETIME"
  | "DOWNLOAD"
  | "PREMIUM"
  | "PATHWAY_ADMISSION"
  | "PATHWAY_VISA"
  | "PATHWAY_LANDING";

const PLAN_CONFIG: Record<
  CheckoutPlan,
  { envKey: string; mode: "subscription" | "payment"; label: string }
> = {
  MONTHLY: { envKey: "STRIPE_PRICE_MONTHLY", mode: "subscription", label: "Monthly" },
  STARTER: { envKey: "STRIPE_PRICE_STARTER", mode: "payment", label: "Starter (6 months)" },
  LIFETIME: { envKey: "STRIPE_PRICE_LIFETIME", mode: "payment", label: "Lifetime" },
  DOWNLOAD: { envKey: "STRIPE_PRICE_DOWNLOAD", mode: "payment", label: "Single download" },
  PREMIUM: { envKey: "STRIPE_PRICE_APPLICATION_PREMIUM", mode: "payment", label: "Premium access" },
  PATHWAY_ADMISSION: {
    envKey: "STRIPE_PRICE_PATHWAY_ADMISSION",
    mode: "payment",
    label: "School Admission package",
  },
  PATHWAY_VISA: {
    envKey: "STRIPE_PRICE_PATHWAY_VISA",
    mode: "payment",
    label: "Visa Application package",
  },
  PATHWAY_LANDING: {
    envKey: "STRIPE_PRICE_PATHWAY_LANDING",
    mode: "payment",
    label: "Landing Support package",
  },
};

export const CHECKOUT_PLANS = Object.keys(PLAN_CONFIG) as CheckoutPlan[];

export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

export function getPriceId(plan: CheckoutPlan): string | null {
  const cfg = PLAN_CONFIG[plan];
  return process.env[cfg.envKey] ?? null;
}

export function getCheckoutMode(plan: CheckoutPlan): "subscription" | "payment" {
  return PLAN_CONFIG[plan].mode;
}

export function getPlanLabel(plan: CheckoutPlan): string {
  return PLAN_CONFIG[plan].label;
}

/** Maps a successful checkout plan to profile subscription / pathway updates. */
export function planActivationData(plan: CheckoutPlan): {
  subscriptionStatus?: string;
  subscriptionExpiresAt?: Date | null;
  pathwayAdmissionPaid?: boolean;
  pathwayVisaPaid?: boolean;
  pathwayLandingPaid?: boolean;
} {
  switch (plan) {
    case "MONTHLY":
      return {
        subscriptionStatus: "MONTHLY",
        subscriptionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 32),
      };
    case "STARTER":
      return {
        subscriptionStatus: "STARTER",
        subscriptionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 182),
      };
    case "LIFETIME":
      return { subscriptionStatus: "LIFETIME", subscriptionExpiresAt: null };
    case "DOWNLOAD":
      return { subscriptionStatus: "DOWNLOAD_PURCHASED" };
    case "PREMIUM":
      return {
        subscriptionStatus: "PREMIUM",
        subscriptionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      };
    case "PATHWAY_ADMISSION":
      return { pathwayAdmissionPaid: true };
    case "PATHWAY_VISA":
      return { pathwayVisaPaid: true };
    case "PATHWAY_LANDING":
      return { pathwayLandingPaid: true };
    default:
      return {};
  }
}

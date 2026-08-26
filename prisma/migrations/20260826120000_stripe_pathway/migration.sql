-- Stripe customer + paid pathway flags
ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;
ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "pathwayAdmissionPaid" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "pathwayVisaPaid" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "pathwayLandingPaid" BOOLEAN NOT NULL DEFAULT false;

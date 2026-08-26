import type { PathwayStage } from "@/lib/staff-pathway-mock";

export type PathwayProfile = {
  pathwayAdmissionPaid?: boolean;
  pathwayVisaPaid?: boolean;
  pathwayLandingPaid?: boolean;
  subscriptionStatus?: string | null;
};

export function derivePathwayStage(p: PathwayProfile): PathwayStage | null {
  if (!p.pathwayAdmissionPaid && !p.pathwayVisaPaid && !p.pathwayLandingPaid) {
    return null;
  }
  if (p.pathwayLandingPaid) return "LANDING_SUPPORT";
  if (p.pathwayVisaPaid) return "VISA_APPLICATION";
  if (p.pathwayAdmissionPaid) return "SCHOOL_ADMISSION";
  return null;
}

export function pathwayProgress(stage: PathwayStage | null): number {
  switch (stage) {
    case "SCHOOL_ADMISSION":
      return 35;
    case "VISA_APPLICATION":
      return 65;
    case "LANDING_SUPPORT":
      return 85;
    case "COMPLETED":
      return 100;
    default:
      return 0;
  }
}

export function isPaidPathwayClient(p: PathwayProfile): boolean {
  return Boolean(p.pathwayAdmissionPaid || p.pathwayVisaPaid || p.pathwayLandingPaid);
}

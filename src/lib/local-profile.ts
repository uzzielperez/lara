/** Client-side profile snapshot (guest / pre-sync). */

import { isProfileComplete, type ProfileInput } from "@/lib/user-profile";

export type LocalProfileSnapshot = ProfileInput & {
  name?: string;
  email?: string;
  rentBudgetMin?: number;
  rentBudgetMax?: number;
  universityBudgetMin?: number;
  universityBudgetMax?: number;
};

const STORAGE_KEY = "userProfile";

export function readLocalProfile(): LocalProfileSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalProfileSnapshot;
  } catch {
    return null;
  }
}

export function writeLocalProfile(data: LocalProfileSnapshot): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function localProfileToInput(local: LocalProfileSnapshot): ProfileInput & {
  name?: string | null;
} {
  return {
    name: local.name,
    nationalityCode: local.nationalityCode,
    budgetMinMonthly: local.rentBudgetMin ?? local.budgetMinMonthly,
    budgetMaxMonthly: local.rentBudgetMax ?? local.budgetMaxMonthly,
    universityBudgetMin: local.universityBudgetMin,
    universityBudgetMax: local.universityBudgetMax,
    targetCountries: local.targetCountries,
    degreeLevels: local.degreeLevels,
    cefrLevel: local.cefrLevel,
    desiredStart: local.desiredStart,
  };
}

export function isLocalProfileComplete(local: LocalProfileSnapshot | null): boolean {
  if (!local) return false;
  return isProfileComplete(localProfileToInput(local));
}

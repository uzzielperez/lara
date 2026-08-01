/** Staff / admin access helpers. */

export const STAFF_EMAILS = [
  "isabella@filipinas-abroad.com",
  "uzzielperez25@gmail.com",
  "lauren@filipinas-abroad.com",
] as const;

export function isStaffEmail(email?: string | null): boolean {
  if (!email) return false;
  return (STAFF_EMAILS as readonly string[]).includes(email.toLowerCase());
}

/** Staff UI: ADMIN role OR known staff email (so Google login still works). */
export function canAccessStaffUi(opts: {
  email?: string | null;
  role?: string | null;
}): boolean {
  return opts.role === "ADMIN" || isStaffEmail(opts.email);
}

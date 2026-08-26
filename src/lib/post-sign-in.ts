import { isStaffEmail } from "@/lib/staff";

/** Safe relative callback path from sign-in query param. */
export function normalizeCallbackUrl(callbackUrl?: string | null): string | null {
  if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return null;
  }
  return callbackUrl;
}

/** Where to send the user immediately after a successful sign-in. */
export function getPostSignInPath(email?: string | null, callbackUrl?: string | null): string {
  const callback = normalizeCallbackUrl(callbackUrl);

  if (isStaffEmail(email)) {
    if (callback?.startsWith("/admin")) return callback;
    if (callback && callback !== "/intake") return callback;
    return "/admin";
  }

  return callback ?? "/intake";
}

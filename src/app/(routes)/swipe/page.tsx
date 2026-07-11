import { redirect } from "next/navigation";
import { DISCOVERY_ROUTES } from "@/lib/discovery-routes";

/** S1-P04: legacy swipe route → program browse. */
export default function SwipeRedirectPage() {
  redirect(DISCOVERY_ROUTES.programs);
}

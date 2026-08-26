import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { canAccessStaffUi } from "@/lib/staff";

/** Gate admin APIs and pages — ADMIN role or known staff email. */
export async function requireStaffAccess() {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, role: true },
  });

  if (
    !userProfile ||
    !canAccessStaffUi({ email: session.user.email, role: userProfile.role })
  ) {
    return { error: "Forbidden - Admin access required", status: 403 };
  }

  return { session, userProfile };
}

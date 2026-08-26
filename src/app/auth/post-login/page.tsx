import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPostSignInPath } from "@/lib/post-sign-in";

export const dynamic = "force-dynamic";

export default async function PostLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const params = await searchParams;
  redirect(getPostSignInPath(session.user.email, params.next ?? params.callbackUrl));
}

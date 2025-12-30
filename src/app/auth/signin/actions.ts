"use server";

import { redirect } from "next/navigation";

export async function signInWithGoogle() {
  redirect("/api/auth/signin/google?callbackUrl=/");
}


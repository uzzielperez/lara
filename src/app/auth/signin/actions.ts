"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { isStaffEmail } from "@/lib/staff";
import { getPostSignInPath } from "@/lib/post-sign-in";

export type StaffSignInState = { error: string } | undefined;

function credentialString(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function staffSignInAction(
  _prev: StaffSignInState,
  formData: FormData
): Promise<StaffSignInState> {
  const email = credentialString(formData.get("email")).toLowerCase();
  const password = credentialString(formData.get("password"));
  const callbackUrl = credentialString(formData.get("callbackUrl")) || null;

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  if (!isStaffEmail(email)) {
    return {
      error:
        "That email is not on the staff list. Students should use Continue with Google.",
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: getPostSignInPath(email, callbackUrl),
    });
    return undefined;
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          error:
            "Wrong staff password. Use the shared LARA staff password, not your Google password.",
        };
      }
      return {
        error: `Staff password sign-in failed (${error.type}). Use Continue with Google with your work account instead.`,
      };
    }

    throw error;
  }
}

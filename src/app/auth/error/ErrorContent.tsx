"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, { title: string; message: string; action: string }> = {
  Configuration: {
    title: "Configuration Error",
    message: "There's a problem with the server configuration. This usually means environment variables are missing or incorrect.",
    action: "Please check that GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and AUTH_SECRET are properly set.",
  },
  AccessDenied: {
    title: "Access Denied",
    message: "You don't have permission to sign in, or you denied the sign-in request.",
    action: "Try signing in again and make sure to allow access when prompted.",
  },
  OAuthSignin: {
    title: "OAuth Sign-in Error",
    message: "Could not start the Google sign-in process.",
    action: "Please try again. If the problem persists, try clearing your browser cookies.",
  },
  OAuthCallback: {
    title: "OAuth Callback Error", 
    message: "There was an error processing the Google sign-in response.",
    action: "Please try signing in again. Make sure pop-ups are not blocked.",
  },
  OAuthCreateAccount: {
    title: "Account Creation Error",
    message: "Could not create your account after Google sign-in.",
    action: "There may be a database issue. Please try again or contact support.",
  },
  OAuthAccountNotLinked: {
    title: "Account Already Exists",
    message: "An account with this email already exists using a different sign-in method.",
    action: "Try signing in with the method you originally used to create your account.",
  },
  Callback: {
    title: "Callback Error",
    message: "An error occurred during the authentication callback.",
    action: "Please try signing in again.",
  },
  Verification: {
    title: "Verification Error",
    message: "The verification link has expired or has already been used.",
    action: "Request a new verification email.",
  },
  Default: {
    title: "Authentication Error",
    message: "An unknown error occurred during authentication.",
    action: "Please try signing in again. If the problem persists, contact support.",
  },
};

export default function ErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error") || "Default";
  const errorInfo = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.Default;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-cream-300 p-8 w-full max-w-md">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">{errorInfo.title}</h1>
        <p className="text-charcoal-light">{errorInfo.message}</p>
      </div>

      <div className="bg-cream-100 rounded-lg p-4 mb-6">
        <p className="text-sm text-charcoal">
          <span className="font-medium">💡 What to do:</span><br />
          {errorInfo.action}
        </p>
      </div>

      {/* Debug info (collapsed by default) */}
      <details className="mb-6">
        <summary className="text-sm text-charcoal-light cursor-pointer hover:text-charcoal">
          Show technical details
        </summary>
        <div className="mt-2 p-3 bg-slate-100 rounded-lg text-xs font-mono text-slate-700 overflow-auto">
          <p><strong>Error Code:</strong> {errorCode}</p>
          <p><strong>URL Params:</strong></p>
          <pre>{JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2)}</pre>
        </div>
      </details>

      <div className="space-y-3">
        <Link 
          href="/auth/signin" 
          className="btn-accent w-full inline-block text-center"
        >
          Try signing in again
        </Link>
        <Link 
          href="/" 
          className="block text-center text-sm text-teal hover:underline"
        >
          Go back home
        </Link>
      </div>

      <div className="mt-6 pt-4 border-t border-cream-300 text-center">
        <p className="text-xs text-charcoal-light">
          Still having trouble?{" "}
          <a href="mailto:support@filipinas-abroad.com" className="text-teal hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}

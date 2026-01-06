"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignInContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        OAuthSignin: "Error starting Google sign-in. Please try again.",
        OAuthCallback: "Error during Google sign-in callback. Please try again.",
        OAuthCreateAccount: "Could not create account. Please try again.",
        OAuthAccountNotLinked: "This email is already associated with another account.",
        Callback: "Error during authentication callback.",
        Configuration: "Server configuration error. Please contact support.",
        AccessDenied: "Access denied. You may not have permission.",
        Verification: "The verification link has expired or already been used.",
        CredentialsSignin: "Invalid staff email or password.",
        Default: "An authentication error occurred. Please try again.",
      };
      setError(errorMessages[errorParam] || errorMessages.Default);
    }
  }, [searchParams]);

  const handleGoogleSignIn = () => {
    setLoading(true);
    setError(null);
    signIn("google", { callbackUrl });
  };

  const handleStaffSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });
      
      if (result?.error) {
        setError("Invalid staff email or password.");
        setLoading(false);
      } else {
        // Success - manually redirect
        window.location.href = callbackUrl;
      }
    } catch (err) {
      setError("An error occurred during sign in.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-cream-300 p-8 w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🌏</span>
        </div>
        <h1 className="text-3xl font-bold text-teal mb-2">Welcome</h1>
        <p className="text-charcoal-light">Sign in to continue your study abroad journey</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          <div className="flex items-start gap-2">
            <span>⚠️</span>
            <div>
              <p className="font-medium">Sign-in Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {!showStaffLogin ? (
        <div className="space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full px-4 py-4 bg-white border-2 border-cream-400 rounded-xl text-charcoal font-medium hover:bg-cream-50 hover:border-primary-300 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-teal border-t-transparent rounded-full animate-spin"></div>
                Connecting to Google...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>
          
          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-cream-300"></div></div>
            <span className="relative bg-white px-4 text-xs text-charcoal-light uppercase tracking-widest">or</span>
          </div>

          <button
            onClick={() => setShowStaffLogin(true)}
            className="w-full text-sm text-teal font-medium hover:underline"
          >
            Sign in as Staff
          </button>
        </div>
      ) : (
        <form onSubmit={handleStaffSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Staff Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-cream-50 border border-cream-400 rounded-xl focus:outline-none focus:border-teal"
              placeholder="name@filipinas-abroad.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-cream-50 border border-cream-400 rounded-xl focus:outline-none focus:border-teal"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-4 bg-teal text-white rounded-xl font-medium hover:bg-teal-700 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Staff Sign In"}
          </button>
          <button
            type="button"
            onClick={() => setShowStaffLogin(false)}
            className="w-full text-sm text-charcoal-light hover:underline"
          >
            ← Back to Google Login
          </button>
        </form>
      )}

      <div className="mt-8 pt-6 border-t border-cream-300">
        <div className="text-center text-sm text-charcoal-light space-y-2">
          <p>By signing in, you agree to our</p>
          <div className="flex justify-center gap-4">
            <Link href="/terms" className="text-teal hover:underline">Terms of Service</Link>
            <span>•</span>
            <Link href="/privacy" className="text-teal hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-charcoal-light hover:text-teal transition-colors">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

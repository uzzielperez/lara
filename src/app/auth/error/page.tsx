import Link from "next/link";

export default function AuthErrorPage({ searchParams }: { searchParams: { error?: string } }) {
  const error = searchParams?.error;
  const message = error
    ? decodeURIComponent(error)
    : "An unknown authentication error occurred.";
  const raw = JSON.stringify(searchParams || {}, null, 2);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg border border-cream-300 p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-teal mb-3">Authentication Error</h1>
        <p className="text-charcoal-light mb-2">{message}</p>
        {error && (
          <p className="text-sm text-red-600 mb-4">error={error}</p>
        )}
        <pre className="text-left text-xs bg-cream-100 p-3 rounded-lg text-charcoal overflow-auto mb-6">
          {raw}
        </pre>
        <div className="space-y-3">
          <Link href="/auth/signin" className="btn-accent w-full inline-block text-center">
            Try signing in again
          </Link>
          <Link href="/" className="block text-sm text-teal hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}

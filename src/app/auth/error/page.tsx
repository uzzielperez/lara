import { Suspense } from "react";
import ErrorContent from "./ErrorContent";

export default function AuthErrorPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-fade-in">
      <Suspense fallback={
        <div className="bg-white rounded-2xl shadow-lg border border-cream-300 p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-cream-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">⏳</span>
          </div>
          <p className="text-charcoal-light">Loading...</p>
        </div>
      }>
        <ErrorContent />
      </Suspense>
    </div>
  );
}

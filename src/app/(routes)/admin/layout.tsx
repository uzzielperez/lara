import Providers from "@/components/Providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <Providers>
        <div className="admin-theme">
          {children}
        </div>
      </Providers>
    </ErrorBoundary>
  );
}

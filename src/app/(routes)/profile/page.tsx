import { Suspense } from "react";
import ProfileDashboardClient from "./ProfileDashboardClient";

function ProfileLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div
        className="w-10 h-10 border-2 rounded-full animate-spin"
        style={{ borderColor: "var(--hairline-strong)", borderTopColor: "var(--ink)" }}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileDashboardClient />
    </Suspense>
  );
}

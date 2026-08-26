"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { canAccessStaffUi } from "@/lib/staff";

type Overview = {
  stats: {
    totalUsers: number;
    totalApplications: number;
    premiumUsers: number;
    schools: number;
    programs: number;
    pathwayPaid: number;
    freemiumSignups: number;
    applicationStats: Record<string, number>;
  };
  recentApplications: Array<{
    id: string;
    status: string;
    updatedAt: string;
    user: { user?: { name: string | null; email: string | null } };
    program: { title: string; school: { name: string } };
  }>;
};

export default function AdminDashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin");
      return;
    }
    if (authStatus === "authenticated") {
      const role = (session?.user as { role?: string })?.role;
      if (!canAccessStaffUi({ email: session?.user?.email, role })) {
        setError("Access denied.");
        setLoading(false);
        return;
      }
      fetch("/api/admin/overview")
        .then((r) => r.json())
        .then((d) => {
          if (d.error) throw new Error(d.error);
          setData(d);
        })
        .catch((e) => setError(e.message || "Failed to load"))
        .finally(() => setLoading(false));
    }
  }, [authStatus, session, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <AdminShell
      title="Dashboard"
      subtitle="Live metrics — signups, pathway clients, and catalog"
      actions={
        <Link
          href="/admin/applications"
          className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium"
        >
          All applications →
        </Link>
      }
    >
      {loading ? (
        <p className="text-slate-400">Loading dashboard…</p>
      ) : (
        <div className="space-y-6 max-w-6xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Signed-up users", value: stats?.totalUsers ?? 0, color: "text-violet-300" },
              { label: "Freemium pipeline", value: stats?.freemiumSignups ?? 0, color: "text-sky-300" },
              { label: "Paid pathway (Stripe)", value: stats?.pathwayPaid ?? 0, color: "text-emerald-300" },
              { label: "Premium subs", value: stats?.premiumUsers ?? 0, color: "text-amber-300" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-4">
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                <p className="text-xs text-slate-400 mt-1">{k.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Applications", value: stats?.totalApplications ?? 0, href: "/admin/applications" },
              { label: "Schools", value: stats?.schools ?? 0, href: "/admin/schools" },
              { label: "Programs", value: stats?.programs ?? 0, href: "/admin/programs" },
              { label: "Applied", value: stats?.applicationStats?.APPLIED ?? 0 },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3">
                {k.href ? (
                  <Link href={k.href} className="group block">
                    <p className="text-xl font-bold text-white group-hover:text-indigo-300">{k.value}</p>
                    <p className="text-xs text-slate-400">{k.label} →</p>
                  </Link>
                ) : (
                  <>
                    <p className="text-xl font-bold text-white">{k.value}</p>
                    <p className="text-xs text-slate-400">{k.label}</p>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center">
              <h2 className="font-semibold text-white">Recent applications</h2>
              <Link href="/admin/applications" className="text-xs text-indigo-400 hover:underline">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-500 uppercase bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-2 text-left">Student</th>
                    <th className="px-4 py-2 text-left">Program</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data?.recentApplications?.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <p className="font-medium">{app.user.user?.name ?? "—"}</p>
                        <p className="text-xs text-slate-500">{app.user.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{app.program.title}</p>
                        <p className="text-xs text-slate-500">{app.program.school.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-800">{app.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(app.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data?.recentApplications?.length === 0 && (
                <p className="px-4 py-8 text-center text-slate-500 text-sm">No applications yet.</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/admin/students"
              className="block rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-indigo-500/50"
            >
              <h3 className="font-semibold text-white mb-1">Student pipeline</h3>
              <p className="text-sm text-slate-400">Freemium funnel + paid pathway clients</p>
              <span className="text-xs text-indigo-400 mt-3 inline-block">Open →</span>
            </Link>
            <Link
              href="/admin/schools"
              className="block rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-indigo-500/50"
            >
              <h3 className="font-semibold text-white mb-1">Catalog</h3>
              <p className="text-sm text-slate-400">Schools and programs — no deploy needed</p>
              <span className="text-xs text-indigo-400 mt-3 inline-block">Open →</span>
            </Link>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

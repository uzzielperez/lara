"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type ApplicationStatus = "SAVED" | "APPLIED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

type AdminApplication = {
  id: string;
  status: ApplicationStatus;
  notes: string | null;
  appliedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    nationalityCode: string | null;
    cvUsesCount: number;
    subscriptionStatus: string | null;
    user?: {
      name: string | null;
      email: string | null;
    };
  };
  program: {
    id: string;
    title: string;
    degreeLevel: string;
    city: string;
    countryCode: string;
    tuitionAnnual: number | null;
    applicationDeadline: string | null;
    school: {
      id: string;
      name: string;
    };
  };
};

type Stats = {
  total: number;
  SAVED?: number;
  APPLIED?: number;
  ACCEPTED?: number;
  REJECTED?: number;
  WITHDRAWN?: number;
};

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  SAVED: { label: "Saved", color: "text-slate-300", bgColor: "bg-slate-700", icon: "📌" },
  APPLIED: { label: "Applied", color: "text-blue-300", bgColor: "bg-blue-900/50", icon: "📤" },
  ACCEPTED: { label: "Accepted", color: "text-emerald-300", bgColor: "bg-emerald-900/50", icon: "🎉" },
  REJECTED: { label: "Rejected", color: "text-red-300", bgColor: "bg-red-900/50", icon: "❌" },
  WITHDRAWN: { label: "Withdrawn", color: "text-gray-400", bgColor: "bg-gray-800", icon: "↩️" },
};

export default function AdminDashboard() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ApplicationStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Check admin access
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin");
      return;
    }

    // Check if user is admin via session
    if (authStatus === "authenticated") {
      const userRole = (session?.user as { role?: string })?.role;
      if (userRole !== "ADMIN") {
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }
      fetchApplications();
    }
  }, [authStatus, session, router, filter, search, page]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "ALL") params.set("status", filter);
      if (search) params.set("search", search);
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await fetch(`/api/admin/applications?${params}`);
      
      if (res.status === 403) {
        setError("Access denied. Admin privileges required.");
        return;
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await res.json();
      setApplications(data.applications);
      setStats(data.stats);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const updateStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status: newStatus }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setApplications(apps => 
          apps.map(app => app.id === applicationId ? data.application : app)
        );
        // Refresh stats
        fetchApplications();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="w-20 h-20 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <button onClick={() => router.push("/")} className="px-6 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-3xl">⚙️</span>
            </div>
            <p className="text-slate-400">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Admin Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">🛡️</span>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-slate-400">Manage all user applications</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              Logged in as: <span className="text-emerald-400 font-medium">{session?.user?.name || session?.user?.email}</span>
            </span>
            <button 
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-slate-700 rounded-lg text-sm hover:bg-slate-600 transition-colors"
            >
              ← Back to App
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div 
            className={`p-4 rounded-xl cursor-pointer transition-all ${
              filter === "ALL" ? "bg-slate-700 ring-2 ring-slate-500" : "bg-slate-800 hover:bg-slate-750"
            }`}
            onClick={() => { setFilter("ALL"); setPage(1); }}
          >
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-slate-400">Total</div>
          </div>
          {(Object.entries(STATUS_CONFIG) as [ApplicationStatus, typeof STATUS_CONFIG[ApplicationStatus]][]).map(([status, config]) => (
            <div 
              key={status}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                filter === status ? `${config.bgColor} ring-2 ring-slate-500` : "bg-slate-800 hover:bg-slate-750"
              }`}
              onClick={() => { setFilter(filter === status ? "ALL" : status); setPage(1); }}
            >
              <div className={`text-3xl font-bold ${config.color}`}>
                {stats[status] || 0}
              </div>
              <div className="text-sm text-slate-400 flex items-center gap-1">
                {config.icon} {config.label}
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-grow relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by user name, email, program, or school..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 rounded-lg font-medium hover:bg-blue-500 transition-colors"
            >
              🔍 Search
            </button>
          </form>
          
          {/* Active Filters */}
          {(filter !== "ALL" || search) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700">
              <span className="text-sm text-slate-400">Active filters:</span>
              {filter !== "ALL" && (
                <span className={`px-3 py-1 rounded-full text-sm ${STATUS_CONFIG[filter].bgColor} ${STATUS_CONFIG[filter].color}`}>
                  {STATUS_CONFIG[filter].icon} {STATUS_CONFIG[filter].label}
                </span>
              )}
              {search && (
                <span className="px-3 py-1 rounded-full text-sm bg-slate-700 text-slate-300">
                  🔍 "{search}"
                </span>
              )}
              <button
                onClick={() => { setFilter("ALL"); setSearch(""); setSearchInput(""); setPage(1); }}
                className="text-sm text-blue-400 hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Applications Table */}
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          {applications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <p className="text-slate-400">No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Program</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-750/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{app.user.user?.name || "—"}</div>
                          <div className="text-sm text-slate-400">{app.user.user?.email}</div>
                          {app.user.nationalityCode && (
                            <div className="text-xs text-slate-500 mt-1">🌍 {app.user.nationalityCode}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{app.program.title}</div>
                          <div className="text-sm text-slate-400">{app.program.school.name}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            📍 {app.program.city}, {app.program.countryCode} • 
                            💰 €{app.program.tuitionAnnual?.toLocaleString() || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_CONFIG[app.status].bgColor} ${STATUS_CONFIG[app.status].color}`}>
                          {STATUS_CONFIG[app.status].icon} {STATUS_CONFIG[app.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {app.appliedAt && (
                          <div>Applied: {new Date(app.appliedAt).toLocaleDateString()}</div>
                        )}
                        <div>Created: {new Date(app.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <select
                            value={app.status}
                            onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                            className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-slate-500"
                          >
                            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                              <option key={status} value={status}>
                                {config.icon} {config.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => router.push(`/admin/applications/${app.id}`)}
                            className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-sm hover:bg-blue-600/30 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
              <div className="text-sm text-slate-400">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-slate-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-slate-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

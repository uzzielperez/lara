"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";

type ApplicationStatus = "SAVED" | "APPLIED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

type ApplicationDetail = {
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
    budgetMinMonthly: number | null;
    budgetMaxMonthly: number | null;
    targetCountries: string[] | null;
    degreeLevels: string[] | null;
    desiredStart: string | null;
    user?: {
      name: string | null;
      email: string | null;
    };
  };
  program: {
    id: string;
    title: string;
    degreeLevel: string;
    durationMonths: number | null;
    city: string;
    countryCode: string;
    tuitionAnnual: number | null;
    currency: string;
    applicationDeadline: string | null;
    language: string | null;
    description: string | null;
    school: {
      id: string;
      name: string;
      city: string;
      countryCode: string;
      website: string | null;
      description: string | null;
    };
  };
};

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  SAVED: { label: "Saved", color: "text-slate-300", bgColor: "bg-slate-700", icon: "📌" },
  APPLIED: { label: "Applied", color: "text-blue-300", bgColor: "bg-blue-900/50", icon: "📤" },
  ACCEPTED: { label: "Accepted", color: "text-emerald-300", bgColor: "bg-emerald-900/50", icon: "🎉" },
  REJECTED: { label: "Rejected", color: "text-red-300", bgColor: "bg-red-900/50", icon: "❌" },
  WITHDRAWN: { label: "Withdrawn", color: "text-gray-400", bgColor: "bg-gray-800", icon: "↩️" },
};

export default function AdminApplicationDetail() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;
  
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin");
      return;
    }

    if (authStatus === "authenticated") {
      const userRole = (session?.user as { role?: string })?.role;
      if (userRole !== "ADMIN") {
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }
      fetchApplication();
    }
  }, [authStatus, session, router, applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/applications?search=${applicationId}`);
      
      if (res.status === 403) {
        setError("Access denied. Admin privileges required.");
        return;
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch application");
      }

      const data = await res.json();
      const found = data.applications.find((app: ApplicationDetail) => app.id === applicationId);
      
      if (!found) {
        setError("Application not found");
        return;
      }
      
      setApplication(found);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: ApplicationStatus) => {
    if (!application) return;
    
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: application.id, status: newStatus }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setApplication(data.application);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const downloadApplication = async () => {
    if (!application) return;
    
    setDownloading(true);
    try {
      const res = await fetch(`/api/admin/applications/download?id=${application.id}`);
      
      if (!res.ok) {
        throw new Error("Failed to generate PDF");
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `application-${application.user.user?.name || application.user.user?.email || "user"}-${application.program.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading:", err);
      alert("Failed to download application. PDF generation may not be implemented yet.");
    } finally {
      setDownloading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="w-20 h-20 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">Error</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <button onClick={() => router.push("/admin")} className="px-6 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
            Back to Dashboard
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
            <p className="text-slate-400">Loading application details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!application) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => router.push("/admin")}
            className="text-slate-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Application Details</h1>
              <p className="text-slate-400">ID: {application.id}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full font-medium ${STATUS_CONFIG[application.status].bgColor} ${STATUS_CONFIG[application.status].color}`}>
                {STATUS_CONFIG[application.status].icon} {STATUS_CONFIG[application.status].label}
              </span>
              <button
                onClick={downloadApplication}
                disabled={downloading}
                className="px-5 py-2.5 bg-emerald-600 rounded-lg font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50"
              >
                {downloading ? "⏳ Generating..." : "📥 Download PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Information */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>👤</span> Applicant Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">Full Name</label>
                <p className="text-white font-medium">{application.user.user?.name || "—"}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Email</label>
                <p className="text-white font-medium">{application.user.user?.email || "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">Nationality</label>
                <p className="text-white font-medium">{application.user.nationalityCode || "—"}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Subscription</label>
                <p className={`font-medium ${application.user.subscriptionStatus === "PREMIUM" ? "text-emerald-400" : "text-slate-300"}`}>
                  {application.user.subscriptionStatus || "FREE"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">CV Uses</label>
                <p className="text-white font-medium">{application.user.cvUsesCount}/3</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Target Countries</label>
                <p className="text-white font-medium">
                  {Array.isArray(application.user.targetCountries) 
                    ? (application.user.targetCountries as string[]).join(", ") 
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Program Information */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🎓</span> Program Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Program</label>
              <p className="text-white font-medium text-lg">{application.program.title}</p>
            </div>
            <div>
              <label className="text-sm text-slate-400">Institution</label>
              <p className="text-white font-medium">{application.program.school.name}</p>
              {application.program.school.website && (
                <a 
                  href={application.program.school.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:underline"
                >
                  {application.program.school.website}
                </a>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">Location</label>
                <p className="text-white font-medium">
                  📍 {application.program.city}, {application.program.countryCode}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Degree Level</label>
                <p className="text-white font-medium">{application.program.degreeLevel}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">Tuition (Annual)</label>
                <p className="text-white font-medium">
                  {application.program.currency} {application.program.tuitionAnnual?.toLocaleString() || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Duration</label>
                <p className="text-white font-medium">
                  {application.program.durationMonths ? `${application.program.durationMonths} months` : "—"}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400">Application Deadline</label>
              <p className="text-white font-medium">
                {application.program.applicationDeadline 
                  ? new Date(application.program.applicationDeadline).toLocaleDateString() 
                  : "Rolling admissions"}
              </p>
            </div>
          </div>
        </div>

        {/* Application Details */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📋</span> Application Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Current Status</label>
              <select
                value={application.status}
                onChange={(e) => updateStatus(e.target.value as ApplicationStatus)}
                className="w-full mt-2 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-slate-500"
              >
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <option key={status} value={status}>
                    {config.icon} {config.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">Saved On</label>
                <p className="text-white font-medium">
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Applied On</label>
                <p className="text-white font-medium">
                  {application.appliedAt 
                    ? new Date(application.appliedAt).toLocaleDateString() 
                    : "—"}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400">Last Updated</label>
              <p className="text-white font-medium">
                {new Date(application.updatedAt).toLocaleString()}
              </p>
            </div>
            {application.notes && (
              <div>
                <label className="text-sm text-slate-400">Notes</label>
                <p className="text-white bg-slate-700 rounded-lg p-3 mt-2">
                  {application.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateStatus("APPLIED")}
              className="px-4 py-3 bg-blue-900/50 text-blue-300 rounded-lg hover:bg-blue-900/70 transition-colors"
            >
              📤 Mark Applied
            </button>
            <button
              onClick={() => updateStatus("ACCEPTED")}
              className="px-4 py-3 bg-emerald-900/50 text-emerald-300 rounded-lg hover:bg-emerald-900/70 transition-colors"
            >
              🎉 Mark Accepted
            </button>
            <button
              onClick={() => updateStatus("REJECTED")}
              className="px-4 py-3 bg-red-900/50 text-red-300 rounded-lg hover:bg-red-900/70 transition-colors"
            >
              ❌ Mark Rejected
            </button>
            <button
              onClick={() => updateStatus("WITHDRAWN")}
              className="px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ↩️ Mark Withdrawn
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <button
              onClick={downloadApplication}
              disabled={downloading}
              className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50"
            >
              {downloading ? "⏳ Generating PDF..." : "📥 Download Full Application"}
            </button>
            <p className="text-xs text-slate-500 text-center mt-2">
              Admin downloads are free
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

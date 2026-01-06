"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type ApplicationStatus = "SAVED" | "APPLIED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

type Application = {
  id: string;
  status: ApplicationStatus;
  notes: string | null;
  appliedAt: string | null;
  createdAt: string;
  updatedAt: string;
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

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; icon: string }> = {
  SAVED: { label: "Saved", color: "bg-cream-300 text-charcoal", icon: "📌" },
  APPLIED: { label: "Applied", color: "bg-primary-100 text-primary-700", icon: "📤" },
  ACCEPTED: { label: "Accepted", color: "bg-green-100 text-green-700", icon: "🎉" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700", icon: "❌" },
  WITHDRAWN: { label: "Withdrawn", color: "bg-gray-100 text-gray-600", icon: "↩️" },
};

const COUNTRY_FLAGS: Record<string, string> = {
  DE: "🇩🇪",
  NL: "🇳🇱",
  FR: "🇫🇷",
  IT: "🇮🇹",
  ES: "🇪🇸",
  SE: "🇸🇪",
  GB: "🇬🇧",
  AT: "🇦🇹",
  BE: "🇧🇪",
  DK: "🇩🇰",
  FI: "🇫🇮",
  NO: "🇳🇴",
  PT: "🇵🇹",
  CH: "🇨🇭",
  IE: "🇮🇪",
};

export default function ApplicationsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ApplicationStatus | "ALL">("ALL");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [downloadAccess, setDownloadAccess] = useState<{ hasAccess: boolean; subscriptionStatus: string | null } | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/applications");
      return;
    }

    if (authStatus === "authenticated") {
      fetchApplications();
      checkDownloadAccess();
    }
  }, [authStatus, router]);

  const checkDownloadAccess = async () => {
    try {
      const res = await fetch("/api/applications/download", { method: "POST" });
      const data = await res.json();
      setDownloadAccess({ hasAccess: data.hasAccess, subscriptionStatus: data.subscriptionStatus });
    } catch (error) {
      console.error("Error checking download access:", error);
    }
  };

  const handleDownload = async (applicationId: string) => {
    if (!downloadAccess?.hasAccess) {
      setShowPaywall(true);
      return;
    }

    setDownloadingId(applicationId);
    try {
      const res = await fetch(`/api/applications/download?id=${applicationId}`);
      
      if (res.status === 402) {
        setShowPaywall(true);
        return;
      }

      if (!res.ok) {
        throw new Error("Download failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-application-${applicationId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (data.applications) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status: newStatus }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setApplications(apps => 
          apps.map(app => app.id === applicationId ? data.application : app)
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const saveNotes = async (applicationId: string) => {
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, notes: notesInput }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setApplications(apps => 
          apps.map(app => app.id === applicationId ? data.application : app)
        );
        setEditingNotes(null);
        setNotesInput("");
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const deleteApplication = async (applicationId: string) => {
    if (!confirm("Are you sure you want to remove this application?")) return;
    
    try {
      const res = await fetch(`/api/applications?id=${applicationId}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setApplications(apps => apps.filter(app => app.id !== applicationId));
      }
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const filteredApplications = filter === "ALL" 
    ? applications 
    : applications.filter(app => app.status === filter);

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<ApplicationStatus, number>);

  if (authStatus === "loading" || loading) {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-3xl">📚</span>
            </div>
            <p className="text-charcoal-light">Loading your applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="section-heading">My Applications</h1>
          <p className="text-charcoal-light">Track and manage your study program applications</p>
        </div>
        <button 
          onClick={() => router.push("/swipe")}
          className="btn-accent"
        >
          + Discover Programs
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {(Object.entries(STATUS_CONFIG) as [ApplicationStatus, typeof STATUS_CONFIG[ApplicationStatus]][]).map(([status, config]) => (
          <button
            key={status}
            onClick={() => setFilter(filter === status ? "ALL" : status)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              filter === status 
                ? "border-teal bg-primary-50" 
                : "border-cream-400 bg-white hover:border-primary-200"
            }`}
          >
            <div className="text-2xl mb-1">{config.icon}</div>
            <div className="text-2xl font-bold text-charcoal">{statusCounts[status] || 0}</div>
            <div className="text-xs text-charcoal-light">{config.label}</div>
          </button>
        ))}
      </div>

      {/* Filter indicator */}
      {filter !== "ALL" && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-charcoal-light">Showing:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[filter].color}`}>
            {STATUS_CONFIG[filter].icon} {STATUS_CONFIG[filter].label}
          </span>
          <button 
            onClick={() => setFilter("ALL")}
            className="text-sm text-teal hover:underline"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 bg-cream-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📋</span>
          </div>
          <h3 className="text-xl font-semibold text-charcoal mb-2">
            {filter === "ALL" ? "No applications yet" : `No ${STATUS_CONFIG[filter].label.toLowerCase()} applications`}
          </h3>
          <p className="text-charcoal-light mb-6">
            {filter === "ALL" 
              ? "Start exploring programs and save the ones you're interested in!"
              : "Try changing the filter to see other applications."}
          </p>
          <button onClick={() => router.push("/swipe")} className="btn-primary">
            Browse Programs
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app, index) => (
            <div 
              key={app.id} 
              className="card animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Program Info */}
                <div className="flex-grow">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl">{COUNTRY_FLAGS[app.program.countryCode] || "🌍"}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-teal">{app.program.title}</h3>
                      <p className="text-charcoal-light">{app.program.school.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-charcoal mt-3">
                    <span className="flex items-center gap-1">
                      📍 {app.program.city}, {app.program.countryCode}
                    </span>
                    <span className="flex items-center gap-1">
                      💰 €{app.program.tuitionAnnual?.toLocaleString() || "N/A"}/year
                    </span>
                    {app.program.applicationDeadline && (
                      <span className="flex items-center gap-1">
                        📅 Deadline: {new Date(app.program.applicationDeadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Notes Section */}
                  {editingNotes === app.id ? (
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder="Add a note..."
                        className="input-field flex-grow"
                        autoFocus
                      />
                      <button 
                        onClick={() => saveNotes(app.id)}
                        className="btn-primary px-4"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => { setEditingNotes(null); setNotesInput(""); }}
                        className="btn-outline px-4"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : app.notes ? (
                    <div 
                      className="mt-3 p-3 bg-cream-100 rounded-lg text-sm text-charcoal cursor-pointer hover:bg-cream-200 transition-colors"
                      onClick={() => { setEditingNotes(app.id); setNotesInput(app.notes || ""); }}
                    >
                      📝 {app.notes}
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingNotes(app.id); setNotesInput(""); }}
                      className="mt-3 text-sm text-teal hover:underline"
                    >
                      + Add notes
                    </button>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col gap-3 lg:items-end">
                  {/* Current Status Badge */}
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${STATUS_CONFIG[app.status].color}`}>
                    {STATUS_CONFIG[app.status].icon} {STATUS_CONFIG[app.status].label}
                  </div>

                  {/* Status Actions */}
                  <div className="flex flex-wrap gap-2">
                    {app.status === "SAVED" && (
                      <button
                        onClick={() => updateStatus(app.id, "APPLIED")}
                        className="px-3 py-1.5 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                      >
                        Mark as Applied
                      </button>
                    )}
                    {app.status === "APPLIED" && (
                      <>
                        <button
                          onClick={() => updateStatus(app.id, "ACCEPTED")}
                          className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          🎉 Accepted
                        </button>
                        <button
                          onClick={() => updateStatus(app.id, "REJECTED")}
                          className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Rejected
                        </button>
                        <button
                          onClick={() => updateStatus(app.id, "WITHDRAWN")}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Withdraw
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDownload(app.id)}
                      disabled={downloadingId === app.id}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        downloadAccess?.hasAccess
                          ? "bg-teal text-white hover:bg-teal-light"
                          : "bg-gold-500 text-charcoal-dark hover:bg-gold-400"
                      }`}
                    >
                      {downloadingId === app.id ? "⏳..." : downloadAccess?.hasAccess ? "📥 Download" : "📥 Download (Premium)"}
                    </button>
                    <button
                      onClick={() => deleteApplication(app.id)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      🗑️ Remove
                    </button>
                  </div>

                  {/* Timestamps */}
                  <div className="text-xs text-charcoal-light">
                    {app.appliedAt && (
                      <span>Applied: {new Date(app.appliedAt).toLocaleDateString()} • </span>
                    )}
                    <span>Saved: {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Tips */}
      {applications.length > 0 && (
        <div className="mt-12 p-6 bg-primary-50 rounded-xl border border-primary-100">
          <h3 className="font-semibold text-teal mb-3">💡 Application Tips</h3>
          <ul className="space-y-2 text-sm text-charcoal">
            <li>• Keep track of deadlines - set reminders for upcoming application dates</li>
            <li>• Add notes to remember specific requirements for each program</li>
            <li>• Update your status as you progress through the application process</li>
            <li>• Consider applying to multiple programs to increase your chances</li>
          </ul>
        </div>
      )}

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slide-up">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✨</span>
              </div>
              <h2 className="text-2xl font-bold text-charcoal mb-2">Unlock Downloads</h2>
              <p className="text-charcoal-light mb-6">
                Download your applications as professional documents to share with schools or keep for your records.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 border-2 border-cream-400 rounded-xl hover:border-teal transition-colors cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-charcoal">Single Download</span>
                  <span className="text-teal font-bold">€4.99</span>
                </div>
                <p className="text-sm text-charcoal-light">Download one application document</p>
              </div>

              <div className="p-4 border-2 border-gold-500 bg-gold-50 rounded-xl cursor-pointer relative">
                <div className="absolute -top-3 left-4 px-2 py-0.5 bg-gold-500 text-charcoal-dark text-xs font-bold rounded">
                  BEST VALUE
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-charcoal">Premium Access</span>
                  <span className="text-teal font-bold">€19.99</span>
                </div>
                <p className="text-sm text-charcoal-light">Unlimited downloads + CV Analysis + Visa Checklists</p>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => {
                  // TODO: Integrate payment provider (Stripe)
                  alert("Payment integration coming soon! Contact support for early access.");
                }}
                className="w-full btn-accent"
              >
                Continue to Payment
              </button>
              <button 
                onClick={() => setShowPaywall(false)}
                className="w-full text-charcoal-light hover:text-charcoal transition-colors text-sm"
              >
                Maybe later
              </button>
            </div>

            <p className="text-xs text-charcoal-light text-center mt-4">
              🔒 Secure payment powered by Stripe
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

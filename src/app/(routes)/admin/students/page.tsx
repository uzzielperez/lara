"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import {
  STAGE_LABEL,
  type PathwayStage,
  type PaymentStatus,
  type StaffStudentRow,
} from "@/lib/staff-pathway-mock";
import { canAccessStaffUi } from "@/lib/staff";
import { deriveFreemiumStage, deriveNextFunnelAction } from "@/lib/funnel-stage";
import type { ProfileInput } from "@/lib/user-profile";
import { derivePathwayStage, pathwayProgress, isPaidPathwayClient } from "@/lib/pathway";

type Tab = "pathway" | "pipeline";

type PipelineUser = {
  id: string;
  nationalityCode: string | null;
  chatUsesCount: number;
  subscriptionStatus: string | null;
  intakeCompletedAt: string | null;
  pathwayAdmissionPaid: boolean;
  pathwayVisaPaid: boolean;
  pathwayLandingPaid: boolean;
  createdAt: string;
  user: { name: string | null; email: string | null };
  _count: { applications: number };
};

const PAYMENT_STYLE: Record<PaymentStatus, string> = {
  PAID: "bg-emerald-900/50 text-emerald-300",
  PARTIAL: "bg-amber-900/40 text-amber-200",
  PENDING: "bg-slate-700 text-slate-300",
  OVERDUE: "bg-rose-900/50 text-rose-300",
};

const STAGE_STYLE: Record<PathwayStage, string> = {
  SCHOOL_ADMISSION: "bg-fuchsia-900/40 text-fuchsia-200",
  VISA_APPLICATION: "bg-sky-900/40 text-sky-200",
  LANDING_SUPPORT: "bg-violet-900/40 text-violet-200",
  COMPLETED: "bg-emerald-900/40 text-emerald-200",
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-400"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 w-8">{value}%</span>
    </div>
  );
}

export default function StaffStudentsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pipeline");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<PathwayStage | "ALL">("ALL");
  const [selected, setSelected] = useState<StaffStudentRow | null>(null);
  const [pipelineUsers, setPipelineUsers] = useState<PipelineUser[]>([]);
  const [pipelineLoading, setPipelineLoading] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/students");
      return;
    }
    if (authStatus === "authenticated") {
      const role = (session?.user as { role?: string })?.role;
      const email = session?.user?.email;
      if (!canAccessStaffUi({ email, role })) router.push("/");
      else fetchPipelineUsers();
    }
  }, [authStatus, session, router]);

  async function fetchPipelineUsers() {
    try {
      setPipelineLoading(true);
      const res = await fetch("/api/admin/users?limit=100");
      if (!res.ok) return;
      const data = await res.json();
      setPipelineUsers(data.users ?? []);
    } finally {
      setPipelineLoading(false);
    }
  }

  const pipelineRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pipelineUsers
      .filter((u) => u.user?.email && !u.user.email.includes("filipinas-abroad.com"))
      .filter((u) => !isPaidPathwayClient(u))
      .filter((u) => {
        if (!q) return true;
        const name = u.user?.name?.toLowerCase() ?? "";
        const email = u.user?.email?.toLowerCase() ?? "";
        return name.includes(q) || email.includes(q);
      })
      .map((u) => {
        const profile: ProfileInput = {
          nationalityCode: u.nationalityCode,
          intakeCompletedAt: u.intakeCompletedAt,
          studyGoals: (u as { studyGoals?: string | null }).studyGoals,
          backgroundStory: (u as { backgroundStory?: string | null }).backgroundStory,
          lookingForward: (u as { lookingForward?: string | null }).lookingForward,
          cvText: (u as { cvText?: string | null }).cvText,
        };
        const freemiumStage = deriveFreemiumStage({
          ...profile,
          chatUsesCount: u.chatUsesCount,
          subscriptionStatus: u.subscriptionStatus,
          applicationCount: u._count.applications,
        });
        const days = Math.max(
          0,
          Math.floor((Date.now() - new Date(u.createdAt).getTime()) / 86400000)
        );
        return {
          id: u.id,
          name: u.user?.name ?? "—",
          email: u.user?.email ?? "",
          freemiumStage,
          chatUses: u.chatUsesCount,
          appsSaved: u._count.applications,
          nextAction: deriveNextFunnelAction({
            ...profile,
            chatUsesCount: u.chatUsesCount,
            subscriptionStatus: u.subscriptionStatus,
            applicationCount: u._count.applications,
          }),
          daysInProcess: days,
          country: u.nationalityCode ?? "—",
        };
      });
  }, [pipelineUsers, search]);

  const pathwayRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pipelineUsers
      .filter((u) => u.user?.email && isPaidPathwayClient(u))
      .filter((u) => {
        if (!q) return true;
        const name = u.user?.name?.toLowerCase() ?? "";
        const email = u.user?.email?.toLowerCase() ?? "";
        return name.includes(q) || email.includes(q);
      })
      .map((u) => {
        const stage = derivePathwayStage(u);
        const days = Math.max(
          0,
          Math.floor((Date.now() - new Date(u.createdAt).getTime()) / 86400000)
        );
        const paid = [
          u.pathwayAdmissionPaid && "Admission",
          u.pathwayVisaPaid && "Visa",
          u.pathwayLandingPaid && "Landing",
        ]
          .filter(Boolean)
          .join(", ");
        return {
          id: u.id,
          name: u.user?.name ?? "—",
          email: u.user?.email ?? "",
          country: u.nationalityCode ?? "—",
          targetIntake: "—",
          stage: stage ?? "SCHOOL_ADMISSION",
          progress: pathwayProgress(stage),
          missing: paid ? `Paid: ${paid}` : "—",
          paymentLabel: paid || "Stripe",
          paymentStatus: "PAID" as PaymentStatus,
          nextAction: stage === "LANDING_SUPPORT" ? "Landing checklist" : "Review docs",
          daysInProcess: days,
          assignedStaff: "LARA team",
          clientStatus: "ACTIVE" as const,
          freemiumStage: u.subscriptionStatus ?? "FREE",
          chatUses: u.chatUsesCount,
          appsSaved: u._count.applications,
        } satisfies StaffStudentRow;
      });
  }, [pipelineUsers, search]);

  const filteredPathwayRows = useMemo(() => {
    return pathwayRows.filter(
      (r) => stageFilter === "ALL" || r.stage === stageFilter
    );
  }, [pathwayRows, stageFilter]);

  if (authStatus === "loading") {
    return (
      <AdminShell title="Students" subtitle="Loading…">
        <p className="text-slate-400">Loading…</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Students"
      subtitle="Freemium funnel and Stripe-paid pathway clients"
      actions={
        <div className="flex gap-1 p-1 rounded-lg bg-slate-800/80">
          {(
            [
              ["pathway", "Pathway (paid)"],
              ["pipeline", "Pipeline (free)"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`text-xs sm:text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${
                tab === id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      }
    >
      <div className="max-w-[1400px] space-y-5">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold mb-1">
              {tab === "pathway" ? "Live · Stripe pathway" : "Live · Neon users"}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {tab === "pathway"
                ? "Clients who paid for Admission, Visa, or Landing packages."
                : "Free users before they purchase a package."}
            </p>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student…"
            className="w-full sm:w-56 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
          {tab === "pathway" && (
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as PathwayStage | "ALL")}
              className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
            >
              <option value="ALL">All stages</option>
              {(Object.keys(STAGE_LABEL) as PathwayStage[]).map((k) => (
                <option key={k} value={k}>{STAGE_LABEL[k]}</option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Freemium users", value: pipelineRows.length, color: "text-sky-300" },
            { label: "Paid pathway", value: pathwayRows.length, color: "text-emerald-300" },
            { label: "Need profile", value: pipelineRows.filter((r) => r.freemiumStage === "Needs profile").length, color: "text-amber-300" },
            { label: "Tracking apps", value: pipelineRows.filter((r) => r.freemiumStage === "Tracking apps").length, color: "text-violet-300" },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-xs text-slate-400 mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  {tab === "pathway" ? (
                    <>
                      <th className="px-4 py-3 font-medium">Intake</th>
                      <th className="px-4 py-3 font-medium">Current stage</th>
                      <th className="px-4 py-3 font-medium">Progress</th>
                      <th className="px-4 py-3 font-medium">Missing</th>
                      <th className="px-4 py-3 font-medium">Payment</th>
                      <th className="px-4 py-3 font-medium">Next action</th>
                      <th className="px-4 py-3 font-medium">Days</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 font-medium">Freemium stage</th>
                      <th className="px-4 py-3 font-medium">Chat uses</th>
                      <th className="px-4 py-3 font-medium">Apps saved</th>
                      <th className="px-4 py-3 font-medium">Next action</th>
                      <th className="px-4 py-3 font-medium">Days</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tab === "pathway"
                  ? filteredPathwayRows.map((s) => (
                      <tr
                        key={s.id}
                        onClick={() => setSelected(s)}
                        className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">{s.name}</p>
                          <p className="text-xs text-slate-500">
                            {s.country} · {s.assignedStaff}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{s.targetIntake}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex text-xs px-2 py-1 rounded-full ${STAGE_STYLE[s.stage]}`}
                          >
                            {STAGE_LABEL[s.stage]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <ProgressBar value={s.progress} />
                        </td>
                        <td className="px-4 py-3 text-amber-200/90">{s.missing}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex text-xs px-2 py-1 rounded-full ${PAYMENT_STYLE[s.paymentStatus]}`}
                          >
                            {s.paymentLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{s.nextAction}</td>
                        <td className="px-4 py-3 text-slate-400">{s.daysInProcess}d</td>
                      </tr>
                    ))
                  : pipelineLoading
                    ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                            Loading users…
                          </td>
                        </tr>
                      )
                    : pipelineRows.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-white">{s.name}</p>
                            <p className="text-xs text-slate-500">{s.country} · {s.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-200">
                              {s.freemiumStage}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">{s.chatUses}/5</td>
                          <td className="px-4 py-3 text-slate-300">{s.appsSaved}</td>
                          <td className="px-4 py-3 text-slate-300">{s.nextAction}</td>
                          <td className="px-4 py-3 text-slate-400">{s.daysInProcess}d</td>
                        </tr>
                      ))}
              </tbody>
            </table>
          </div>
          {(tab === "pathway" && filteredPathwayRows.length === 0) ||
          (tab === "pipeline" && !pipelineLoading && pipelineRows.length === 0) ? (
            <p className="px-4 py-10 text-center text-slate-500 text-sm">No students match.</p>
          ) : null}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-black/50"
          onClick={() => setSelected(null)}
        >
          <aside
            className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 overflow-auto p-5 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                <p className="text-sm text-slate-400">{selected.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-slate-500 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-slate-800 p-3">
                <p className="text-slate-500 mb-1">Intake</p>
                <p className="font-medium">{selected.targetIntake}</p>
              </div>
              <div className="rounded-lg bg-slate-800 p-3">
                <p className="text-slate-500 mb-1">Assigned</p>
                <p className="font-medium">{selected.assignedStaff}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                Paid pathway
              </p>
              <div className="space-y-2">
                {(
                  [
                    ["School Admission", "€480", selected.stage === "SCHOOL_ADMISSION"],
                    ["Visa Application", "€480", selected.stage === "VISA_APPLICATION"],
                    ["Landing Support", "€240", selected.stage === "LANDING_SUPPORT"],
                  ] as const
                ).map(([label, price, active]) => (
                  <div
                    key={label}
                    className={`rounded-lg border px-3 py-2.5 flex justify-between items-center ${
                      active
                        ? "border-indigo-500/50 bg-indigo-950/40"
                        : "border-slate-800 bg-slate-800/40"
                    }`}
                  >
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs text-slate-400">{price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                Status
              </p>
              <ul className="text-sm space-y-2 text-slate-300">
                <li>
                  Stage: <strong className="text-white">{STAGE_LABEL[selected.stage]}</strong>
                </li>
                <li>
                  Progress: <strong className="text-white">{selected.progress}%</strong>
                </li>
                <li>
                  Missing: <strong className="text-amber-200">{selected.missing}</strong>
                </li>
                <li>
                  Payment: <strong className="text-white">{selected.paymentLabel}</strong>
                </li>
                <li>
                  Next: <strong className="text-white">{selected.nextAction}</strong>
                </li>
                <li>
                  Freemium: {selected.freemiumStage} · {selected.chatUses} prompts ·{" "}
                  {selected.appsSaved} apps
                </li>
              </ul>
            </div>

            <p className="text-xs text-slate-500 border-t border-slate-800 pt-4">
              Pathway stages update when Stripe checkout completes for each package.
            </p>
          </aside>
        </div>
      )}
    </AdminShell>
  );
}

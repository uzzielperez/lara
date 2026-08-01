"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  MOCK_KPIS,
  MOCK_STUDENTS,
  STAGE_LABEL,
  type PathwayStage,
  type PaymentStatus,
  type StaffStudentRow,
} from "@/lib/staff-pathway-mock";
import { canAccessStaffUi } from "@/lib/staff";

type Tab = "pathway" | "pipeline";

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
  const [tab, setTab] = useState<Tab>("pathway");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<PathwayStage | "ALL">("ALL");
  const [selected, setSelected] = useState<StaffStudentRow | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/students");
      return;
    }
    if (authStatus === "authenticated") {
      const role = (session?.user as { role?: string })?.role;
      const email = session?.user?.email;
      if (!canAccessStaffUi({ email, role })) router.push("/");
    }
  }, [authStatus, session, router]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_STUDENTS.filter((s) => {
      const okStage = stageFilter === "ALL" || s.stage === stageFilter;
      const okSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.missing.toLowerCase().includes(q);
      return okStage && okSearch;
    });
  }, [search, stageFilter]);

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading staff…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-20">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-bold tracking-tight text-white">
              LARA Staff
            </Link>
            <nav className="flex gap-1 p-1 rounded-lg bg-slate-800/80">
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
                    tab === id
                      ? "bg-indigo-500 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 flex-1 sm:flex-none justify-end">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student…"
              className="w-full sm:w-56 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
            <Link
              href="/admin"
              className="text-xs text-slate-400 hover:text-white whitespace-nowrap px-2"
            >
              Apps admin →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-6 space-y-5">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold mb-1">
              UI preview · mock data
            </p>
            <h1 className="text-2xl font-bold text-white">
              {tab === "pathway" ? "Student pathway" : "Freemium pipeline"}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {tab === "pathway"
                ? "Track paid Admission → Visa → Landing and where students languish."
                : "See free-user funnel stages before they purchase a package."}
            </p>
          </div>
          {tab === "pathway" && (
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as PathwayStage | "ALL")}
              className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
            >
              <option value="ALL">All stages</option>
              {(Object.keys(STAGE_LABEL) as PathwayStage[]).map((k) => (
                <option key={k} value={k}>
                  {STAGE_LABEL[k]}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Active students", value: MOCK_KPIS.activeStudents, color: "text-violet-300" },
            { label: "Need staff action today", value: MOCK_KPIS.needActionToday, color: "text-emerald-300" },
            { label: "Overdue payments", value: MOCK_KPIS.overduePayments, color: "text-rose-300" },
            { label: "At risk of missing intake", value: MOCK_KPIS.atRiskIntake, color: "text-amber-300" },
            { label: "Waiting for client docs", value: MOCK_KPIS.waitingOnDocs, color: "text-sky-300" },
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3"
            >
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-xs text-slate-400 mt-1 leading-snug">{k.label}</p>
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
                {rows.map((s) => (
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
                    {tab === "pathway" ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-200">
                            {s.freemiumStage}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{s.chatUses}/5</td>
                        <td className="px-4 py-3 text-slate-300">{s.appsSaved}</td>
                        <td className="px-4 py-3 text-slate-300">{s.nextAction}</td>
                        <td className="px-4 py-3 text-slate-400">{s.daysInProcess}d</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && (
            <p className="px-4 py-10 text-center text-slate-500 text-sm">No students match.</p>
          )}
        </div>
      </main>

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
              Mock UI only — Stripe, checklists, and live DB wiring come next.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

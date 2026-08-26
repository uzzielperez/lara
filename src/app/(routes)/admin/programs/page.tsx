"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { canAccessStaffUi } from "@/lib/staff";

type SchoolOption = { id: string; name: string };
type ProgramRow = {
  id: string;
  title: string;
  degreeLevel: string;
  city: string;
  countryCode: string;
  tuitionAnnual: number | null;
  applicationDeadline: string | null;
  school: { id: string; name: string };
};

const EMPTY_FORM = {
  schoolId: "",
  title: "",
  degreeLevel: "MASTERS",
  city: "",
  countryCode: "",
  tuitionAnnual: "",
  applicationDeadline: "",
  language: "EN",
  durationMonths: "",
  description: "",
};

export default function AdminProgramsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [degreeLevels, setDegreeLevels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/programs");
      return;
    }
    if (authStatus === "authenticated") {
      const role = (session?.user as { role?: string })?.role;
      if (!canAccessStaffUi({ email: session?.user?.email, role })) {
        setError("Access denied.");
        setLoading(false);
        return;
      }
      loadData();
    }
  }, [authStatus, session, router]);

  async function loadData() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      const [progRes, schoolRes] = await Promise.all([
        fetch(`/api/admin/programs?${params}`),
        fetch("/api/admin/schools"),
      ]);
      if (!progRes.ok) throw new Error("Failed to load programs");
      const progData = await progRes.json();
      const schoolData = await schoolRes.json();
      setPrograms(progData.programs ?? []);
      setDegreeLevels(progData.degreeLevels ?? []);
      setSchools(
        (schoolData.schools ?? []).map((s: { id: string; name: string }) => ({
          id: s.id,
          name: s.name,
        }))
      );
      if (!form.schoolId && schoolData.schools?.[0]?.id) {
        setForm((f) => ({ ...f, schoolId: schoolData.schools[0].id }));
      }
    } catch {
      setError("Failed to load programs");
    } finally {
      setLoading(false);
    }
  }

  async function saveProgram(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      ...(editingId ? { id: editingId } : {}),
      schoolId: form.schoolId,
      title: form.title,
      degreeLevel: form.degreeLevel,
      city: form.city,
      countryCode: form.countryCode,
      language: form.language,
      description: form.description,
      tuitionAnnual: form.tuitionAnnual ? Number(form.tuitionAnnual) : null,
      durationMonths: form.durationMonths ? Number(form.durationMonths) : null,
      applicationDeadline: form.applicationDeadline || null,
    };
    const res = await fetch("/api/admin/programs", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }
    setForm((f) => ({ ...EMPTY_FORM, schoolId: f.schoolId }));
    setEditingId(null);
    await loadData();
  }

  async function deleteProgram(id: string) {
    if (!confirm("Delete this program?")) return;
    const res = await fetch(`/api/admin/programs?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Delete failed");
      return;
    }
    await loadData();
  }

  function startEdit(program: ProgramRow) {
    setEditingId(program.id);
    setForm({
      schoolId: program.school.id,
      title: program.title,
      degreeLevel: program.degreeLevel,
      city: program.city,
      countryCode: program.countryCode,
      tuitionAnnual: program.tuitionAnnual != null ? String(program.tuitionAnnual) : "",
      applicationDeadline: program.applicationDeadline
        ? program.applicationDeadline.slice(0, 10)
        : "",
      language: "EN",
      durationMonths: "",
      description: "",
    });
  }

  if (error && programs.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 text-center">
        <p className="text-red-400 mb-4">{error}</p>
      </div>
    );
  }

  return (
    <AdminShell title="Programs" subtitle="Programs linked to schools">
      <div className="max-w-6xl space-y-6">
        {error && (
          <div className="rounded-lg bg-red-900/40 border border-red-800 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={saveProgram} className="bg-slate-800 rounded-xl p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
            value={form.schoolId}
            onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
            required
          >
            <option value="">Select school</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <input
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm lg:col-span-2"
            placeholder="Program title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <select
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
            value={form.degreeLevel}
            onChange={(e) => setForm({ ...form, degreeLevel: e.target.value })}
          >
            {degreeLevels.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
          <input
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
            placeholder="Country (ES)"
            value={form.countryCode}
            onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
            required
          />
          <input
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
            placeholder="Tuition €/year"
            value={form.tuitionAnnual}
            onChange={(e) => setForm({ ...form, tuitionAnnual: e.target.value })}
          />
          <input
            type="date"
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
            value={form.applicationDeadline}
            onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
          />
          <div className="flex gap-2 lg:col-span-4">
            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium hover:bg-indigo-500">
              {editingId ? "Update program" : "Add program"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setForm((f) => ({ ...EMPTY_FORM, schoolId: f.schoolId })); }}
                className="px-4 py-2 rounded-lg bg-slate-700 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="flex gap-3">
          <input
            className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm"
            placeholder="Search programs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" onClick={() => loadData()} className="px-4 py-2 rounded-lg bg-slate-700 text-sm">
            Search
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : (
          <div className="bg-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-700/50 text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left">Program</th>
                  <th className="px-4 py-3 text-left">School</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Tuition</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {programs.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-750/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-slate-500">{p.degreeLevel}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{p.school.name}</td>
                    <td className="px-4 py-3 text-slate-400">{p.city}, {p.countryCode}</td>
                    <td className="px-4 py-3">€{p.tuitionAnnual?.toLocaleString() ?? "—"}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button type="button" onClick={() => startEdit(p)} className="text-indigo-400 text-xs">
                        Edit
                      </button>
                      <button type="button" onClick={() => deleteProgram(p.id)} className="text-red-400 text-xs">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {programs.length === 0 && (
              <p className="px-4 py-10 text-center text-slate-500">No programs yet.</p>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

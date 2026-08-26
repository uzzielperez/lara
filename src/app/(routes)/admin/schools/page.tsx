"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { canAccessStaffUi } from "@/lib/staff";

type SchoolRow = {
  id: string;
  name: string;
  countryCode: string;
  city: string;
  website: string | null;
  description: string | null;
  _count: { programs: number };
};

const EMPTY_FORM = {
  name: "",
  countryCode: "",
  city: "",
  website: "",
  description: "",
};

export default function AdminSchoolsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/schools");
      return;
    }
    if (authStatus === "authenticated") {
      const role = (session?.user as { role?: string })?.role;
      if (!canAccessStaffUi({ email: session?.user?.email, role })) {
        setError("Access denied.");
        setLoading(false);
        return;
      }
      fetchSchools();
    }
  }, [authStatus, session, router]);

  async function fetchSchools() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/schools?${params}`);
      if (!res.ok) throw new Error("Failed to load schools");
      const data = await res.json();
      setSchools(data.schools ?? []);
    } catch {
      setError("Failed to load schools");
    } finally {
      setLoading(false);
    }
  }

  async function saveSchool(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      ...(editingId ? { id: editingId } : {}),
      name: form.name,
      countryCode: form.countryCode,
      city: form.city,
      website: form.website,
      description: form.description,
    };
    const res = await fetch("/api/admin/schools", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }
    setForm(EMPTY_FORM);
    setEditingId(null);
    await fetchSchools();
  }

  async function deleteSchool(id: string) {
    if (!confirm("Delete this school? Programs must be removed first.")) return;
    const res = await fetch(`/api/admin/schools?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Delete failed");
      return;
    }
    await fetchSchools();
  }

  function startEdit(school: SchoolRow) {
    setEditingId(school.id);
    setForm({
      name: school.name,
      countryCode: school.countryCode,
      city: school.city,
      website: school.website ?? "",
      description: school.description ?? "",
    });
  }

  if (error && schools.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href="/" className="text-slate-400 underline">Home</Link>
      </div>
    );
  }

  return (
    <AdminShell title="Schools" subtitle="Partner school catalog">
      <div className="max-w-6xl space-y-6">
        {error && (
          <div className="rounded-lg bg-red-900/40 border border-red-800 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={saveSchool} className="bg-slate-800 rounded-xl p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
            placeholder="School name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
          <input
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
            placeholder="Country code (ES)"
            value={form.countryCode}
            onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
            required
          />
          <input
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
            placeholder="Website"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
          <input
            className="px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-sm sm:col-span-2"
            placeholder="Short description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium hover:bg-indigo-500">
              {editingId ? "Update school" : "Add school"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }}
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
            placeholder="Search schools…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            onClick={() => fetchSchools()}
            className="px-4 py-2 rounded-lg bg-slate-700 text-sm"
          >
            Search
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : (
          <div className="bg-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-700/50 text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Programs</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {schools.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-750/50">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-slate-400">{s.city}, {s.countryCode}</td>
                    <td className="px-4 py-3">{s._count.programs}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button type="button" onClick={() => startEdit(s)} className="text-indigo-400 text-xs">
                        Edit
                      </button>
                      <button type="button" onClick={() => deleteSchool(s.id)} className="text-red-400 text-xs">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {schools.length === 0 && (
              <p className="px-4 py-10 text-center text-slate-500">No schools yet.</p>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

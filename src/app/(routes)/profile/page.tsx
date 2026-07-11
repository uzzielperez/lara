"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type ProfileData = {
  name: string;
  email: string;
  nationalityCode: string;
  rentBudgetMin: number;
  rentBudgetMax: number;
  universityBudgetMin: number;
  universityBudgetMax: number;
  targetCountries: string[];
  degreeLevels: string[];
  cefrLevel: string;
  desiredStart: string;
  studyGoals: string;
  backgroundStory: string;
  lookingForward: string;
  cvFileName: string;
  completionPercent: number;
  matchingReady: boolean;
};

const COUNTRY_FLAGS: Record<string, string> = {
  DE: "🇩🇪",
  NL: "🇳🇱",
  FR: "🇫🇷",
  IT: "🇮🇹",
  ES: "🇪🇸",
  SE: "🇸🇪",
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    nationalityCode: "",
    rentBudgetMin: 500,
    rentBudgetMax: 1200,
    universityBudgetMin: 0,
    universityBudgetMax: 20000,
    targetCountries: [],
    degreeLevels: [],
    cefrLevel: "B2",
    desiredStart: "",
    studyGoals: "",
    backgroundStory: "",
    lookingForward: "",
    cvFileName: "",
    completionPercent: 0,
    matchingReady: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Load from session initially
    if (session?.user) {
      setProfile(prev => ({
        ...prev,
        name: session.user?.name || prev.name,
        email: session.user?.email || prev.email,
      }));
    }

    // 2. Try to load from database
    if (authStatus === "authenticated") {
      setLoading(true);
      fetch("/api/profile")
        .then(res => res.json())
        .then(data => {
          if (data.profile) {
            const p = data.profile;
            setProfile(prev => ({
              ...prev,
              name: p.user?.name || prev.name,
              email: p.user?.email || prev.email,
              nationalityCode: p.nationalityCode || prev.nationalityCode,
              rentBudgetMin: p.budgetMinMonthly || prev.rentBudgetMin,
              rentBudgetMax: p.budgetMaxMonthly || prev.rentBudgetMax,
              targetCountries: (p.targetCountries || prev.targetCountries).slice(0, 3),
              degreeLevels: p.degreeLevels || prev.degreeLevels,
              cefrLevel: p.cefrLevel || prev.cefrLevel,
              universityBudgetMin: p.universityBudgetMin ?? prev.universityBudgetMin,
              universityBudgetMax: p.universityBudgetMax ?? prev.universityBudgetMax,
              desiredStart: p.desiredStart ? p.desiredStart.split('T')[0] : prev.desiredStart,
              studyGoals: p.studyGoals || prev.studyGoals,
              backgroundStory: p.backgroundStory || prev.backgroundStory,
              lookingForward: p.lookingForward || prev.lookingForward,
              cvFileName: p.cvFileName || prev.cvFileName,
              completionPercent: data.completionPercent ?? prev.completionPercent,
              matchingReady: data.matchingReady ?? prev.matchingReady,
            }));
          }
        })
        .catch(err => console.error("Error loading profile:", err))
        .finally(() => setLoading(false));
    } else {
      // 3. Fallback to localStorage for guest users
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          setProfile(parsed);
        } catch (e) {
          console.error("Error parsing local profile", e);
        }
      }
    }
  }, [session, authStatus]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem('userProfile', JSON.stringify(profile));

      // Save to database if logged in
      if (authStatus === "authenticated") {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nationalityCode: profile.nationalityCode,
            budgetMinMonthly: profile.rentBudgetMin,
            budgetMaxMonthly: profile.rentBudgetMax,
            universityBudgetMin: profile.universityBudgetMin,
            universityBudgetMax: profile.universityBudgetMax,
            targetCountries: profile.targetCountries.slice(0, 3),
            degreeLevels: profile.degreeLevels,
            cefrLevel: profile.cefrLevel,
            desiredStart: profile.desiredStart,
            studyGoals: profile.studyGoals,
            backgroundStory: profile.backgroundStory,
            lookingForward: profile.lookingForward,
          }),
        });
        if (!res.ok) throw new Error("Failed to save profile");
        const data = await res.json();
        setProfile(prev => ({
          ...prev,
          completionPercent: data.completionPercent ?? prev.completionPercent,
          matchingReady: data.matchingReady ?? prev.matchingReady,
        }));
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || authStatus !== "authenticated") return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/profile/cv", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setCvFile(file);
      setProfile({ ...profile, cvFileName: data.cvFileName });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not upload CV");
    } finally {
      setLoading(false);
    }
  };

  const degreeLevelLabels: { [key: string]: string } = {
    "BACHELORS": "🎓 Bachelor's Degree",
    "MASTERS": "📚 Master's Degree", 
    "PHD": "🔬 PhD",
    "DIPLOMA": "📜 Diploma"
  };

  if (authStatus === "loading" || (loading && !isEditing)) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="card">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="section-heading">Your Dashboard</h1>
            <p className="text-charcoal-light">Your study-abroad profile — fill in more anytime</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? "btn-outline" : "btn-accent"}
            disabled={loading}
          >
            {isEditing ? "Cancel" : "✏️ Edit details"}
          </button>
        </div>

        {/* Completion meter */}
        <div className="mb-8 p-5 rounded-xl" style={{ background: "var(--surface-warm)", border: "1px solid var(--hairline)" }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>Profile completeness</span>
            <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>{profile.completionPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full mb-3" style={{ background: "var(--hairline-strong)" }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${profile.completionPercent}%`, background: "var(--accent)" }}
            />
          </div>
          {!profile.matchingReady && (
            <p className="text-xs" style={{ color: "var(--ink-soft)" }}>
              Add budget, countries & deadlines below for sharper program matches — optional for now.
            </p>
          )}
        </div>

        {/* Conversational intake summary */}
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-semibold text-teal border-b border-cream-300 pb-2 flex items-center gap-2">
            <span>💬</span> Your story
          </h2>
          <div>
            <label className="block text-sm font-medium text-charcoal-light mb-2">What you&apos;re looking for</label>
            {isEditing ? (
              <textarea
                value={profile.studyGoals}
                onChange={(e) => setProfile({ ...profile, studyGoals: e.target.value })}
                className="input-field h-20 resize-none"
                placeholder="Your study goals…"
              />
            ) : (
              <p className="p-3 bg-cream-100 rounded-lg text-charcoal min-h-[60px]">
                {profile.studyGoals || "Not set — "}
                {!profile.studyGoals && (
                  <Link href="/intake" className="text-teal underline">start intake chat</Link>
                )}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-light mb-2">Background & experience</label>
            {isEditing ? (
              <textarea
                value={profile.backgroundStory}
                onChange={(e) => setProfile({ ...profile, backgroundStory: e.target.value })}
                className="input-field h-24 resize-none"
                placeholder="Education, work, skills…"
              />
            ) : (
              <p className="p-3 bg-cream-100 rounded-lg text-charcoal min-h-[80px]">
                {profile.backgroundStory || profile.cvFileName
                  ? profile.backgroundStory || `CV on file: ${profile.cvFileName}`
                  : "Not set yet"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-light mb-2">What you&apos;re looking forward to</label>
            {isEditing ? (
              <textarea
                value={profile.lookingForward}
                onChange={(e) => setProfile({ ...profile, lookingForward: e.target.value })}
                className="input-field h-20 resize-none"
              />
            ) : (
              <p className="p-3 bg-cream-100 rounded-lg text-charcoal min-h-[60px]">
                {profile.lookingForward || "Not set yet"}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-teal border-b border-cream-300 pb-2 flex items-center gap-2">
              <span>👤</span> Personal Information
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-charcoal-light mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="input-field"
                  disabled={authStatus === "authenticated"} // NextAuth handles name
                />
              ) : (
                <p className="p-3 bg-cream-100 rounded-lg text-charcoal">{profile.name || "Not provided"}</p>
              )}
              {isEditing && authStatus === "authenticated" && (
                <p className="text-xs text-charcoal-light mt-1 italic">Name is managed by your account</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-light mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="input-field"
                  disabled={authStatus === "authenticated"} // NextAuth handles email
                />
              ) : (
                <p className="p-3 bg-cream-100 rounded-lg text-charcoal">{profile.email || "Not provided"}</p>
              )}
              {isEditing && authStatus === "authenticated" && (
                <p className="text-xs text-charcoal-light mt-1 italic">Email is managed by your account</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-light mb-2">Nationality</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.nationalityCode}
                  onChange={(e) => setProfile({ ...profile, nationalityCode: e.target.value.toUpperCase() })}
                  className="input-field"
                  placeholder="e.g., PH, IN, US"
                />
              ) : (
                <p className="p-3 bg-cream-100 rounded-lg text-charcoal">{profile.nationalityCode || "Not provided"}</p>
              )}
            </div>
          </div>

          {/* Academic & Budget Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-teal border-b border-cream-300 pb-2 flex items-center gap-2">
              <span>🎯</span> Matching details
              <span className="text-xs font-normal text-charcoal-light ml-1">(optional — add anytime)</span>
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-charcoal-light mb-2">Target Countries</label>
              {isEditing ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(COUNTRY_FLAGS).map(([code, flag]) => (
                    <button
                      key={code}
                      type="button"
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        profile.targetCountries.includes(code)
                          ? 'border-teal bg-primary-50 text-teal'
                          : 'border-cream-400 hover:border-primary-300 text-charcoal bg-white'
                      }`}
                      onClick={() => {
                        const has = profile.targetCountries.includes(code);
                        const newCountries = has
                          ? profile.targetCountries.filter((c) => c !== code)
                          : profile.targetCountries.length < 3
                            ? [...profile.targetCountries, code]
                            : profile.targetCountries;
                        setProfile({ ...profile, targetCountries: newCountries });
                      }}
                    >
                      {flag} {code}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="p-3 bg-cream-100 rounded-lg text-charcoal">
                  {profile.targetCountries.length > 0 
                    ? profile.targetCountries.map(c => `${COUNTRY_FLAGS[c] || ''} ${c}`).join(", ") 
                    : "No countries selected"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-light mb-2">CEFR Language Level</label>
              {isEditing ? (
                <select
                  value={profile.cefrLevel}
                  onChange={(e) => setProfile({ ...profile, cefrLevel: e.target.value })}
                  className="input-field"
                >
                  {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              ) : (
                <p className="p-3 bg-cream-100 rounded-lg text-charcoal">{profile.cefrLevel || "Not set"}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-light mb-2">Degree Level</label>
              {isEditing ? (
                <select
                  value={profile.degreeLevels[0] || ""}
                  onChange={(e) => setProfile({ ...profile, degreeLevels: [e.target.value] })}
                  className="input-field"
                >
                  <option value="">Select degree level</option>
                  {Object.entries(degreeLevelLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              ) : (
                <p className="p-3 bg-cream-100 rounded-lg text-charcoal">
                  {profile.degreeLevels.length > 0 ? degreeLevelLabels[profile.degreeLevels[0]] : "Not selected"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-light mb-2">Rent Budget (€/month)</label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={profile.rentBudgetMin}
                    onChange={(e) => setProfile({ ...profile, rentBudgetMin: Number(e.target.value) })}
                    className="input-field w-1/2"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={profile.rentBudgetMax}
                    onChange={(e) => setProfile({ ...profile, rentBudgetMax: Number(e.target.value) })}
                    className="input-field w-1/2"
                    placeholder="Max"
                  />
                </div>
              ) : (
                <p className="p-3 bg-cream-100 rounded-lg text-charcoal">
                  €{profile.rentBudgetMin} - €{profile.rentBudgetMax}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-light mb-2">University Budget (€/year)</label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={profile.universityBudgetMin}
                    onChange={(e) => setProfile({ ...profile, universityBudgetMin: Number(e.target.value) })}
                    className="input-field w-1/2"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={profile.universityBudgetMax}
                    onChange={(e) => setProfile({ ...profile, universityBudgetMax: Number(e.target.value) })}
                    className="input-field w-1/2"
                    placeholder="Max"
                  />
                </div>
              ) : (
                <p className="p-3 bg-cream-100 rounded-lg text-charcoal">
                  €{profile.universityBudgetMin} - €{profile.universityBudgetMax}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-light mb-2">Desired Start Date</label>
              {isEditing ? (
                <input
                  type="date"
                  value={profile.desiredStart}
                  onChange={(e) => setProfile({ ...profile, desiredStart: e.target.value })}
                  className="input-field"
                />
              ) : (
                <p className="p-3 bg-cream-100 rounded-lg text-charcoal">
                  {profile.desiredStart ? new Date(profile.desiredStart).toLocaleDateString() : "Not set"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CV Upload Section */}
        <div className="mt-8 pt-8 border-t border-cream-300">
          <h2 className="text-lg font-semibold text-teal mb-4 flex items-center gap-2">
            <span>📄</span> CV & Documents
          </h2>
          <div className="space-y-4">
            {profile.cvFileName ? (
              <div className="flex items-center justify-between p-4 bg-primary-50 border border-primary-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-teal text-lg">✓</span>
                  </div>
                  <span className="text-teal font-medium">{profile.cvFileName}</span>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-cream-400 rounded-xl p-8 text-center hover:border-primary-300 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvUpload}
                  className="hidden"
                  id="cv-upload"
                />
                <label
                  htmlFor="cv-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="w-14 h-14 bg-cream-200 rounded-full flex items-center justify-center">
                    <span className="text-3xl">📁</span>
                  </div>
                  <span className="text-charcoal font-medium">Upload your CV</span>
                  <span className="text-charcoal-light text-sm">PDF, DOC, or DOCX files</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-cream-300">
            <button
              onClick={() => setIsEditing(false)}
              className="btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-accent flex items-center gap-2"
              disabled={loading}
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              💾 Save Changes
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-cream-300">
          <button
            onClick={() => router.push("/intake")}
            className="btn-outline"
          >
            ← Update intake chat
          </button>
          <button
            onClick={() => router.push("/chat")}
            className="btn-primary"
          >
            Open LARA Guide →
          </button>
        </div>
      </div>
    </div>
  );
}

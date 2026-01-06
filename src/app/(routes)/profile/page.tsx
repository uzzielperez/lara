"use client";
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
  desiredStart: string;
  cvUrl?: string;
  summary?: string;
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
    desiredStart: "",
    cvUrl: "",
    summary: ""
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
              targetCountries: p.targetCountries || prev.targetCountries,
              degreeLevels: p.degreeLevels || prev.degreeLevels,
              desiredStart: p.desiredStart ? p.desiredStart.split('T')[0] : prev.desiredStart,
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
            targetCountries: profile.targetCountries,
            degreeLevels: profile.degreeLevels,
            desiredStart: profile.desiredStart,
          }),
        });
        if (!res.ok) throw new Error("Failed to save profile");
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCvFile(file);
      // TODO: Upload file to server and get URL
      setProfile({ ...profile, cvUrl: URL.createObjectURL(file) });
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="section-heading">Your Profile</h1>
            <p className="text-charcoal-light">Manage your study abroad preferences</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={isEditing ? "btn-outline" : "btn-accent"}
            disabled={loading}
          >
            {isEditing ? "Cancel" : "✏️ Edit Profile"}
          </button>
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

            <div>
              <label className="block text-sm font-medium text-charcoal-light mb-2">Personal Summary</label>
              {isEditing ? (
                <textarea
                  value={profile.summary || ""}
                  onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                  className="input-field h-24 resize-none"
                  placeholder="Tell us about yourself, your goals, and what you're looking for..."
                />
              ) : (
                <p className="p-3 bg-cream-100 rounded-lg text-charcoal min-h-[100px]">{profile.summary || "No summary provided"}</p>
              )}
            </div>
          </div>

          {/* Academic & Budget Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-teal border-b border-cream-300 pb-2 flex items-center gap-2">
              <span>🎯</span> Academic & Budget
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
                        const newCountries = profile.targetCountries.includes(code)
                          ? profile.targetCountries.filter(c => c !== code)
                          : [...profile.targetCountries, code];
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
            {profile.cvUrl ? (
              <div className="flex items-center justify-between p-4 bg-primary-50 border border-primary-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-teal text-lg">✓</span>
                  </div>
                  <span className="text-teal font-medium">CV uploaded successfully</span>
                </div>
                <a
                  href={profile.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal hover:text-primary-600 underline font-medium"
                >
                  View CV
                </a>
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
            ← Back to Intake
          </button>
          <button
            onClick={() => router.push("/swipe")}
            className="btn-primary"
          >
            Start Exploring Programs →
          </button>
        </div>
      </div>
    </div>
  );
}

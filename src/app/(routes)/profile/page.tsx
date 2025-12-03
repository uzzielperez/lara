"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    // Load profile data from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    console.log('Loading profile from localStorage:', savedProfile);
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        console.log('Parsed profile:', parsedProfile);
        setProfile(parsedProfile);
      } catch (error) {
        console.error('Error parsing saved profile:', error);
      }
    } else {
      console.log('No saved profile found');
    }
  }, []);

  const handleSave = () => {
    // Save to localStorage and update in database
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setIsEditing(false);
    // TODO: Save to database via API
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
                />
              ) : (
                <p className="p-3 bg-cream-100 rounded-lg text-charcoal">{profile.name || "Not provided"}</p>
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
                />
              ) : (
                <p className="p-3 bg-cream-100 rounded-lg text-charcoal">{profile.email || "Not provided"}</p>
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
                  value={profile.summary}
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
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-accent"
            >
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

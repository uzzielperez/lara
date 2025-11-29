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
    "BACHELORS": "Bachelor's Degree",
    "MASTERS": "Master's Degree", 
    "PHD": "PhD",
    "DIPLOMA": "Diploma"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Personal Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{profile.name || "Not provided"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{profile.email || "Not provided"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.nationalityCode}
                    onChange={(e) => setProfile({ ...profile, nationalityCode: e.target.value.toUpperCase() })}
                    className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., IN, US, UK"
                  />
                ) : (
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{profile.nationalityCode || "Not provided"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Summary</label>
                {isEditing ? (
                  <textarea
                    value={profile.summary}
                    onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:outline-none h-24"
                    placeholder="Tell us about yourself, your goals, and what you're looking for..."
                  />
                ) : (
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg min-h-[100px]">{profile.summary || "No summary provided"}</p>
                )}
              </div>
            </div>

            {/* Academic & Budget Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Academic & Budget</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Countries</label>
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2">
                    {["DE", "NL", "FR", "IT", "ES", "SE"].map(country => (
                      <button
                        key={country}
                        className={`p-2 rounded-lg border-2 transition-colors ${
                          profile.targetCountries.includes(country)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-900'
                        }`}
                        onClick={() => {
                          const newCountries = profile.targetCountries.includes(country)
                            ? profile.targetCountries.filter(c => c !== country)
                            : [...profile.targetCountries, country];
                          setProfile({ ...profile, targetCountries: newCountries });
                        }}
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {profile.targetCountries.length > 0 ? profile.targetCountries.join(", ") : "No countries selected"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Degree Level</label>
                {isEditing ? (
                  <select
                    value={profile.degreeLevels[0] || ""}
                    onChange={(e) => setProfile({ ...profile, degreeLevels: [e.target.value] })}
                    className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select degree level</option>
                    {Object.entries(degreeLevelLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {profile.degreeLevels.length > 0 ? degreeLevelLabels[profile.degreeLevels[0]] : "Not selected"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rent Budget (€/month)</label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={profile.rentBudgetMin}
                      onChange={(e) => setProfile({ ...profile, rentBudgetMin: Number(e.target.value) })}
                      className="w-1/2 border-2 border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={profile.rentBudgetMax}
                      onChange={(e) => setProfile({ ...profile, rentBudgetMax: Number(e.target.value) })}
                      className="w-1/2 border-2 border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                      placeholder="Max"
                    />
                  </div>
                ) : (
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                    €{profile.rentBudgetMin} - €{profile.rentBudgetMax}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">University Budget (€/year)</label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={profile.universityBudgetMin}
                      onChange={(e) => setProfile({ ...profile, universityBudgetMin: Number(e.target.value) })}
                      className="w-1/2 border-2 border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={profile.universityBudgetMax}
                      onChange={(e) => setProfile({ ...profile, universityBudgetMax: Number(e.target.value) })}
                      className="w-1/2 border-2 border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                      placeholder="Max"
                    />
                  </div>
                ) : (
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                    €{profile.universityBudgetMin} - €{profile.universityBudgetMax}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Desired Start Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={profile.desiredStart}
                    onChange={(e) => setProfile({ ...profile, desiredStart: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {profile.desiredStart ? new Date(profile.desiredStart).toLocaleDateString() : "Not set"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* CV Upload Section */}
          <div className="mt-8 pt-8 border-t">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">CV & Documents</h2>
            <div className="space-y-4">
              {profile.cvUrl ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span className="text-green-800 font-medium">CV uploaded successfully</span>
                  </div>
                  <a
                    href={profile.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View CV
                  </a>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvUpload}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label
                    htmlFor="cv-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-xl">📄</span>
                    </div>
                    <span className="text-gray-600 font-medium">Upload your CV</span>
                    <span className="text-gray-500 text-sm">PDF, DOC, or DOCX files</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => router.push("/intake")}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Intake
            </button>
            <button
              onClick={() => router.push("/swipe")}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Start Exploring Programs →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

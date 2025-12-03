"use client";
import { useMemo, useState } from "react";

type ApiResponse = {
  markdown: string;
  docxBase64?: string;
  title?: string;
  warnings?: string[];
};

export default function CvPage() {
  const [activeTab, setActiveTab] = useState<"upload" | "result">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [job, setJob] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadHref = useMemo(() => {
    if (!result?.docxBase64) return null;
    return `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${result.docxBase64}`;
  }, [result]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF to upload.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      if (job.trim()) form.append("jobDescription", job.trim());
      const res = await fetch("/api/cv", { method: "POST", body: form });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data: ApiResponse = await res.json();
      setResult(data);
      setActiveTab("result");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process CV";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="section-heading">CV Assistant</h1>
        <p className="section-subheading">Upload your CV and get AI-powered improvements</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-cream-200 rounded-xl p-1 w-max mx-auto">
        <button
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === "upload" 
              ? "bg-teal text-white shadow-sm" 
              : "text-charcoal hover:text-teal"
          }`}
          onClick={() => setActiveTab("upload")}
        >
          📤 Upload & Prompt
        </button>
        <button
          className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            activeTab === "result" 
              ? "bg-teal text-white shadow-sm" 
              : "text-charcoal hover:text-teal disabled:opacity-50"
          }`}
          onClick={() => setActiveTab("result")}
          disabled={!result}
        >
          ✨ Result
        </button>
      </div>

      {activeTab === "upload" && (
        <form onSubmit={onSubmit} className="card space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-teal mb-2">Upload your CV (PDF)</label>
            <div className="relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="cv-upload"
              />
              <label
                htmlFor="cv-upload"
                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                  file 
                    ? "border-teal bg-primary-50" 
                    : "border-cream-400 hover:border-primary-300 bg-cream-100"
                }`}
              >
                {file ? (
                  <>
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl">📄</span>
                    </div>
                    <span className="text-teal font-medium">{file.name}</span>
                    <span className="text-sm text-charcoal-light mt-1">Click to change file</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-cream-300 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl">📁</span>
                    </div>
                    <span className="text-charcoal font-medium">Click to upload your CV</span>
                    <span className="text-sm text-charcoal-light mt-1">PDF files only</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-semibold text-teal mb-2">
              Optional: Job description or target role
            </label>
            <textarea
              value={job}
              onChange={(e) => setJob(e.target.value)}
              rows={5}
              placeholder="Paste the job description or describe your target role to tailor the CV improvements..."
              className="input-field resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-accent w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-charcoal-dark/30 border-t-charcoal-dark rounded-full animate-spin"></span>
                Processing...
              </>
            ) : (
              <>✨ Generate Improved CV</>
            )}
          </button>
        </form>
      )}

      {activeTab === "result" && (
        <div className="space-y-6">
          {!result && (
            <div className="card text-center py-12">
              <div className="w-16 h-16 bg-cream-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📄</span>
              </div>
              <p className="text-charcoal-light">No result yet. Upload a PDF first.</p>
            </div>
          )}
          {result && (
            <>
              {/* Action Buttons */}
              <div className="flex items-center gap-3 justify-center">
                <a
                  href={downloadHref || undefined}
                  download={(result.title || "Improved-CV") + ".docx"}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    downloadHref 
                      ? "btn-accent" 
                      : "bg-cream-300 text-charcoal-light/50 cursor-not-allowed"
                  }`}
                  aria-disabled={!downloadHref}
                >
                  📥 Download .docx
                </a>
                <button
                  className="btn-outline flex items-center gap-2"
                  onClick={() => navigator.clipboard.writeText(result.markdown)}
                >
                  📋 Copy Markdown
                </button>
              </div>

              {/* Warnings */}
              {!!result.warnings?.length && (
                <div className="p-4 bg-gold-50 border border-gold-200 rounded-xl">
                  <div className="font-medium text-gold-700 mb-2 flex items-center gap-2">
                    <span>⚠️</span> Notes
                  </div>
                  <ul className="text-sm text-gold-700 list-disc pl-6 space-y-1">
                    {result.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-teal">📝</span>
                  <span className="text-sm font-semibold text-teal">Preview (Markdown)</span>
                </div>
                <textarea
                  className="input-field h-96 font-mono text-sm resize-none"
                  value={result.markdown}
                  readOnly
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

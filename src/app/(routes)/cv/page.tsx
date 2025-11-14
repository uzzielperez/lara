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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">CV Assistant</h1>

      <div className="flex border rounded overflow-hidden w-max">
        <button
          className={`px-4 py-2 text-sm ${activeTab === "upload" ? "bg-black text-white" : "bg-white text-gray-900"}`}
          onClick={() => setActiveTab("upload")}
        >
          Upload & Prompt
        </button>
        <button
          className={`px-4 py-2 text-sm ${activeTab === "result" ? "bg-black text-white" : "bg-white text-gray-900"}`}
          onClick={() => setActiveTab("result")}
          disabled={!result}
        >
          Result
        </button>
      </div>

      {activeTab === "upload" && (
        <form onSubmit={onSubmit} className="space-y-4 bg-white border rounded p-4 text-gray-900">
          <div>
            <label className="block text-sm font-medium mb-1">Upload your CV (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Optional: Job description or target role</label>
            <textarea
              value={job}
              onChange={(e) => setJob(e.target.value)}
              rows={5}
              placeholder="Paste the job description or your target role to tailor the CV."
              className="w-full border rounded p-2"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Processing..." : "Generate Improved CV"}
          </button>
        </form>
      )}

      {activeTab === "result" && (
        <div className="space-y-4">
          {!result && <div className="text-gray-600">No result yet. Upload a PDF first.</div>}
          {result && (
            <>
              <div className="flex items-center gap-3">
                <a
                  href={downloadHref || undefined}
                  download={(result.title || "Improved-CV") + ".docx"}
                  className={`px-3 py-2 text-sm rounded ${downloadHref ? "bg-black text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
                  aria-disabled={!downloadHref}
                >
                  Download .docx
                </a>
                <button
                  className="px-3 py-2 text-sm bg-white border rounded text-gray-900"
                  onClick={() => navigator.clipboard.writeText(result.markdown)}
                >
                  Copy Markdown
                </button>
              </div>
              {!!result.warnings?.length && (
                <ul className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 list-disc pl-6">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white border rounded p-3 text-gray-900">
                  <div className="text-sm font-medium mb-2">Preview (Markdown)</div>
                  <textarea
                    className="w-full h-96 border rounded p-2"
                    value={result.markdown}
                    readOnly
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";

type Props = {
  cvFileName?: string | null;
  onUploaded: (data: { cvFileName: string; excerpt?: string; warning?: string }) => void;
  compact?: boolean;
};

export default function CvUploadZone({ cvFileName, onUploaded, compact }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setWarning(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/profile/cv", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      if (data.warning) setWarning(data.warning);
      onUploaded({ cvFileName: data.cvFileName, excerpt: data.excerpt, warning: data.warning });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload CV");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {cvFileName ? (
        <div
          className="flex items-center justify-between gap-3 p-3 rounded-xl"
          style={{ background: "rgba(47,143,110,0.08)", border: "1px solid rgba(47,143,110,0.2)" }}
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--success)" }}>
              CV on file
            </p>
            <p className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>
              {cvFileName}
            </p>
          </div>
          <button
            type="button"
            className="btn-outline !py-1.5 !px-3 text-xs shrink-0"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Replace"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center gap-2 p-5 rounded-xl transition-colors hover:opacity-90"
          style={{ border: "2px dashed var(--hairline-strong)", background: "var(--surface)" }}
        >
          <span className="text-2xl">📄</span>
          <span className="font-medium text-sm" style={{ color: "var(--ink)" }}>
            {uploading ? "Reading your CV…" : "Upload CV (PDF)"}
          </span>
          <span className="text-xs text-center px-4" style={{ color: "var(--ink-faint)" }}>
            Scanned PDFs are OK — we&apos;ll save the file even if text extraction is limited
          </span>
        </button>
      )}

      {warning && (
        <p className="text-xs rounded-lg px-3 py-2" style={{ color: "var(--ink-soft)", background: "rgba(199,93,58,0.08)" }}>
          {warning}
        </p>
      )}

      {error && (
        <p className="text-xs" style={{ color: "var(--error)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

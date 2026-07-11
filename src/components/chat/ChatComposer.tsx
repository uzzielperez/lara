"use client";

type Props = {
  value: string;
  setValue: (v: string) => void;
  onSend: () => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  sendLabel?: string;
};

export default function ChatComposer({
  value,
  setValue,
  onSend,
  loading = false,
  disabled = false,
  placeholder = "Ask about costs, scholarships, visas, timelines…",
  autoFocus,
  sendLabel = "Ask",
}: Props) {
  return (
    <div
      className="flex items-end gap-2 p-2 rounded-2xl"
      style={{ background: "var(--surface)", border: "1px solid var(--hairline-strong)" }}
    >
      <textarea
        rows={1}
        autoFocus={autoFocus}
        disabled={disabled || loading}
        className="flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none disabled:opacity-50"
        style={{ color: "var(--ink)" }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <button
        type="button"
        onClick={onSend}
        disabled={loading || disabled || !value.trim()}
        className="btn-primary !px-4 !py-2.5 text-sm disabled:opacity-40 shrink-0"
        aria-label="Send"
      >
        {loading ? "…" : sendLabel}
      </button>
    </div>
  );
}

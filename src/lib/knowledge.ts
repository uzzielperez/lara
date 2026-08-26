/** Partner knowledge base retrieval + optional web fallback for guided prompts. */

import fs from "node:fs";
import path from "node:path";

export type KnowledgeHit = {
  source: "partner";
  text: string;
  score: number;
};

function readCsvSafe(file: string): string[] {
  try {
    const p = path.join(process.cwd(), file);
    if (!fs.existsSync(p)) return [];
    return fs.readFileSync(p, "utf8").split(/\r?\n/).slice(0, 5000);
  } catch {
    return [];
  }
}

function tokenScore(line: string, query: string): number {
  let s = 0;
  const tokens = query.toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean);
  const haystack = line.toLowerCase();
  for (const t of tokens) {
    if (t.length < 2) continue;
    if (haystack.includes(t)) s += 1;
  }
  return s;
}

/**
 * Retrieve the most relevant partner rows for a query.
 * Pulls from schools + programs CSVs (the partner knowledge base).
 */
export function retrievePartnerData(query: string, limit = 10): KnowledgeHit[] {
  const corpus = [
    ...readCsvSafe("sample-programs.csv"),
    ...readCsvSafe("sample-schools.csv"),
    ...readCsvSafe("schools.csv"),
  ].filter(Boolean);

  return corpus
    .map((line) => ({ source: "partner" as const, text: line, score: tokenScore(line, query) }))
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Optional web fallback. Uses Tavily if TAVILY_API_KEY is set; otherwise returns
 * an empty string so the model falls back to its own general knowledge (clearly
 * labelled as non-partner guidance in the system prompt).
 */
export async function webFallback(query: string): Promise<string> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return "";
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        query,
        max_results: 5,
        search_depth: "basic",
      }),
    });
    if (!res.ok) return "";
    const data = (await res.json()) as {
      results?: { title?: string; url?: string; content?: string }[];
    };
    return (data.results ?? [])
      .map((r) => `- ${r.title ?? "Result"} (${r.url ?? ""}): ${(r.content ?? "").slice(0, 240)}`)
      .join("\n");
  } catch {
    return "";
  }
}

export async function buildContext(query: string): Promise<{
  partner: string;
  web: string;
  hasPartner: boolean;
}> {
  const hits = retrievePartnerData(query, 10);
  const partner = hits.map((h) => h.text).join("\n");
  const hasPartner = hits.length >= 2;
  const web = hasPartner ? "" : await webFallback(query);
  return { partner, web, hasPartner };
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

function isHeaderRow(fields: string[]): boolean {
  const head = fields[0]?.toLowerCase() ?? "";
  return head === "schoolname" || head === "name" || head.startsWith("school repository");
}

function formatPartnerBullet(line: string): string | null {
  const fields = splitCsvLine(line);
  if (fields.length < 3 || isHeaderRow(fields)) return null;

  const looksLikeProgram =
    fields.length >= 8 &&
    /bachelor|master|phd|doctor|bachelors|masters/i.test(fields[2] ?? "");
  const looksLikeSchool =
    /^[A-Z]{2}$/.test(fields[1] ?? "") &&
    (fields.length <= 8 || /^https?:\/\//i.test(fields[3] ?? ""));

  if (looksLikeProgram) {
    const [school, title, level, , tuition, currency, deadline, language, city, country] =
      fields;
    const bits = [
      city && country ? `${city}, ${country}` : city || country,
      language,
      tuition && tuition !== "0"
        ? `${tuition} ${currency || ""}/yr`.trim()
        : tuition === "0"
          ? "tuition listed as 0 (verify)"
          : null,
      deadline ? `deadline ${deadline}` : null,
    ].filter(Boolean);
    return `${school} — ${title} (${level})${bits.length ? ` · ${bits.join(" · ")}` : ""}`;
  }

  if (looksLikeSchool) {
    const [name, country, city, website, description] = fields;
    const where = [city, country].filter(Boolean).join(", ");
    const site = website && /^https?:\/\//i.test(website) ? website : null;
    const desc = (description ?? "").slice(0, 160);
    return `${name}${where ? ` · ${where}` : ""}${desc ? ` — ${desc}` : ""}${
      site ? ` (${site})` : ""
    }`;
  }

  const compact = line.replace(/^,+/, "").replace(/,+/g, ", ").trim();
  if (compact.length < 12) return null;
  return compact.slice(0, 220);
}

/** Human-readable partner hits for when the LLM is unavailable. */
export function summarizePartnerHits(partnerBlock: string, limit = 6): string[] {
  return partnerBlock
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(formatPartnerBullet)
    .filter((b): b is string => Boolean(b))
    .slice(0, limit);
}

/**
 * Extractive backup reply from the partner CSV (and optional web snippets).
 * Used when Groq is down, the model ID is retired, or the LLM returns nothing.
 */
export function fallbackChatReply(opts: {
  query: string;
  partner: string;
  web: string;
}): string {
  const bullets = summarizePartnerHits(opts.partner);
  const webLines = opts.web
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 4);

  const parts: string[] = [];

  if (bullets.length) {
    const q = opts.query.trim().slice(0, 80);
    parts.push(
      q
        ? `Here is what I found in LARA's partner knowledge base for "${q}":`
        : "Here is what I found in LARA's partner knowledge base for your question:"
    );
    parts.push(bullets.map((b) => `- ${b}`).join("\n"));
  }

  if (webLines.length && bullets.length < 2) {
    parts.push("Additional public results (please verify on official sites):");
    parts.push(webLines.join("\n"));
  }

  if (!parts.length) {
    parts.push(
      "I don't have a specific partner-program match for that yet. Study-abroad costs, visas, and deadlines vary a lot by country and degree — I don't want to invent exact numbers."
    );
  }

  parts.push(
    "For a personalized plan, create a free profile or browse matched programs at /programs."
  );
  parts.push("Answer sourced from LARA's knowledge base.");
  return parts.join("\n\n");
}

export function fallbackGuidedFromKnowledge(partner: string): {
  direction: string;
  suggestions: string[];
  nextStep: { label: string; href: string };
} {
  const bullets = summarizePartnerHits(partner, 3);
  const suggestions =
    bullets.length >= 2
      ? bullets.slice(0, 3)
      : [
          "Browse partner programs that fit your countries and budget",
          "Complete any missing profile details so matches get sharper",
          "Check language, deadline, and tuition on the school site before applying",
        ].slice(0, bullets.length === 1 ? 2 : 3);

  if (bullets.length === 1) {
    suggestions.unshift(bullets[0]);
  }

  return {
    direction: bullets.length
      ? "Based on LARA's partner knowledge base, these programs and schools are the closest matches for your question."
      : "I could not reach the AI model, and the partner database has no close match yet. Browse programs and refine your profile so I can be more specific.",
    suggestions: suggestions.slice(0, 3),
    nextStep: { label: "Explore matched programs", href: "/programs" },
  };
}

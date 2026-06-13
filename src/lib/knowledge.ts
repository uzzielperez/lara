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

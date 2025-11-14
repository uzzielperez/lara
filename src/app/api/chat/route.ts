import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

function readCsvSafe(file: string): string[] {
	try {
		const p = path.join(process.cwd(), file);
		if (!fs.existsSync(p)) return [];
		return fs.readFileSync(p, "utf8").split(/\r?\n/).slice(0, 5000);
	} catch {
		return [];
	}
}

function retrieve(mode: string, query: string): string {
	const corpus: string[] = [];
	if (mode === "schools" || mode === "profile") {
		corpus.push(...readCsvSafe("schools.csv"));
		corpus.push(...readCsvSafe("sample-schools.csv"));
		corpus.push(...readCsvSafe("sample-programs.csv"));
	}
	if (mode === "housing") {
		corpus.push(...readCsvSafe("sample-programs.csv"));
	}
	const q = query.toLowerCase();
	const scored = corpus
		.filter(Boolean)
		.map((line) => ({ line, score: similarity(line.toLowerCase(), q) }))
		.sort((a, b) => b.score - a.score)
		.slice(0, 12)
		.map((x) => x.line);
	return scored.join("\n");
}

function similarity(a: string, b: string): number {
	let s = 0;
	for (const t of b.split(/[^a-z0-9]+/g)) if (t && a.includes(t)) s += 1;
	return s;
}

export async function POST(req: NextRequest) {
	try {
		const { messages, mode, rag } = (await req.json()) as {
			messages: ChatMessage[];
			mode: string;
			rag?: boolean;
		};
		const last = messages?.[messages.length - 1]?.content || "";
		const context = rag ? retrieve(mode, last) : "";

		const Groq = (await import("groq-sdk")).default;
		const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
		if (!client.apiKey) return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });

		const system =
			mode === "schools"
				? "You are a counselor helping students find study programs by country, city, tuition, and deadlines. Answer with short lists and next steps."
			: mode === "cv"
				? "You edit resumes. Return clear bullet points and Markdown sections."
			: mode === "housing"
				? "You help find student housing near schools with rent ranges and links."
			: "You help improve a student profile for better matching.";

		const prefix = context ? `Here are some possibly relevant CSV rows (may be noisy):\n${context}\n\n` : "";

		const response = await client.chat.completions.create({
			model: "llama-3.1-8b-instant",
			messages: [
				{ role: "system", content: system },
				{ role: "user", content: prefix + last },
			],
			max_tokens: 800,
		});
		const reply = response.choices[0]?.message?.content || "(no reply)";
		return NextResponse.json({ reply });
	} catch (err: unknown) {
		const errorMessage = err instanceof Error ? err.message : "Failed";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}

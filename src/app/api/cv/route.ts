import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function parsePdf(buffer: Buffer): Promise<string> {
	try {
		const pdfParseModule = await import("pdf-parse");
		// Handle both default and named exports
		const pdfParse = (pdfParseModule as any).default || pdfParseModule;
		const result = await pdfParse(buffer);
		return String(result.text || "");
	} catch (error) {
		console.error("PDF parse error:", error);
		// If pdf-parse fails, try using require as fallback
		const pdfParse = require("pdf-parse");
		const result = await pdfParse(buffer);
		return String(result.text || "");
	}
}

async function mdToDocxBase64(markdown: string): Promise<string> {
	// Minimal conversion: create one paragraph per line; headings get bold
	const { Document, Packer, Paragraph, TextRun } = require("docx");
	const lines: string[] = markdown.split(/\r?\n/);
	const paragraphs = lines.map((line: string) => {
		if (line.startsWith("# ")) {
			return new Paragraph({ children: [new TextRun({ text: line.replace(/^#\s+/, ""), bold: true, size: 28 })] });
		}
		if (line.startsWith("## ")) {
			return new Paragraph({ children: [new TextRun({ text: line.replace(/^##\s+/, ""), bold: true, size: 26 })] });
		}
		return new Paragraph({ children: [new TextRun({ text: line })] });
	});
	const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
	return await Packer.toBase64String(doc);
}

export async function POST(req: NextRequest) {
	try {
		const form = await req.formData();
		const file = form.get("file");
		const jobDescription = (form.get("jobDescription") || "") as string;
		if (!file || !(file instanceof File)) {
			return NextResponse.json({ error: "Missing PDF file" }, { status: 400 });
		}
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		
		console.log("Parsing PDF...");
		const pdfText = await parsePdf(buffer);
		console.log("PDF parsed, length:", pdfText.length);

		const Groq = (await import("groq-sdk")).default;
		const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
		if (!client.apiKey) {
			console.error("GROQ_API_KEY not set");
			return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });
		}

		const system = `You are a CV rewriting assistant. Transform the provided resume text into a concise, professionally formatted resume using clean Markdown headings, bullet points, and strong action verbs. Improve clarity, quantify achievements, and ensure consistent tense. Keep contact info at top.`;
		const user = `Resume text:\n\n${pdfText.slice(0, 120000)}\n\nTarget role or job description (optional):\n${jobDescription}`;

		console.log("Calling Groq API...");
		const response = await client.chat.completions.create({
			messages: [
				{ role: "system", content: system },
				{ role: "user", content: user },
			],
			model: "llama-3.1-8b-instant",
			max_tokens: 3000,
		});
		console.log("Groq API response received");

		const text = response.choices[0]?.message?.content || "";
		console.log("Converting to DOCX...");
		const docxBase64 = await mdToDocxBase64(text);
		console.log("DOCX created successfully");
		return NextResponse.json({ markdown: text, docxBase64, title: "Improved-CV" });
	} catch (err: any) {
		console.error("CV API Error:", err);
		return NextResponse.json({ error: err?.message || "Failed to process" }, { status: 500 });
	}
}

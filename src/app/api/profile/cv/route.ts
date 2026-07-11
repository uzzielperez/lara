import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

async function parsePdf(buffer: Buffer): Promise<string> {
  const pdfParseModule = await import("pdf-parse");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfParse = (pdfParseModule as any).default || pdfParseModule;
  const result = await pdfParse(buffer);
  return String(result.text || "").trim();
}

/** Upload CV for conversational intake — stores extracted text on profile. */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing PDF file" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Please upload a PDF file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cvText = await parsePdf(buffer);

    if (cvText.length < 20) {
      return NextResponse.json(
        { error: "Could not read enough text from this PDF. Try describing your background instead." },
        { status: 400 }
      );
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        cvText: cvText.slice(0, 50000),
        cvFileName: file.name,
      },
      create: {
        userId: session.user.id,
        cvText: cvText.slice(0, 50000),
        cvFileName: file.name,
      },
    });

    return NextResponse.json({
      ok: true,
      cvFileName: profile.cvFileName,
      excerpt: cvText.slice(0, 200),
    });
  } catch (err: unknown) {
    console.error("Profile CV upload error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

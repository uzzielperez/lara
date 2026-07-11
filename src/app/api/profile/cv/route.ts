import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { extractPdfText, isPdfFile } from "@/lib/parse-pdf";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 10 * 1024 * 1024;

/** Upload CV for profile — stores extracted text on UserProfile. */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!isPdfFile(file)) {
      return NextResponse.json(
        { error: "Please upload a PDF file (.pdf)" },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let cvText = "";
    try {
      cvText = await extractPdfText(buffer);
    } catch (parseErr) {
      console.error("PDF parse error:", parseErr);
      return NextResponse.json(
        {
          error:
            "Could not read this PDF. Try a text-based PDF or describe your background instead.",
        },
        { status: 400 }
      );
    }

    if (cvText.length < 15) {
      return NextResponse.json(
        {
          error:
            "Not enough text found in this PDF. Try a different export or type your background below.",
        },
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

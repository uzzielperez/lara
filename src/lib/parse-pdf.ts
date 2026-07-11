/** Extract plain text from a PDF buffer (pdf-parse v2 API). */

export type PdfExtractResult = {
  text: string;
  partial: boolean;
  warning?: string;
};

export async function extractPdfText(buffer: Buffer): Promise<PdfExtractResult> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({
    data: new Uint8Array(buffer),
  });

  try {
    const result = await parser.getText();
    const text = String(result?.text ?? "").trim();
    if (text.length >= 15) {
      return { text, partial: false };
    }
    return {
      text,
      partial: true,
      warning:
        text.length > 0
          ? "Only a little text was found in this PDF. Add your background in the profile panel too."
          : "This PDF looks image-based or scanned. We saved the file — please describe your background in text.",
    };
  } catch (err) {
    console.error("PDF parse error:", err);
    return {
      text: "",
      partial: true,
      warning:
        "Could not read text from this PDF. We saved the file — describe your education and experience below.",
    };
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

export function isPdfFile(file: File): boolean {
  if (file.type === "application/pdf") return true;
  return file.name.toLowerCase().endsWith(".pdf");
}

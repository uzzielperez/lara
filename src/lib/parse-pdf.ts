/** Extract plain text from a PDF buffer (pdf-parse v2 API). */

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({
    data: new Uint8Array(buffer),
  });
  try {
    const result = await parser.getText();
    return String(result?.text ?? "").trim();
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

export function isPdfFile(file: File): boolean {
  if (file.type === "application/pdf") return true;
  return file.name.toLowerCase().endsWith(".pdf");
}

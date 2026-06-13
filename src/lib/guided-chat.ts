/** F-02 structured assistant response shape. */

export type GuidedChatResponse = {
  direction: string;
  suggestions: string[];
  nextStep: {
    label: string;
    href?: string;
  };
};

export function parseGuidedResponse(raw: string): GuidedChatResponse | null {
  try {
    const parsed = JSON.parse(raw) as Partial<GuidedChatResponse>;
    if (!parsed.direction || typeof parsed.direction !== "string") return null;
    if (!Array.isArray(parsed.suggestions)) return null;
    const suggestions = parsed.suggestions
      .filter((s): s is string => typeof s === "string")
      .slice(0, 3);
    if (suggestions.length < 2) return null;
    const label =
      typeof parsed.nextStep?.label === "string" ? parsed.nextStep.label : null;
    if (!label) return null;
    const href =
      typeof parsed.nextStep?.href === "string" ? parsed.nextStep.href : undefined;
    return {
      direction: parsed.direction.trim().slice(0, 500),
      suggestions: suggestions.map((s) => s.trim().slice(0, 200)),
      nextStep: { label: label.trim().slice(0, 120), href },
    };
  } catch {
    return null;
  }
}

export const GUIDED_RESPONSE_JSON_SCHEMA = `Respond with ONLY valid JSON (no markdown fences):
{
  "direction": "1-2 short sentences of personalized guidance",
  "suggestions": ["path option 1", "path option 2", "optional path option 3"],
  "nextStep": { "label": "Clear CTA text", "href": "/optional/path" }
}
Rules: max 80 words in direction; exactly 2-3 suggestions; one nextStep; no extra keys.`;

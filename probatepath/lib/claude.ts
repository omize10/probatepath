import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { WillExtraction } from "@prisma/client";

let cachedClaude: Anthropic | null = null;

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-20241022";

export type ExtractedWillObject = {
  testatorName: string | null;
  willDate: string | null;
  executors: { name: string; role?: string }[];
  beneficiaries: { name: string; relationship?: string }[];
  hasCodicils: boolean | null;
  handwrittenChanges: boolean | null;
  issues: string[];
  rawText?: string;
};

export function getClaudeClient(): Anthropic {
  if (cachedClaude) return cachedClaude;
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY must be configured.");
  }
  cachedClaude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return cachedClaude;
}

function cleanJson(text: string) {
  return text.replace(/```json\s*|\s*```/g, "").trim();
}

const emptyExtraction: ExtractedWillObject = {
  testatorName: null,
  willDate: null,
  executors: [],
  beneficiaries: [],
  hasCodicils: null,
  handwrittenChanges: null,
  issues: [],
};

export async function extractWillData(ocrText: string): Promise<ExtractedWillObject> {
  const claude = getClaudeClient();
  const res = await claude.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are extracting information from a BC will to prefill probate intake questions.

Return ONLY valid JSON (no markdown, no commentary) with this exact shape:
{
  "testatorName": "Full legal name of the person who made the will or null",
  "willDate": "ISO-style date string if present, otherwise null",
  "executors": [{"name": "Full name", "role": "primary|alternate|executor"}],
  "beneficiaries": [{"name": "Full name", "relationship": "spouse|child|other"}],
  "hasCodicils": true/false/null,
  "handwrittenChanges": true/false/null,
  "issues": ["List any potential problems like missing signatures, torn pages, unclear gifts"]
}

Rules:
- If you are unsure, use null instead of guessing.
- Keep names as they appear in the text.
- If no executors or beneficiaries are found, return empty arrays.
- Never include code fences or extra text.

Will text to analyze:
${ocrText}`,
      },
    ],
  });

  const text = res.content[0]?.type === "text" ? res.content[0].text : "";
  const cleaned = cleanJson(text);
  try {
    const parsed = JSON.parse(cleaned);
    return {
      ...emptyExtraction,
      ...parsed,
      testatorName: parsed.testatorName ?? null,
      willDate: parsed.willDate ?? null,
      executors: Array.isArray(parsed.executors) ? parsed.executors : [],
      beneficiaries: Array.isArray(parsed.beneficiaries) ? parsed.beneficiaries : [],
      hasCodicils: parsed.hasCodicils ?? null,
      handwrittenChanges: parsed.handwrittenChanges ?? null,
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
    };
  } catch {
    return emptyExtraction;
  }
}

export async function chatAboutWill(params: {
  message: string;
  extraction?: WillExtraction | null;
  currentStep: string;
}): Promise<string> {
  const { message, extraction, currentStep } = params;
  const claude = getClaudeClient();

  const structuredData = extraction
    ? {
        testatorName: extraction.testatorName ?? null,
        willDate: extraction.willDate ?? null,
        executors: extraction.executors ?? [],
        beneficiaries: extraction.beneficiaries ?? [],
        hasCodicils: extraction.hasCodicils ?? null,
        handwrittenChanges: extraction.handwrittenChanges ?? null,
        issues: extraction.issues ?? [],
      }
    : null;

  const response = await claude.messages.create({
    model: MODEL,
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `You are a concise BC probate intake helper. Keep answers short, plain-language, and specific to the user's step.

User step: ${currentStep || "general"}
${structuredData ? `Structured will data: ${JSON.stringify(structuredData, null, 2)}` : "No will uploaded yet."}
${extraction?.rawText ? `Full will text for reference:\n${extraction.rawText.slice(0, 12000)}` : ""}

Guidance:
- Base answers on BC probate rules.
- If will data exists, reference it carefully without claiming it is verified.
- Offer neutral, supportive tone and practical next steps.
- Encourage the user to double-check against the will.
- Keep it under 180 words.
- End with a short disclaimer line: "This is general information only, not legal advice."

User question: ${message}`,
      },
    ],
  });

  return response.content[0]?.type === "text" ? response.content[0].text : "";
}

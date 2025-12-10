import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error("Missing ANTHROPIC_API_KEY environment variable.");
}

const client = new Anthropic({ apiKey });

export interface ExtractedWillData {
  testatorName: string | null;
  willDate: string | null;
  executors: Array<{ name: string; role: string }>;
  beneficiaries: Array<{ name: string; relationship: string }>;
  hasCodicils: boolean | null;
  handwrittenChanges: boolean | null;
  issues: string[];
}

/**
 * Extract structured will data from OCR text using Claude
 */
export async function extractWillData(ocrText: string): Promise<ExtractedWillData> {
  const prompt = `You are analyzing the text of a will from British Columbia, Canada. Extract the following information from the will text below and return ONLY valid JSON with no additional text or explanation.

Extract:
- testatorName: The full name of the person who made the will (the testator)
- willDate: The date the will was signed (in ISO format YYYY-MM-DD if possible, or as written)
- executors: Array of objects with "name" and "role" (e.g., "executor", "alternate executor", "trustee")
- beneficiaries: Array of objects with "name" and "relationship" (e.g., "spouse", "child", "friend", "charity")
- hasCodicils: Boolean - does the text mention any codicils or amendments?
- handwrittenChanges: Boolean - does the text mention any handwritten changes or alterations?
- issues: Array of strings noting any potential problems (unclear text, contradictions, missing signatures, etc.)

Return ONLY this JSON structure, with no markdown formatting:
{
  "testatorName": "string or null",
  "willDate": "string or null",
  "executors": [{"name": "string", "role": "string"}],
  "beneficiaries": [{"name": "string", "relationship": "string"}],
  "hasCodicils": true/false/null,
  "handwrittenChanges": true/false/null,
  "issues": ["string"]
}

Will text:
${ocrText}

Return only the JSON object:`;

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    let jsonText = textContent.text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(jsonText) as ExtractedWillData;
    return parsed;
  } catch (error) {
    console.error("Claude API error (extraction):", error);
    throw new Error(`Failed to extract will data: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export interface ChatAboutWillParams {
  message: string;
  extraction?: {
    testatorName: string | null;
    willDate: string | null;
    executors: unknown;
    beneficiaries: unknown;
    hasCodicils: boolean | null;
    handwrittenChanges: boolean | null;
    issues: unknown;
    rawText: string;
  } | null;
  currentStep: string;
}

/**
 * Chat with Claude about probate and the user's will
 */
export async function chatAboutWill(params: ChatAboutWillParams): Promise<string> {
  const { message, extraction, currentStep } = params;

  let systemPrompt = `You are a helpful assistant for ProbatePath, a BC probate self-help platform. You help non-lawyers understand BC probate processes.

IMPORTANT RULES:
- You are NOT a lawyer and do not provide legal advice
- Use simple, clear language suitable for a grade 9 reading level
- Be encouraging and supportive
- Reference BC-specific probate rules when relevant
- ALWAYS end your response with this disclaimer: "This is general information only, not legal advice. Check it against your documents and talk to a BC lawyer if you are unsure."
- When discussing a will, never claim to "verify" if it's valid - only "read" or "extract information"
- Keep responses concise (2-3 paragraphs maximum)

Current step: ${currentStep}
`;

  if (extraction) {
    systemPrompt += `\n\nI have read the user's will. Here is what I extracted:
- Testator: ${extraction.testatorName ?? "Not found"}
- Will Date: ${extraction.willDate ?? "Not found"}
- Executors: ${JSON.stringify(extraction.executors)}
- Beneficiaries: ${JSON.stringify(extraction.beneficiaries)}
- Has codicils: ${extraction.hasCodicils ?? "Unknown"}
- Handwritten changes: ${extraction.handwrittenChanges ?? "Unknown"}
- Potential issues: ${JSON.stringify(extraction.issues)}

Full will text:
${extraction.rawText.substring(0, 4000)}

When answering questions, you can reference this information to give context-aware answers.`;
  } else {
    systemPrompt += `\n\nThe user has not uploaded their will yet. Provide general guidance about BC probate.`;
  }

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
      temperature: 0.7,
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    return textContent.text;
  } catch (error) {
    console.error("Claude API error (chat):", error);
    throw new Error(`Failed to chat with AI: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

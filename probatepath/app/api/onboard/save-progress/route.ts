import { NextResponse } from "next/server";
import { z } from "zod";

const SaveProgressSchema = z.object({
  step: z.string(),
  data: z.record(z.unknown()),
});

/**
 * Save onboarding progress
 * Note: Primary state is stored client-side in localStorage
 * This endpoint can be used for server-side backup/analytics
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SaveProgressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { step, data } = parsed.data;

  // Log for analytics
  console.log("[onboard/save-progress]", { step, dataKeys: Object.keys(data) });

  // In future: could save to database for abandoned cart recovery
  // For now, just acknowledge - state is primarily in localStorage

  return NextResponse.json({
    success: true,
    step,
  });
}

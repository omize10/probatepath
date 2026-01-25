import { NextResponse } from "next/server";
import { z } from "zod";

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID;

const AccessTokenSchema = z.object({
  agentId: z.string().optional(),
});

/**
 * Get a Retell access token for WebRTC calls
 * Called by the call page to initiate browser-based calls
 */
export async function POST(request: Request) {
  if (!RETELL_API_KEY) {
    console.error("[retell/access-token] RETELL_API_KEY not configured");
    return NextResponse.json(
      { error: "Retell not configured" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = AccessTokenSchema.safeParse(body);
  const agentId = parsed.success ? parsed.data.agentId : RETELL_AGENT_ID;

  if (!agentId) {
    return NextResponse.json(
      { error: "Agent ID required" },
      { status: 400 }
    );
  }

  try {
    // Call Retell API to create a web call
    const response = await fetch("https://api.retellai.com/v2/create-web-call", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RETELL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agent_id: agentId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[retell/access-token] Retell API error:", errorText);
      return NextResponse.json(
        { error: "Failed to create call" },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log("[retell/access-token] Created web call:", {
      callId: data.call_id,
      hasToken: Boolean(data.access_token)
    });

    return NextResponse.json({
      accessToken: data.access_token,
      callId: data.call_id,
    });
  } catch (error) {
    console.error("[retell/access-token] Error:", error);
    return NextResponse.json(
      { error: "Failed to get access token" },
      { status: 500 }
    );
  }
}

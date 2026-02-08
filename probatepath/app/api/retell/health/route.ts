import { NextResponse } from "next/server";

/**
 * Health check endpoint for Retell integration
 * Helps diagnose configuration issues
 */
export async function GET() {
  const config = {
    api_key: !!process.env.RETELL_API_KEY,
    agent_id: !!process.env.RETELL_AGENT_ID,
    phone_number: !!process.env.RETELL_PHONE_NUMBER,
    webhook_secret: !!process.env.RETELL_WEBHOOK_SECRET,
    webhook_secret_length: process.env.RETELL_WEBHOOK_SECRET?.length || 0,
    webhook_secret_starts_with: process.env.RETELL_WEBHOOK_SECRET?.substring(0, 6) || "none",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  const allConfigured = config.api_key && config.agent_id && config.phone_number && config.webhook_secret;

  return NextResponse.json({
    status: allConfigured ? "healthy" : "unhealthy",
    configured: config,
    issues: {
      missing_api_key: !config.api_key,
      missing_agent_id: !config.agent_id,
      missing_phone_number: !config.phone_number,
      missing_webhook_secret: !config.webhook_secret,
      webhook_secret_empty: config.webhook_secret_length === 0,
    },
    message: allConfigured
      ? "All Retell configuration is present"
      : "Some Retell configuration is missing - check issues object",
  });
}

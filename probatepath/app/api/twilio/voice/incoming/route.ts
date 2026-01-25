import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

// Twilio's free hold music - use HTTPS and a known working track
// Multiple options for reliability:
// - Twilio's built-in piano track: https://api.twilio.com/Cowbell.mp3
// - Alternative: https://api.twilio.com/MusicLoop.mp3
const HOLD_MUSIC_URL = "https://api.twilio.com/Cowbell.mp3";

// Phone numbers from environment
const RETELL_PHONE_NUMBER = process.env.RETELL_PHONE_NUMBER || "+16046703534";
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || "+16043321466";

/**
 * Handle incoming calls to ProbateDesk
 *
 * Flow:
 * 1. Play welcome greeting
 * 2. Play hold music for ~30-40 seconds
 * 3. Play "connecting you now" message
 * 4. Dial Retell AI agent
 * 5. If Retell doesn't answer -> voicemail fallback
 */
export async function POST(request: NextRequest) {
  const twiml = new VoiceResponse();

  // Log incoming call for debugging
  console.log("[twilio.voice.incoming] New call received, generating IVR flow");

  // Welcome message
  twiml.say(
    {
      voice: "Polly.Joanna",
      language: "en-US",
    },
    "Thank you for calling ProbateDesk, B.C.'s trusted probate specialists. " +
    "A team member will be with you in approximately 45 seconds. " +
    "Your call is important to us."
  );

  // Slight pause to let message sink in
  twiml.pause({ length: 1 });

  // Play hold music multiple times to create a longer hold
  // Each loop lasts ~10 seconds, so 5 loops = ~50 seconds
  for (let i = 0; i < 5; i++) {
    twiml.play(HOLD_MUSIC_URL);
  }

  // Connection message before dialing
  twiml.say(
    {
      voice: "Polly.Joanna",
    },
    "Thank you for your patience. Connecting you to our team now."
  );

  // Pause briefly before connecting
  twiml.pause({ length: 1 });

  // Connect to Retell AI agent with longer timeout
  const dial = twiml.dial({
    callerId: TWILIO_PHONE_NUMBER,
    timeout: 45, // Increased from 30 to 45 seconds to give Retell time to answer
    // If Retell doesn't answer, route to voicemail handler
    action: "/api/twilio/voice/dial-status",
    record: "record-from-answer", // Record the call for quality/compliance
  });
  dial.number(RETELL_PHONE_NUMBER);

  console.log("[twilio.voice.incoming] TwiML generated, routing to Retell agent");

  return new NextResponse(twiml.toString(), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

/**
 * GET handler for testing/verification
 */
export async function GET() {
  return NextResponse.json({
    status: "Twilio voice webhook ready",
    endpoint: "/api/twilio/voice/incoming",
    retellNumber: RETELL_PHONE_NUMBER,
    twilioNumber: TWILIO_PHONE_NUMBER,
  });
}

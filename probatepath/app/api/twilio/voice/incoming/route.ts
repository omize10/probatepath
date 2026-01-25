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
    "Thank you for calling ProbateDesk. A team member will be with you shortly. Your call is important to us."
  );

  // CRITICAL: Pause AFTER saying welcome to let message complete
  twiml.pause({ length: 3 });

  // Hold music - play the same track multiple times with NO loop parameter
  // This ensures each play() is a sequential step
  console.log("[twilio.voice.incoming] Starting 50 second hold music sequence");
  twiml.play("https://api.twilio.com/Cowbell.mp3");
  twiml.play("https://api.twilio.com/Cowbell.mp3");
  twiml.play("https://api.twilio.com/Cowbell.mp3");
  twiml.play("https://api.twilio.com/Cowbell.mp3");
  twiml.play("https://api.twilio.com/Cowbell.mp3");

  // Connection message - this plays AFTER the hold completes
  twiml.say(
    {
      voice: "Polly.Joanna",
    },
    "Connecting you to our agent now."
  );

  // Pause before dialing to ensure message completes
  twiml.pause({ length: 2 });

  // NOW dial the agent (this happens after all the above)
  const dial = twiml.dial({
    callerId: TWILIO_PHONE_NUMBER,
    timeout: 45,
    action: "/api/twilio/voice/dial-status",
    record: "record-from-answer",
  });
  dial.number(RETELL_PHONE_NUMBER);

  console.log("[twilio.voice.incoming] TwiML generated with full IVR sequence");

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

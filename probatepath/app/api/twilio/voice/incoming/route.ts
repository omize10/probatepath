import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

// Twilio's free hold music - calm piano track
const HOLD_MUSIC_URL = "http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-B4_Trehds.mp3";

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

  // Brief pause after greeting
  twiml.pause({ length: 2 });

  // Hold music - loop 4 times for approximately 30-40 seconds total
  twiml.play({ loop: 4 }, HOLD_MUSIC_URL);

  // Connection message
  twiml.say(
    {
      voice: "Polly.Joanna",
    },
    "Thank you for your patience. Connecting you now."
  );

  // Connect to Retell AI agent
  const dial = twiml.dial({
    callerId: TWILIO_PHONE_NUMBER,
    timeout: 30,
    // If Retell doesn't answer, route to voicemail handler
    action: "/api/twilio/voice/dial-status",
  });
  dial.number(RETELL_PHONE_NUMBER);

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

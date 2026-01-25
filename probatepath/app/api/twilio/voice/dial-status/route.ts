import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

/**
 * Handle dial completion/failure
 *
 * Called by Twilio after attempting to connect to Retell AI.
 * If the call wasn't answered or failed, offer voicemail.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();

  // Twilio sends these parameters after a Dial completes
  const dialCallStatus = formData.get("DialCallStatus")?.toString();
  const dialCallDuration = formData.get("DialCallDuration")?.toString();
  const callerPhone = formData.get("From")?.toString();

  console.log("[twilio.voice.dial-status] Dial completed:", {
    dialCallStatus,
    dialCallDuration,
    callerPhone,
  });

  const twiml = new VoiceResponse();

  // Check if the call was successfully completed
  // DialCallStatus can be: completed, busy, no-answer, failed, canceled
  if (dialCallStatus === "completed") {
    // Call was successfully handled by Retell, just hang up
    twiml.hangup();
  } else {
    // Retell didn't answer - offer voicemail
    twiml.say(
      {
        voice: "Polly.Joanna",
      },
      "We're sorry, all of our specialists are currently assisting other clients. " +
      "Please leave a message after the beep, including your name and phone number, " +
      "and we will return your call as soon as possible. " +
      "Or you can call back during our business hours."
    );

    // Record the voicemail
    twiml.record({
      maxLength: 120, // 2 minutes max
      action: "/api/twilio/voice/recording",
      transcribe: true,
      transcribeCallback: "/api/twilio/voice/recording",
      playBeep: true,
      timeout: 5, // 5 seconds of silence before stopping
    });

    // If they don't leave a message, say goodbye
    twiml.say(
      {
        voice: "Polly.Joanna",
      },
      "We did not receive a message. Thank you for calling ProbateDesk. Goodbye."
    );
  }

  return new NextResponse(twiml.toString(), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

/**
 * GET handler for testing
 */
export async function GET() {
  return NextResponse.json({
    status: "Dial status handler ready",
    endpoint: "/api/twilio/voice/dial-status",
    description: "Handles voicemail if Retell doesn't answer",
  });
}

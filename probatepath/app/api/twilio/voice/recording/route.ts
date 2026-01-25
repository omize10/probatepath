import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { prisma, prismaEnabled } from "@/lib/prisma";

const VoiceResponse = twilio.twiml.VoiceResponse;

/**
 * Handle voicemail recordings and transcriptions
 *
 * This endpoint receives:
 * 1. Recording callback with the audio URL
 * 2. Transcription callback with the text
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();

  // Common parameters
  const callSid = formData.get("CallSid")?.toString();
  const callerPhone = formData.get("From")?.toString();

  // Recording parameters (from record callback)
  const recordingUrl = formData.get("RecordingUrl")?.toString();
  const recordingDuration = formData.get("RecordingDuration")?.toString();
  const recordingSid = formData.get("RecordingSid")?.toString();

  // Transcription parameters (from transcribeCallback)
  const transcriptionText = formData.get("TranscriptionText")?.toString();
  const transcriptionStatus = formData.get("TranscriptionStatus")?.toString();

  console.log("[twilio.voice.recording] Received callback:", {
    callSid,
    callerPhone,
    recordingUrl,
    recordingDuration,
    recordingSid,
    transcriptionStatus,
    transcriptionText: transcriptionText?.substring(0, 100), // Log first 100 chars
  });

  // If this is a recording callback (has recordingUrl)
  if (recordingUrl && prismaEnabled) {
    try {
      // Store the voicemail in the database
      await prisma.voicemail.create({
        data: {
          callSid: callSid || "unknown",
          callerPhone: callerPhone || "unknown",
          recordingUrl: `${recordingUrl}.mp3`, // Twilio serves recordings as MP3
          recordingSid: recordingSid || undefined,
          durationSeconds: recordingDuration ? parseInt(recordingDuration, 10) : undefined,
          createdAt: new Date(),
        },
      });

      console.log("[twilio.voice.recording] Voicemail saved to database");
    } catch (error) {
      console.error("[twilio.voice.recording] Failed to save voicemail:", error);
    }
  }

  // If this is a transcription callback (has transcriptionText)
  if (transcriptionText && recordingSid && prismaEnabled) {
    try {
      // Update the voicemail record with transcription
      await prisma.voicemail.updateMany({
        where: { recordingSid },
        data: {
          transcription: transcriptionText,
          transcriptionStatus: transcriptionStatus || "completed",
        },
      });

      console.log("[twilio.voice.recording] Transcription saved to database");
    } catch (error) {
      console.error("[twilio.voice.recording] Failed to save transcription:", error);
    }
  }

  // Return TwiML response (Twilio expects XML response)
  const twiml = new VoiceResponse();

  // If this is the recording completion, say goodbye
  if (recordingUrl) {
    twiml.say(
      {
        voice: "Polly.Joanna",
      },
      "Thank you for your message. A team member will get back to you shortly. Goodbye."
    );
    twiml.hangup();
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
    status: "Recording handler ready",
    endpoint: "/api/twilio/voice/recording",
    description: "Saves voicemail recordings and transcriptions",
  });
}

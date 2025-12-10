import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatAboutWill } from "@/lib/claude";
import { getRequestClientInfo } from "@/lib/auth/request-info";

const DISCLAIMER_TEXT = "\n\nThis is general information only, not legal advice. Check it against your documents and talk to a BC lawyer if you are unsure.";

export async function POST(request: NextRequest) {
  try {
    // Require authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Parse request body
    const body = await request.json();
    const { message, extractionId, currentStep } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!currentStep || typeof currentStep !== "string") {
      return NextResponse.json({ error: "Current step is required" }, { status: 400 });
    }

    // Load extraction if provided
    let extraction = null;
    if (extractionId) {
      const extractionRecord = await prisma.willExtraction.findUnique({
        where: { id: extractionId },
      });

      // Verify ownership
      if (extractionRecord && extractionRecord.userId === userId) {
        extraction = extractionRecord;
      }
    }

    // Call Claude to get response
    const aiResponse = await chatAboutWill({
      message: message.trim(),
      extraction: extraction
        ? {
            testatorName: extraction.testatorName,
            willDate: extraction.willDate,
            executors: extraction.executors,
            beneficiaries: extraction.beneficiaries,
            hasCodicils: extraction.hasCodicils,
            handwrittenChanges: extraction.handwrittenChanges,
            issues: extraction.issues,
            rawText: extraction.rawText,
          }
        : null,
      currentStep,
    });

    // Add disclaimer to the response
    const responseWithDisclaimer = aiResponse + DISCLAIMER_TEXT;

    // Log to audit
    const { ip, userAgent } = await getRequestClientInfo();
    await prisma.auditLog.create({
      data: {
        userId,
        action: "ai_chat_message",
        resourceType: "will_chat",
        resourceId: extractionId ?? undefined,
        ip: ip ?? undefined,
        ua: userAgent ?? undefined,
        meta: {
          userMessage: message.substring(0, 500), // Truncate for storage
          aiResponse: aiResponse.substring(0, 500),
          currentStep,
          hasExtraction: !!extraction,
        },
      },
    });

    return NextResponse.json({ response: responseWithDisclaimer });
  } catch (error) {
    console.error("Will chat error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to chat with AI" },
      { status: 500 }
    );
  }
}

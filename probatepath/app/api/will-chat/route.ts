import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatAboutWill } from "@/lib/claude";
import { getIp, getUA } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, extractionId, currentStep } = (await req.json().catch(() => ({}))) as {
    message?: string;
    extractionId?: string | null;
    currentStep?: string;
  };
  if (!message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const extraction = extractionId
    ? await prisma.willExtraction.findUnique({
        where: { id: extractionId, userId },
      })
    : null;

  const aiMessage = await chatAboutWill({
    message,
    extraction,
    currentStep: currentStep ?? "general",
  });

  const disclaimer =
    "This is general information only, not legal advice. Check it against your documents and talk to a BC lawyer if you are unsure.";
  const fullResponse = aiMessage.toLowerCase().includes("not legal advice")
    ? aiMessage
    : `${aiMessage.trim()}\n\n${disclaimer}`;

  await prisma.auditLog.create({
    data: {
      userId,
      action: "ai_chat_message",
      resourceType: extraction ? "will_chat" : "intake_chat",
      resourceId: extractionId ?? null,
      metadata: { userMessage: message, aiResponse: aiMessage, step: currentStep ?? null },
      ipAddress: getIp(req) ?? null,
      userAgent: getUA(req) ?? null,
    },
  });

  return NextResponse.json({ response: fullResponse });
}

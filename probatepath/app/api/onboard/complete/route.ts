import { NextResponse } from "next/server";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { z } from "zod";

const CompleteOnboardSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  tier: z.enum(["essentials", "guided", "full_service"]),
  grantType: z.enum(["probate", "administration"]),
  aiCallId: z.string().optional(),
  screening: z.object({
    hasWill: z.boolean().optional(),
    hasOriginal: z.boolean().optional(),
    expectsDispute: z.boolean().optional(),
    foreignAssets: z.boolean().optional(),
    estateValue: z.string().optional(),
  }).optional(),
  redFlags: z.array(z.string()).optional(),
});

/**
 * Complete onboarding and create user/lead record
 * Called when user proceeds to payment
 */
export async function POST(request: Request) {
  if (!prismaEnabled) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CompleteOnboardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, phone, tier, grantType, aiCallId, screening, redFlags } = parsed.data;

  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          phone,
          createdVia: aiCallId ? "ai_call" : "onboard_flow",
        },
      });
      console.log("[onboard/complete] Created new user:", user.id);
    } else {
      // Update existing user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.name || name,
          phone: user.phone || phone,
        },
      });
      console.log("[onboard/complete] Updated existing user:", user.id);
    }

    // Create lead source record
    await prisma.leadSource.create({
      data: {
        userId: user.id,
        source: aiCallId ? "retell_call" : "onboard_flow",
      },
    });

    // If we have an AI call ID, link it to the user
    if (aiCallId) {
      const aiCallExists = await prisma.aiCall.findUnique({
        where: { id: aiCallId },
      });

      if (aiCallExists) {
        await prisma.aiCall.update({
          where: { id: aiCallId },
          data: {
            userId: user.id,
            recommendedTier: tier,
            grantType,
          },
        });
      }
    }

    // Create tier selection record
    const tierSelection = await prisma.tierSelection.create({
      data: {
        userId: user.id,
        selectedTier: tier,
        tierPrice: tier === "essentials" ? 799 : tier === "guided" ? 1499 : 2499,
        screeningFlags: redFlags || [],
        grantType,
        screeningData: screening || {},
      },
    });

    console.log("[onboard/complete] Onboarding completed:", {
      userId: user.id,
      tier,
      grantType,
      tierSelectionId: tierSelection.id,
    });

    return NextResponse.json({
      success: true,
      user_id: user.id,
      tier_selection_id: tierSelection.id,
    });
  } catch (error) {
    console.error("[onboard/complete] Error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}

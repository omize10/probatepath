import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { TIER_PRICES, type Tier } from "@/types/pricing";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const body = await request.json();
    const { tier, addOns = [] } = body as { tier: Tier; addOns?: string[] };

    if (!tier || !["basic", "standard", "premium"].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier selection" }, { status: 400 });
    }

    const tierPrice = TIER_PRICES[tier];

    if (!prismaEnabled) {
      // Return mock data if Prisma is not enabled
      return NextResponse.json({
        tierSelectionId: "mock-tier-selection-id",
        tier,
        tierPrice,
      });
    }

    // Create tier selection record
    const tierSelection = await prisma.tierSelection.create({
      data: {
        userId,
        selectedTier: tier,
        tierPrice,
        screeningFlags: addOns,
      },
    });

    // Update user's selected tier
    await prisma.user.update({
      where: { id: userId },
      data: {
        selectedTier: tier,
        isPremium: tier === "premium",
      },
    });

    return NextResponse.json({
      tierSelectionId: tierSelection.id,
      tier: tierSelection.selectedTier,
      tierPrice: tierSelection.tierPrice,
    });
  } catch (error) {
    console.error("[api/tier/select] Error:", error);
    return NextResponse.json(
      { error: "Failed to save tier selection" },
      { status: 500 }
    );
  }
}

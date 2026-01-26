import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { TIER_PRICES, TIER_NAME_MAP, type Tier, type NewTier, type LegacyTier } from "@/types/pricing";

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
    const { selectedTier, addOns = [] } = body as { selectedTier: Tier; addOns?: string[] };

    if (!selectedTier || !["essentials", "guided", "full_service", "basic", "standard", "premium"].includes(selectedTier)) {
      return NextResponse.json({ error: "Invalid tier selection" }, { status: 400 });
    }

    // Map new tier names to legacy names for database storage
    const isNewTierName = (tier: Tier): tier is NewTier =>
      ["essentials", "guided", "full_service"].includes(tier);

    const dbTier: LegacyTier = isNewTierName(selectedTier)
      ? TIER_NAME_MAP[selectedTier]
      : selectedTier as LegacyTier;

    const tierPrice = TIER_PRICES[selectedTier];

    if (!prismaEnabled) {
      // Return mock data if Prisma is not enabled
      return NextResponse.json({
        tierSelectionId: "mock-tier-selection-id",
        tier: dbTier,
        tierPrice,
      });
    }

    // Create tier selection record (store as legacy tier name)
    const tierSelection = await prisma.tierSelection.create({
      data: {
        userId,
        selectedTier: dbTier,
        tierPrice,
        screeningFlags: addOns,
      },
    });

    // Update user's selected tier
    await prisma.user.update({
      where: { id: userId },
      data: {
        selectedTier: dbTier,
        isPremium: dbTier === "premium",
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

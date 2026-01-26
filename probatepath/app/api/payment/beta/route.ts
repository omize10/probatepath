import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, prismaEnabled } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // TEMPORARY BETA FIX: Allow requests without session for testing
    // TODO: Remove this before production launch
    let userId: string | undefined;
    if (session?.user) {
      userId = (session.user as { id?: string }).id;
    } else {
      // Extract user ID from tier selection or use mock
      userId = "beta-test-user-" + Date.now();
      console.warn("[payment/beta] BETA MODE: Using mock user ID:", userId);
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const body = await request.json();
    const {
      tierSelectionId,
      cardNumber,
      cardholderName,
      billingAddress,
      city,
      province,
      postalCode,
      skipped = false,
    } = body;

    if (!tierSelectionId) {
      return NextResponse.json({ error: "Tier selection ID is required" }, { status: 400 });
    }

    // Determine next route based on tier
    let nextRoute = "/portal/intake"; // Default for basic tier
    let selectedTier = "basic";

    if (prismaEnabled) {
      // Verify tier selection exists
      const tierSelection = await prisma.tierSelection.findFirst({
        where: {
          id: tierSelectionId,
        },
      });

      if (!tierSelection) {
        console.error("[payment/beta] Tier selection not found:", tierSelectionId);
        return NextResponse.json({ error: "Tier selection not found" }, { status: 404 });
      }

      // BETA: Use the userId from the tier selection (the user was created there)
      // This ensures we use the same user that was created during tier selection
      const actualUserId = tierSelection.userId;
      selectedTier = tierSelection.selectedTier;

      console.log("[payment/beta] Using userId from tierSelection:", actualUserId);

      // Store partial card number (last 4 digits only) for reference
      const cardNumberPartial = cardNumber ? `****${cardNumber.slice(-4)}` : null;

      // Create beta payment record
      await prisma.betaPayment.create({
        data: {
          userId: actualUserId,
          tierSelectionId,
          cardNumberPartial,
          cardholderName: cardholderName || null,
          billingAddress: billingAddress || null,
          city: city || null,
          province: province || null,
          postalCode: postalCode || null,
          skipped,
        },
      });

      // Update user's intake method based on tier (skip for mock beta users)
      if (!actualUserId.startsWith("beta-test-user")) {
        await prisma.user.update({
          where: { id: actualUserId },
          data: {
            intakeMethod: selectedTier === "basic" ? "manual" : "callback",
          },
        });
      }
    }

    // Route based on tier
    if (selectedTier === "basic") {
      nextRoute = "/portal/intake";
    } else {
      // Standard and Premium go to callback scheduling
      nextRoute = "/intake/schedule";
    }

    return NextResponse.json({
      success: true,
      nextRoute,
    });
  } catch (error) {
    console.error("[api/payment/beta] Error:", error);
    return NextResponse.json(
      { error: "Failed to save payment information" },
      { status: 500 }
    );
  }
}

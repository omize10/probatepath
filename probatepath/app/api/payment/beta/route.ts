import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, prismaEnabled } from "@/lib/prisma";

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
      // Verify tier selection exists and belongs to user
      const tierSelection = await prisma.tierSelection.findFirst({
        where: {
          id: tierSelectionId,
          userId,
        },
      });

      if (!tierSelection) {
        return NextResponse.json({ error: "Tier selection not found" }, { status: 404 });
      }

      selectedTier = tierSelection.selectedTier;

      // Store partial card number (last 4 digits only) for reference
      const cardNumberPartial = cardNumber ? `****${cardNumber.slice(-4)}` : null;

      // Create beta payment record
      await prisma.betaPayment.create({
        data: {
          userId,
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

      // Update user's intake method based on tier
      await prisma.user.update({
        where: { id: userId },
        data: {
          intakeMethod: selectedTier === "basic" ? "manual" : "callback",
        },
      });
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

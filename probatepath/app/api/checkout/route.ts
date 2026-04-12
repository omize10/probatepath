import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { TIER_PRICES, type Tier } from "@/types/pricing";
import { rateLimit, ipFromRequest } from "@/lib/rate-limit";

/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout Session for the selected tier and returns the
 * URL the client should redirect to. If Stripe isn't configured (no
 * STRIPE_SECRET_KEY env var) we return 503 so the client can fall back to
 * the existing /api/payment/beta no-charge flow.
 *
 * Body:
 *   { tier: "basic" | "standard" | "premium" | "essentials" | "guided" |
 *           "full_service" | "white_glove",
 *     tierSelectionId?: string }
 *
 * Response:
 *   200 { url: "https://checkout.stripe.com/..." }
 *   401 not signed in
 *   400 invalid tier
 *   503 Stripe not configured
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 });
  }

  // Per-user rate limit so a logged-in user can't spam Checkout creation.
  if (!rateLimit(`checkout:${userId}`, 20, 60 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured", fallback: "/api/payment/beta" },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    tier?: Tier;
    tierSelectionId?: string;
  };

  const tier = body.tier;
  if (!tier || !(tier in TIER_PRICES)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const amountCents = TIER_PRICES[tier] * 100;
  const tierLabel: Record<Tier, string> = {
    basic: "Basic — BC Probate Documents",
    essentials: "Basic — BC Probate Documents",
    standard: "Standard — BC Probate Documents + Guidance",
    guided: "Standard — BC Probate Documents + Guidance",
    premium: "Premium — Full-Service BC Probate",
    full_service: "Premium — Full-Service BC Probate",
    white_glove: "White Glove — Full-Service BC Probate",
  };

  // Look up user details for prefilling Checkout.
  const user = prismaEnabled
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true, matters: { select: { id: true }, take: 1 } },
      })
    : null;

  const matterId = user?.matters?.[0]?.id;
  const baseUrl = process.env.APP_URL || "https://www.probatedesk.com";

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user?.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: tierLabel[tier],
              description: "ProbateDesk document preparation. Fixed price, no surprise fees.",
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/portal?paid=1&session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pay?tier=${tier}&cancelled=1`,
      metadata: {
        userId,
        tier,
        tierSelectionId: body.tierSelectionId ?? "",
        matterId: matterId ?? "",
      },
      payment_intent_data: {
        receipt_email: user?.email ?? undefined,
        metadata: {
          userId,
          tier,
          matterId: matterId ?? "",
        },
      },
    });

    // Pre-create a pending Payment row so the webhook only ever has to update.
    if (prismaEnabled && checkout.id) {
      await prisma.payment
        .create({
          data: {
            userId,
            matterId: matterId ?? null,
            tier,
            amountCents,
            currency: "cad",
            status: "pending",
            provider: "stripe",
            stripeSessionId: checkout.id,
            receiptEmail: user?.email ?? null,
          },
        })
        .catch((err) => {
          console.error("[checkout] failed to write pending Payment row", err);
        });
    }

    if (!checkout.url) {
      return NextResponse.json({ error: "Checkout session has no URL" }, { status: 500 });
    }

    return NextResponse.json({ url: checkout.url, id: checkout.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[checkout] Stripe error:", message);
    return NextResponse.json({ error: "Unable to create checkout session" }, { status: 500 });
  }
}

export async function GET() {
  // Used by /pay client to decide whether to use Stripe or fall back to beta.
  return NextResponse.json({ enabled: isStripeConfigured() });
}

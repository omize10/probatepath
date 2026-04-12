import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { sendTemplateEmail } from "@/lib/email";

/**
 * POST /api/webhooks/stripe
 *
 * Stripe-signed webhook handler. Configure in Stripe Dashboard:
 *   URL: https://www.probatedesk.com/api/webhooks/stripe
 *   Events: checkout.session.completed, charge.refunded
 *
 * The Stripe signing secret must be set as STRIPE_WEBHOOK_SECRET in env.
 * Without it, all incoming requests are rejected with 400.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    // Stripe not configured — should never get here in production but be safe.
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Stripe needs the raw body, not parsed JSON, to verify the signature.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "verification failed";
    console.error("[stripe webhook] signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }
      default:
        // Acknowledge other events to prevent Stripe from retrying.
        break;
    }
  } catch (err) {
    console.error(`[stripe webhook] handler for ${event.type} threw:`, err);
    // Return 500 so Stripe retries (idempotency: our handlers are upserts).
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!prismaEnabled) return;
  if (session.payment_status !== "paid") return;

  const stripeSessionId = session.id;
  const stripePaymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier ?? "basic";
  const matterId = session.metadata?.matterId || null;
  const amountCents = session.amount_total ?? 0;
  const receiptEmail = session.customer_details?.email ?? session.customer_email ?? null;

  if (!userId) {
    console.error("[stripe webhook] checkout.session.completed missing userId metadata");
    return;
  }

  // Upsert: a pending row was created at checkout time, but if for some
  // reason it isn't there (race condition), we still want to record the
  // payment.
  const existing = await prisma.payment.findUnique({
    where: { stripeSessionId },
  });

  if (existing) {
    await prisma.payment.update({
      where: { id: existing.id },
      data: {
        status: "paid",
        stripePaymentIntentId,
        stripeCustomerId,
        amountCents: amountCents || existing.amountCents,
        paidAt: new Date(),
        receiptEmail: receiptEmail ?? existing.receiptEmail,
      },
    });
  } else {
    await prisma.payment.create({
      data: {
        userId,
        matterId,
        tier,
        amountCents,
        currency: (session.currency || "cad").toLowerCase(),
        status: "paid",
        provider: "stripe",
        stripeSessionId,
        stripePaymentIntentId,
        stripeCustomerId,
        paidAt: new Date(),
        receiptEmail,
      },
    });
  }

  // Send a receipt email so the customer immediately sees the charge in
  // their inbox. Stripe also sends its own automated receipt; this one is
  // branded.
  const dollars = (amountCents / 100).toFixed(2);
  if (receiptEmail) {
    await sendTemplateEmail({
      to: receiptEmail,
      subject: `Your ProbateDesk receipt — $${dollars} CAD`,
      template: "payment_receipt",
      html: `<p>Thank you for your payment.</p>
<p><strong>Amount:</strong> $${dollars} CAD<br>
<strong>Tier:</strong> ${escapeHtml(tier)}<br>
<strong>Reference:</strong> ${escapeHtml(stripeSessionId)}</p>
<p>You'll receive a separate email when your documents are ready. In the meantime, you can sign in to your portal at <a href="https://www.probatedesk.com/portal">probatedesk.com/portal</a> to start the intake.</p>`,
    }).catch((err) => console.error("[stripe webhook] receipt email failed", err));
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  if (!prismaEnabled) return;
  const stripePaymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : null;
  if (!stripePaymentIntentId) return;

  const refundedAmount = charge.amount_refunded ?? 0;

  await prisma.payment.updateMany({
    where: { stripePaymentIntentId },
    data: {
      status: refundedAmount >= (charge.amount ?? 0) ? "refunded" : "paid",
      refundedAt: new Date(),
      refundedAmountCents: refundedAmount,
    },
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c),
  );
}

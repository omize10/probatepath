/**
 * Sends one of each branded transactional email to a target address using Resend.
 * Run with: npx tsx scripts/test-email.ts <to-email>
 *
 * This bypasses the message-template DB lookup and uses lib/messaging/default-templates
 * directly so we can verify the *rendered* HTML and confirm Resend deliverability.
 */
import { DEFAULT_TEMPLATES } from "@/lib/messaging/default-templates";
import { Resend } from "resend";
import Handlebars from "handlebars";

async function main() {
  const to = process.argv[2];
  if (!to) {
    console.error("Usage: npx tsx scripts/test-email.ts <to-email>");
    process.exit(1);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY missing");
    process.exit(1);
  }
  const from = process.env.RESEND_FROM ?? process.env.MAIL_FROM ?? "ProbateDesk <onboarding@resend.dev>";
  console.log(`[test-email] From: ${from}`);
  console.log(`[test-email] To:   ${to}`);
  console.log(`[test-email] ${DEFAULT_TEMPLATES.length} templates to send`);

  const resend = new Resend(apiKey);

  const sampleVars: Record<string, unknown> = {
    name: "Omar (test)",
    portalLink: "https://probatedesk.ca/portal",
    caseId: "TEST-1234",
    code: "123456",
    minutes: 10,
    pricingTier: "Standard",
    pricingAmount: "1499",
    callbackTime: "Tomorrow at 2pm PT",
    deadlineDate: "April 18, 2026",
    daysRemaining: 7,
    grantDate: "March 1, 2026",
    documentName: "Submission for Estate Grant (P2)",
    notaryAddress: "123 Hornby St, Vancouver",
    paymentLink: "https://probatedesk.ca/pay/test",
    resumeLink: "https://probatedesk.ca/resume?token=test",
  };

  const results: { template: string; ok: boolean; error?: string }[] = [];

  for (const tmpl of DEFAULT_TEMPLATES) {
    try {
      const subjectFn = Handlebars.compile(tmpl.emailSubject ?? "(no subject)");
      const bodyFn = Handlebars.compile(tmpl.emailHtml ?? tmpl.emailPlainText ?? "");
      const subject = `[TEST] ${subjectFn(sampleVars)}`;
      const html = bodyFn(sampleVars);
      const result = await resend.emails.send({ from, to, subject, html });
      console.log(`  ✓ ${tmpl.key}  →  ${result.data?.id ?? "(no id)"}`);
      results.push({ template: tmpl.key, ok: true });
      // tiny delay to be polite to Resend
      await new Promise((r) => setTimeout(r, 250));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${tmpl.key}  →  ${msg}`);
      results.push({ template: tmpl.key, ok: false, error: msg });
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length} sent / ${failed.length} failed`);
  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Default Message Templates
 *
 * These are the hardcoded defaults used when:
 * 1. A template doesn't exist in the database yet
 * 2. Seeding the database with initial templates
 *
 * All templates share a branded HTML shell (BRAND_WRAP) that matches
 * probatedesk.com — ProbateDesk wordmark, Inter font, #0d1726 primary,
 * rounded card, "not a law firm" footer disclaimer.
 */

import type { TemplateDefinition } from './types';

// -----------------------------------------------------------------------------
// Shared branded HTML shell
// -----------------------------------------------------------------------------

const BRAND = '#0d1726';
const BRAND_DARK = '#10192a';
const INK = '#0a0d12';
const INK_MUTED = '#4b5563';
const BORDER = '#e5e7eb';
const BG = '#f5f7fa';
const FONT = `-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif`;

interface WrapOptions {
  preheader: string;
  body: string;
}

/**
 * Wraps a body fragment in the ProbateDesk branded email shell.
 * Use table-based layout for maximum email-client compatibility.
 */
function wrap({ preheader, body }: WrapOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>ProbateDesk</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:${FONT};color:${INK};-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${BG};">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid ${BORDER};border-radius:20px;overflow:hidden;">
        <tr>
          <td style="padding:36px 40px 24px 40px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:22px;font-weight:700;color:${BRAND};letter-spacing:-0.01em;line-height:1;">ProbateDesk</td>
                <td style="padding-left:10px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;vertical-align:middle;">Done</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 8px 40px;">
            <div style="height:1px;background:${BORDER};line-height:1px;">&nbsp;</div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 36px 40px;font-size:16px;line-height:1.65;color:${INK};">
${body}
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px;">
            <div style="height:1px;background:${BORDER};line-height:1px;">&nbsp;</div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px 32px 40px;font-size:12px;line-height:1.6;color:#6b7280;">
            <p style="margin:0 0 6px 0;">
              <strong style="color:${INK_MUTED};">ProbateDesk</strong> · BC probate document preparation
            </p>
            <p style="margin:0 0 12px 0;">
              Questions? Reply to this email or call <a href="tel:+16046703534" style="color:${BRAND};text-decoration:none;">(604) 670-3534</a>.
            </p>
            <p style="margin:0;color:#9ca3af;">
              ProbateDesk provides document preparation support and general information. We are not a law firm and do not provide legal advice; executors remain self-represented.
            </p>
          </td>
        </tr>
      </table>
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
        <tr>
          <td align="center" style="padding:16px 40px 8px 40px;font-size:11px;line-height:1.5;color:#9ca3af;">
            © ProbateDesk Technologies Inc. · <a href="https://probatedesk.com/legal#privacy" style="color:#9ca3af;text-decoration:underline;">Privacy</a> · <a href="https://probatedesk.com/legal#terms" style="color:#9ca3af;text-decoration:underline;">Terms</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** Primary CTA button */
function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
  <tr>
    <td style="border-radius:9999px;background:${BRAND};">
      <a href="${href}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:9999px;background:${BRAND};">${label}</a>
    </td>
  </tr>
</table>`;
}

/** One-time code badge (for auth emails) */
function codeBadge(code: string): string {
  return `<div style="margin:24px 0;padding:20px 24px;background:#f5f7fa;border:1px solid ${BORDER};border-radius:14px;text-align:center;">
  <div style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">Verification code</div>
  <div style="font-size:34px;font-weight:700;letter-spacing:0.24em;color:${BRAND};font-family:${FONT};">${code}</div>
</div>`;
}

// Quick alias so strings stay readable
const h = (level: 2 | 3, text: string) =>
  level === 2
    ? `<h2 style="margin:0 0 12px 0;font-size:22px;line-height:1.25;font-weight:700;color:${INK};">${text}</h2>`
    : `<h3 style="margin:20px 0 6px 0;font-size:15px;line-height:1.3;font-weight:700;color:${INK};">${text}</h3>`;

const p = (text: string) => `<p style="margin:0 0 14px 0;">${text}</p>`;

const mutedP = (text: string) =>
  `<p style="margin:0 0 14px 0;color:${INK_MUTED};">${text}</p>`;

const ol = (items: string[]) =>
  `<ol style="margin:0 0 14px 0;padding-left:20px;">${items
    .map((i) => `<li style="margin:0 0 6px 0;">${i}</li>`)
    .join('')}</ol>`;

// -----------------------------------------------------------------------------
// Templates
// -----------------------------------------------------------------------------

export const DEFAULT_TEMPLATES: TemplateDefinition[] = [
  // ========================================
  // TRANSACTIONAL
  // ========================================
  {
    key: 'welcome',
    name: 'Welcome Email',
    description: 'Sent when a new user registers an account',
    category: 'transactional',
    emailSubject: 'Welcome to ProbateDesk, {{name}}',
    emailHtml: wrap({
      preheader: 'Your ProbateDesk account is ready. Continue your BC probate journey in your portal.',
      body: `
${h(2, 'Welcome, {{name}}.')}
${p(`We're glad you're here. BC probate doesn't have to feel like climbing a mountain alone — we're going to walk it with you, step by step.`)}
${p(`Your account is ready. When you're set, head to your portal to continue where you left off:`)}
${button('{{portalLink}}', 'Open your portal')}
${mutedP(`Most people finish the intake in about 20 minutes. You can save and come back anytime.`)}
${p(`If you have questions, just reply to this email — a real person on our team will get back to you.`)}
${p(`— The ProbateDesk team`)}
`.trim(),
    }),
    smsBody: 'Welcome to ProbateDesk! Your account is ready: {{portalLink}}',
    smsEnabled: false,
    availableVariables: ['name', 'portalLink'],
    variableDescriptions: {
      name: "User's name",
      portalLink: 'Link to the user portal',
    },
  },
  {
    key: 'intake_submitted',
    name: 'Intake Submitted',
    description: 'Sent when user completes the intake form',
    category: 'transactional',
    emailSubject: 'Your ProbateDesk intake is saved',
    emailHtml: wrap({
      preheader: `Great news — your intake is saved. We're preparing your documents.`,
      body: `
${h(2, 'Your intake is saved.')}
${p(`Thanks for trusting us with something important. Our team has everything it needs to start preparing your BC probate documents.`)}
${h(3, 'What happens now')}
${ol([
  'Our specialists review your answers and draft your court forms.',
  'We flag anything that needs clarification — expect a quick email or call.',
  `You'll get a notification the moment your package is ready.`,
])}
${button('{{portalLink}}', 'Open your portal')}
${mutedP(`If you need to update an answer, you can resume your draft at any time:`)}
${p(`<a href="{{resumeLink}}" style="color:${BRAND};">Resume your draft →</a>`)}
${p(`— The ProbateDesk team`)}
`.trim(),
    }),
    smsBody: `ProbateDesk: Your intake is saved — we're preparing your documents. Portal: {{portalLink}}`,
    smsEnabled: true,
    availableVariables: ['resumeLink', 'portalLink'],
    variableDescriptions: {
      resumeLink: 'Link to resume the draft',
      portalLink: 'Link to the user portal',
    },
  },
  {
    key: 'resume_token',
    name: 'Resume Token',
    description: 'Sent when user requests a link to resume their draft',
    category: 'transactional',
    emailSubject: 'Resume your ProbateDesk draft',
    emailHtml: wrap({
      preheader: 'One-click link to pick up your draft where you left off.',
      body: `
${h(2, 'Pick up where you left off.')}
${p(`Your draft is saved. Use the link below to continue — no need to sign in again.`)}
${button('{{link}}', 'Resume your draft')}
${mutedP(`This link is valid for 24 hours. If it expires, just request a new one from the portal.`)}
${p(`— The ProbateDesk team`)}
`.trim(),
    }),
    smsBody: 'ProbateDesk: Resume your draft anytime: {{link}}',
    smsEnabled: true,
    availableVariables: ['link'],
    variableDescriptions: {
      link: 'One-time link to resume the draft',
    },
  },

  // ========================================
  // AUTH
  // ========================================
  {
    key: 'password_reset_code',
    name: 'Password Reset Code',
    description: 'Sent when user requests a password reset',
    category: 'auth',
    emailSubject: 'Your ProbateDesk password reset code',
    emailHtml: wrap({
      preheader: 'Use this code to reset your ProbateDesk password. Expires in 10 minutes.',
      body: `
${h(2, 'Reset your password')}
${p(`Here's your one-time code. Enter it on the password reset screen to continue.`)}
${codeBadge('{{code}}')}
${mutedP(`This code expires in 10 minutes. If you didn't request a reset, you can safely ignore this email — your account is still secure.`)}
${p(`— The ProbateDesk team`)}
`.trim(),
    }),
    smsBody: undefined,
    smsEnabled: false,
    availableVariables: ['code'],
    variableDescriptions: {
      code: '6-digit password reset code',
    },
  },
  {
    key: 'verification_code',
    name: 'Email Verification Code',
    description: 'Sent when user requests email code for sign-in or account verification',
    category: 'auth',
    emailSubject: 'Your ProbateDesk verification code',
    emailHtml: wrap({
      preheader: 'One-time code to verify your ProbateDesk sign-in. Expires in 10 minutes.',
      body: `
${h(2, "Confirm it's you")}
${p(`Enter this code on the verification screen to continue:`)}
${codeBadge('{{code}}')}
${mutedP(`This code expires in 10 minutes. If you didn't request it, you can safely ignore this email.`)}
${p(`— The ProbateDesk team`)}
`.trim(),
    }),
    smsBody: undefined,
    smsEnabled: false,
    availableVariables: ['code'],
    variableDescriptions: {
      code: '6-digit verification code',
    },
  },
  {
    key: 'magic_link',
    name: 'Magic Sign-in Link',
    description: 'Sent when user signs in via email',
    category: 'auth',
    emailSubject: 'Sign in to ProbateDesk',
    emailHtml: wrap({
      preheader: 'One-click sign-in link for your ProbateDesk account. Expires in 10 minutes.',
      body: `
${h(2, 'Sign in to ProbateDesk')}
${p(`Tap the button below and you'll be signed in — no password needed.`)}
${button('{{url}}', 'Sign in')}
${mutedP(`This link expires in 10 minutes and can only be used once. If you didn't request it, ignore this email.`)}
${p(`— The ProbateDesk team`)}
`.trim(),
    }),
    smsBody: undefined,
    smsEnabled: false,
    availableVariables: ['url'],
    variableDescriptions: {
      url: 'One-time sign-in link',
    },
  },

  // ========================================
  // REMINDERS
  // ========================================
  {
    key: 'generic_reminder',
    name: 'Generic Reminder',
    description: 'Sent for general scheduled reminders',
    category: 'reminder',
    emailSubject: 'Time for your next step — ProbateDesk',
    emailHtml: wrap({
      preheader: `A quick nudge — you've got a next step waiting in your ProbateDesk portal.`,
      body: `
${h(2, 'Your next step is ready.')}
${p(`Just a friendly check-in. When you're ready, hop into your portal — we'll show you exactly what to do next.`)}
${button('{{portalLink}}', 'Open your portal')}
${mutedP(`No rush. If you need a hand, reply to this email and we'll help.`)}
${p(`— The ProbateDesk team`)}
`.trim(),
    }),
    smsBody: `ProbateDesk: Your next step is ready — {{portalLink}}`,
    smsEnabled: true,
    availableVariables: ['portalLink'],
    variableDescriptions: {
      portalLink: 'Link to the user portal',
    },
  },
  {
    key: 'packet_ready',
    name: 'Packet Ready',
    description: 'Sent when will search packet is ready',
    category: 'reminder',
    emailSubject: 'Your will search packet is ready',
    emailHtml: wrap({
      preheader: `Your will search packet is ready to download — here's what to do next.`,
      body: `
${h(2, 'Your will search packet is ready.')}
${p(`We've prepared the will search (VSA 532) and a cover letter ready for you to mail. Download everything from your portal when you're ready.`)}
${button('{{portalLink}}', 'Download your packet')}
${h(3, `Here's what you'll do`)}
${ol([
  'Download and print the packet from your portal.',
  'Include the cheque or money order we describe in the cover letter.',
  `Mail it to Vital Statistics. We'll track the 21-day waiting period for you.`,
])}
${p(`— The ProbateDesk team`)}
`.trim(),
    }),
    smsBody: 'ProbateDesk: Your packet is ready — {{portalLink}}',
    smsEnabled: true,
    availableVariables: ['portalLink'],
    variableDescriptions: {
      portalLink: 'Link to the user portal',
    },
  },
  {
    key: 'probate_package_ready',
    name: 'Probate Package Ready',
    description: 'Sent when probate filing package is ready',
    category: 'reminder',
    emailSubject: 'Your probate filing package is ready',
    emailHtml: wrap({
      preheader: 'Your full probate filing package is ready. Download, sign, file.',
      body: `
${h(2, 'Your probate filing package is ready.')}
${p(`Everything we prepare is in one place — forms, instructions, and what to bring to the registry.`)}
${button('{{portalLink}}', 'Download your package')}
${h(3, 'Your next steps')}
${ol([
  'Download and review every document.',
  'Sign where indicated (we mark every spot for you).',
  'Visit a notary or commissioner for witnessed signatures.',
  'File at the BC Supreme Court registry.',
])}
${mutedP(`Stuck on anything? Reply to this email and we'll talk you through it.`)}
${p(`— The ProbateDesk team`)}
`.trim(),
    }),
    smsBody: 'ProbateDesk: Your probate filing package is ready — {{portalLink}}',
    smsEnabled: true,
    availableVariables: ['portalLink'],
    variableDescriptions: {
      portalLink: 'Link to the user portal',
    },
  },
  {
    key: 'probate_filing_ready',
    name: 'Probate Filing Ready',
    description: 'Sent when all probate forms are generated and ready for filing',
    category: 'reminder',
    emailSubject: 'Your filing packet is ready to go',
    emailHtml: wrap({
      preheader: 'All your BC probate forms are generated. Time to file.',
      body: `
${h(2, 'Ready to file.')}
${p(`Every form you need is prepared — P1 notices, P2 submission, P3 affidavit, P9 delivery, P10 assets and liabilities.`)}
${button('{{portalLink}}', 'Open your portal')}
${h(3, 'Filing checklist')}
${ol([
  'Download and print your complete package.',
  'Sign where indicated.',
  'Get your signature witnessed or notarized.',
  'File at your chosen BC Supreme Court registry.',
  'Keep a signed copy for yourself.',
])}
${p(`— The ProbateDesk team`)}
`.trim(),
    }),
    smsBody: `ProbateDesk: Your filing packet is ready — {{portalLink}}`,
    smsEnabled: true,
    availableVariables: ['portalLink'],
    variableDescriptions: {
      portalLink: 'Link to the user portal',
    },
  },
  {
    key: 'grant_checkin',
    name: 'Grant Check-in',
    description: 'Periodic check-in for cases waiting on court grant',
    category: 'reminder',
    emailSubject: 'Quick check-in on your grant — ProbateDesk',
    emailHtml: wrap({
      preheader: `Checking in on your BC probate grant. Any news from the registry?`,
      body: `
${h(2, 'Hi {{name}} — any news from the registry?')}
${p(`Just a friendly check-in on your probate application.`)}
${p(`<strong>Have you received your grant of probate yet?</strong> If you have, please log in and let us know — we'll help you with the next steps.`)}
${mutedP(`Still waiting? That's completely normal. BC courts typically take 6–12 weeks to process applications.`)}
${button('{{portalLink}}', 'Update your status')}
${p(`— The ProbateDesk team`)}
`.trim(),
    }),
    smsBody: 'ProbateDesk: Any news on your grant? Update us: {{portalLink}}',
    smsEnabled: true,
    availableVariables: ['name', 'portalLink'],
    variableDescriptions: {
      name: "User's name",
      portalLink: 'Link to the user portal',
    },
  },

  // ========================================
  // RECOVERY (Abandoned Call)
  // ========================================
  {
    key: 'abandoned_call_1h',
    name: 'Abandoned Call (1 Hour)',
    description: 'SMS sent 1 hour after an abandoned AI call',
    category: 'recovery',
    emailSubject: 'Continue your ProbateDesk journey',
    emailHtml: wrap({
      preheader: `Your progress is saved — ready to continue when you are.`,
      body: `
${h(2, `Hi {{name}} — we're still here.`)}
${p(`We noticed you didn't quite finish your call. No worries — everything you shared is saved.`)}
${p(`When you're ready, pick up right where you left off:`)}
${button('{{paymentUrl}}', 'Continue where you left off')}
${mutedP(`Have questions? Just reply to this email.`)}
${p(`— The ProbateDesk team`)}
`.trim(),
    }),
    smsBody: `Hi {{name}}, your ProbateDesk intake is saved. Continue when you're ready: {{paymentUrl}}`,
    smsEnabled: true,
    availableVariables: ['name', 'paymentUrl'],
    variableDescriptions: {
      name: "User's name",
      paymentUrl: 'Payment link with prefilled data',
    },
  },
  {
    key: 'abandoned_call_24h',
    name: 'Abandoned Call (24 Hours)',
    description: 'Email sent 24 hours after an abandoned AI call',
    category: 'recovery',
    emailSubject: `Still here to help with {{deceasedName}}'s estate`,
    emailHtml: wrap({
      preheader: `Your conversation is saved. Continue when you're ready — no pressure.`,
      body: `
${h(2, `Hi {{name}} — we're here when you're ready.`)}
${p(`Yesterday you started a conversation about <strong>{{deceasedName}}'s</strong> estate. We know this isn't easy, and there's no rush.`)}
${p(`Everything you shared is saved. When you're ready to continue, one tap brings it all back:`)}
${button('{{paymentUrl}}', 'Continue your intake')}
${mutedP(`Prefer to talk it through first? Reply to this email or call us at (604) 670-3534.`)}
${p(`— The ProbateDesk team`)}
`.trim(),
    }),
    smsBody: `ProbateDesk: We're here to help with {{deceasedName}}'s estate when you're ready. {{paymentUrl}}`,
    smsEnabled: true,
    availableVariables: ['name', 'deceasedName', 'paymentUrl'],
    variableDescriptions: {
      name: "User's name",
      deceasedName: "Deceased's name",
      paymentUrl: 'Payment link with prefilled data',
    },
  },
  {
    key: 'abandoned_call_3d',
    name: 'Abandoned Call (3 Days)',
    description: 'Final SMS sent 3 days after an abandoned AI call',
    category: 'recovery',
    emailSubject: 'Your intake is still waiting — ProbateDesk',
    emailHtml: wrap({
      preheader: `Your ProbateDesk intake is still saved. Finish in minutes, at your pace.`,
      body: `
${h(2, 'Your intake is still here.')}
${p(`Just a final note — your ProbateDesk intake is saved and ready for you. No pressure and no expiry.`)}
${button('{{paymentUrl}}', 'Complete your intake')}
${mutedP(`If ProbateDesk isn't the right fit right now, that's okay too — no further emails from us on this.`)}
${p(`— The ProbateDesk team`)}
`.trim(),
    }),
    smsBody: `Your ProbateDesk intake is still saved. Finish when you're ready: {{paymentUrl}}`,
    smsEnabled: true,
    availableVariables: ['paymentUrl'],
    variableDescriptions: {
      paymentUrl: 'Payment link with prefilled data',
    },
  },
  {
    key: 'payment_receipt',
    name: 'Payment Receipt',
    description: 'Sent immediately after a successful Stripe payment',
    category: 'transactional',
    emailSubject: 'Your ProbateDesk receipt',
    emailHtml: wrap({
      preheader: `Thank you for your payment — here's your receipt and what happens next.`,
      body: `
${h(2, 'Thank you for your payment.')}
${p(`We've received your payment and your account is fully unlocked. You can sign in to your portal anytime to start (or continue) the intake.`)}
${button('{{portalLink}}', 'Open my portal')}
${h(3, `What happens next`)}
${ol([
  'Sign in to your portal and finish the intake questions if you haven\'t already.',
  'We prepare your court-ready documents (typically within 3 business days).',
  `We notify you the moment everything is ready to mail or file.`,
])}
${mutedP(`A separate Stripe receipt with the official line items has also been sent to this email address.`)}
${p(`— The ProbateDesk team`)}
`.trim(),
    }),
    smsEnabled: false,
    availableVariables: ['portalLink'],
    variableDescriptions: {
      portalLink: 'Link to the user portal',
    },
  },
];

/**
 * Get a default template by key
 */
export function getDefaultTemplate(key: string): TemplateDefinition | undefined {
  return DEFAULT_TEMPLATES.find((t) => t.key === key);
}

/**
 * Get all template keys
 */
export function getAllTemplateKeys(): string[] {
  return DEFAULT_TEMPLATES.map((t) => t.key);
}

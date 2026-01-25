/**
 * Default Message Templates
 *
 * These are the hardcoded defaults used when:
 * 1. A template doesn't exist in the database yet
 * 2. Seeding the database with initial templates
 */

import type { TemplateDefinition } from './types';

export const DEFAULT_TEMPLATES: TemplateDefinition[] = [
  // ========================================
  // TRANSACTIONAL
  // ========================================
  {
    key: 'welcome',
    name: 'Welcome Email',
    description: 'Sent when a new user registers an account',
    category: 'transactional',
    emailSubject: 'Welcome to ProbateDesk',
    emailHtml: `
<p>Hi {{name}},</p>

<p>Your ProbateDesk account is ready.</p>

<p>When you're ready to begin, log in and start your intake. We'll walk you through every step of the BC probate process.</p>

<p><a href="{{portalLink}}" style="display: inline-block; background-color: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Go to your portal</a></p>

<p>If you have questions, reply to this email or call 604-670-3534.</p>

<p>Thanks,<br/>ProbateDesk</p>
    `.trim(),
    smsBody: 'Welcome to ProbateDesk! Your account is ready. Start your intake at {{portalLink}}',
    smsEnabled: false, // Optional - admin can enable
    availableVariables: ['name', 'portalLink'],
    variableDescriptions: {
      name: "User's name",
      portalLink: 'Link to the user portal'
    }
  },
  {
    key: 'intake_submitted',
    name: 'Intake Submitted',
    description: 'Sent when user completes the intake form',
    category: 'transactional',
    emailSubject: 'Your ProbateDesk draft is saved',
    emailHtml: `
<p>Hi there,</p>

<p>Your intake is submitted. We're preparing your documents.</p>

<p>You can resume your draft anytime using this link:</p>

<p><a href="{{resumeLink}}" style="display: inline-block; background-color: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Resume your draft</a></p>

<p>Or check your portal for updates:</p>

<p><a href="{{portalLink}}">{{portalLink}}</a></p>

<p>Thanks,<br/>ProbateDesk</p>
    `.trim(),
    smsBody: 'ProbateDesk: Your intake is submitted. We\'re preparing your documents. Check your portal: {{portalLink}}',
    smsEnabled: true,
    availableVariables: ['resumeLink', 'portalLink'],
    variableDescriptions: {
      resumeLink: 'Link to resume the draft',
      portalLink: 'Link to the user portal'
    }
  },
  {
    key: 'resume_token',
    name: 'Resume Token',
    description: 'Sent when user requests a link to resume their draft',
    category: 'transactional',
    emailSubject: 'Resume your ProbateDesk draft',
    emailHtml: `
<p>Hi there,</p>

<p>Click the link below to resume your draft:</p>

<p><a href="{{link}}" style="display: inline-block; background-color: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Resume your draft</a></p>

<p>This link expires in 24 hours.</p>

<p>Thanks,<br/>ProbateDesk</p>
    `.trim(),
    smsBody: 'ProbateDesk: Resume your draft anytime: {{link}}',
    smsEnabled: true,
    availableVariables: ['link'],
    variableDescriptions: {
      link: 'One-time link to resume the draft'
    }
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
    emailHtml: `
<p>Hi,</p>

<p>Your password reset code is:</p>

<p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1e3a5f;">{{code}}</p>

<p>This code expires in 10 minutes.</p>

<p>If you didn't request this, you can safely ignore this email.</p>

<p>Thanks,<br/>ProbateDesk</p>
    `.trim(),
    smsBody: undefined, // No SMS for security reasons
    smsEnabled: false,
    availableVariables: ['code'],
    variableDescriptions: {
      code: '6-digit password reset code'
    }
  },
  {
    key: 'magic_link',
    name: 'Magic Sign-in Link',
    description: 'Sent when user signs in via email',
    category: 'auth',
    emailSubject: 'Sign in to ProbateDesk',
    emailHtml: `
<p>Hi,</p>

<p>Click the link below to sign in to your ProbateDesk account:</p>

<p><a href="{{url}}" style="display: inline-block; background-color: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Sign in to ProbateDesk</a></p>

<p>This link expires in 10 minutes.</p>

<p>If you didn't request this, you can safely ignore this email.</p>

<p>Thanks,<br/>ProbateDesk</p>
    `.trim(),
    smsBody: undefined, // No SMS for security reasons
    smsEnabled: false,
    availableVariables: ['url'],
    variableDescriptions: {
      url: 'One-time sign-in link'
    }
  },

  // ========================================
  // REMINDERS
  // ========================================
  {
    key: 'generic_reminder',
    name: 'Generic Reminder',
    description: 'Sent for general scheduled reminders',
    category: 'reminder',
    emailSubject: 'ProbateDesk - Time for your next step',
    emailHtml: `
<p>Hi there,</p>

<p>It's time for your next step in the probate process.</p>

<p>Log in to your portal to see what's next:</p>

<p><a href="{{portalLink}}" style="display: inline-block; background-color: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Go to your portal</a></p>

<p>If you have questions, reply to this email or call 604-670-3534.</p>

<p>Thanks,<br/>ProbateDesk</p>
    `.trim(),
    smsBody: 'ProbateDesk: It\'s time for your next step. Log in at {{portalLink}}',
    smsEnabled: true,
    availableVariables: ['portalLink'],
    variableDescriptions: {
      portalLink: 'Link to the user portal'
    }
  },
  {
    key: 'packet_ready',
    name: 'Packet Ready',
    description: 'Sent when will search packet is ready',
    category: 'reminder',
    emailSubject: 'Your ProbateDesk packet is ready',
    emailHtml: `
<p>Hi there,</p>

<p>Your ProbateDesk will search packet is ready!</p>

<p>Log in to your portal to download it and see the next steps:</p>

<p><a href="{{portalLink}}" style="display: inline-block; background-color: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Go to your portal</a></p>

<p>Thanks,<br/>ProbateDesk</p>
    `.trim(),
    smsBody: 'ProbateDesk: Your packet is ready! Log in at {{portalLink}}',
    smsEnabled: true,
    availableVariables: ['portalLink'],
    variableDescriptions: {
      portalLink: 'Link to the user portal'
    }
  },
  {
    key: 'probate_package_ready',
    name: 'Probate Package Ready',
    description: 'Sent when probate filing package is ready',
    category: 'reminder',
    emailSubject: 'Your probate filing package is ready',
    emailHtml: `
<p>Hi there,</p>

<p>Your probate filing package is ready!</p>

<p>Here's what you need to do:</p>
<ol>
  <li>Download your documents</li>
  <li>Review and sign where indicated</li>
  <li>Get documents notarized (where required)</li>
  <li>File at the court registry</li>
</ol>

<p>Log in for full instructions and your documents:</p>

<p><a href="{{portalLink}}" style="display: inline-block; background-color: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Go to your portal</a></p>

<p>Thanks,<br/>ProbateDesk</p>
    `.trim(),
    smsBody: 'ProbateDesk: Your probate filing package is ready. Log in at {{portalLink}}',
    smsEnabled: true,
    availableVariables: ['portalLink'],
    variableDescriptions: {
      portalLink: 'Link to the user portal'
    }
  },
  {
    key: 'probate_filing_ready',
    name: 'Probate Filing Ready',
    description: 'Sent when all probate forms are generated and ready for filing',
    category: 'reminder',
    emailSubject: 'Your ProbateDesk filing packet is ready',
    emailHtml: `
<p>Hi there,</p>

<p>Your filing packet is ready!</p>

<p>We've prepared all the forms you need. Here's what happens next:</p>
<ol>
  <li>Download and print your documents</li>
  <li>Sign where indicated</li>
  <li>Get your signature witnessed/notarized</li>
  <li>File at the BC Supreme Court registry</li>
</ol>

<p>Log in for your complete filing instructions:</p>

<p><a href="{{portalLink}}" style="display: inline-block; background-color: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Go to your portal</a></p>

<p>Thanks,<br/>ProbateDesk</p>
    `.trim(),
    smsBody: 'ProbateDesk: Your filing packet is ready. Log in at {{portalLink}}',
    smsEnabled: true,
    availableVariables: ['portalLink'],
    variableDescriptions: {
      portalLink: 'Link to the user portal'
    }
  },
  {
    key: 'grant_checkin',
    name: 'Grant Check-in',
    description: 'Periodic check-in for cases waiting on court grant',
    category: 'reminder',
    emailSubject: 'ProbateDesk - Quick check-in on your grant',
    emailHtml: `
<p>Hi {{name}},</p>

<p>We wanted to check in on your probate application.</p>

<p><strong>Have you received your grant of probate yet?</strong></p>

<p>If you have, please log in and let us know! We'll help you with the next steps.</p>

<p>If you're still waiting, that's completely normal. BC courts typically take 6-12 weeks to process applications.</p>

<p><a href="{{portalLink}}" style="display: inline-block; background-color: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Update your status</a></p>

<p>Reply to this email if you have any questions.</p>

<p>Thanks,<br/>ProbateDesk</p>
    `.trim(),
    smsBody: 'ProbateDesk: Have you received your estate grant yet? Log in at {{portalLink}} or reply to this text.',
    smsEnabled: true,
    availableVariables: ['name', 'portalLink'],
    variableDescriptions: {
      name: "User's name",
      portalLink: 'Link to the user portal'
    }
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
    emailHtml: `
<p>Hi {{name}},</p>

<p>We noticed you didn't finish your call. No worries - your progress is saved!</p>

<p>Ready to continue? Click below:</p>

<p><a href="{{paymentUrl}}" style="display: inline-block; background-color: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Continue where you left off</a></p>

<p>Thanks,<br/>ProbateDesk</p>
    `.trim(),
    smsBody: 'Hey {{name}}, we noticed you didn\'t finish your ProbateDesk call. Ready to continue? {{paymentUrl}}',
    smsEnabled: true, // Primary channel is SMS
    availableVariables: ['name', 'paymentUrl'],
    variableDescriptions: {
      name: "User's name",
      paymentUrl: 'Payment link with prefilled data'
    }
  },
  {
    key: 'abandoned_call_24h',
    name: 'Abandoned Call (24 Hours)',
    description: 'Email sent 24 hours after an abandoned AI call',
    category: 'recovery',
    emailSubject: 'Your probate questions - let\'s continue',
    emailHtml: `
<p>Hi {{name}},</p>

<p>Yesterday you started a conversation about {{deceasedName}}'s estate. We're here to help you through the probate process.</p>

<p>Your information is saved and ready for you to continue.</p>

<p><a href="{{paymentUrl}}" style="display: inline-block; background-color: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Continue your intake</a></p>

<p>Questions? Reply to this email or call us at 604-670-3534.</p>

<p>Thanks,<br/>ProbateDesk</p>
    `.trim(),
    smsBody: 'ProbateDesk: We\'re here to help with {{deceasedName}}\'s estate. Continue: {{paymentUrl}}',
    smsEnabled: true, // Adding SMS
    availableVariables: ['name', 'deceasedName', 'paymentUrl'],
    variableDescriptions: {
      name: "User's name",
      deceasedName: "Deceased's name",
      paymentUrl: 'Payment link with prefilled data'
    }
  },
  {
    key: 'abandoned_call_3d',
    name: 'Abandoned Call (3 Days)',
    description: 'Final SMS sent 3 days after an abandoned AI call',
    category: 'recovery',
    emailSubject: 'Last reminder: Your ProbateDesk intake',
    emailHtml: `
<p>Hi there,</p>

<p>This is a final reminder that your ProbateDesk intake is saved and waiting for you.</p>

<p>Finish in minutes:</p>

<p><a href="{{paymentUrl}}" style="display: inline-block; background-color: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Complete your intake</a></p>

<p>Thanks,<br/>ProbateDesk</p>
    `.trim(),
    smsBody: 'Last reminder: Your ProbateDesk intake is still saved. Finish in minutes: {{paymentUrl}}',
    smsEnabled: true, // Primary channel is SMS
    availableVariables: ['paymentUrl'],
    variableDescriptions: {
      paymentUrl: 'Payment link with prefilled data'
    }
  },
];

/**
 * Get a default template by key
 */
export function getDefaultTemplate(key: string): TemplateDefinition | undefined {
  return DEFAULT_TEMPLATES.find(t => t.key === key);
}

/**
 * Get all template keys
 */
export function getAllTemplateKeys(): string[] {
  return DEFAULT_TEMPLATES.map(t => t.key);
}

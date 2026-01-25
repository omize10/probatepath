/**
 * Unified Messaging Service
 *
 * Central service for sending all emails and SMS messages.
 * Fetches templates from database (falls back to defaults).
 * Handles variable replacement, sending, and logging.
 */

import "server-only";
import { Prisma } from "@prisma/client";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { sendTemplateEmail, logEmail } from "@/lib/email";
import { sendSMS, logSms } from "@/lib/sms";
import { getDefaultTemplate } from "./default-templates";
import type { SendMessageOptions, SendResult, TemplatePreview } from "./types";

/**
 * Send a message using a template
 *
 * @param options - The message options
 * @returns Result with email and SMS send status
 *
 * @example
 * ```ts
 * await sendMessage({
 *   templateKey: 'packet_ready',
 *   to: { email: 'user@example.com', phone: '604-555-1234' },
 *   variables: { portalLink: 'https://probatedesk.com/portal' },
 *   matterId: 'matter_123',
 * });
 * ```
 */
export async function sendMessage(options: SendMessageOptions): Promise<SendResult> {
  const { templateKey, to, variables, matterId, meta } = options;

  console.log(`[messaging] Sending message:`, { templateKey, to, matterId });

  // 1. Fetch template (DB or default)
  const template = await getTemplate(templateKey);
  if (!template) {
    console.error(`[messaging] Template not found: ${templateKey}`);
    return {
      email: { success: false, error: `Template not found: ${templateKey}` },
      sms: { success: false, error: `Template not found: ${templateKey}` },
    };
  }

  // 2. Replace variables in content
  const emailSubject = replaceVariables(template.emailSubject, variables);
  const emailHtml = replaceVariables(template.emailHtml, variables);
  const smsBody = template.smsBody ? replaceVariables(template.smsBody, variables) : null;

  const result: SendResult = {};

  // 3. Send email if address provided
  if (to.email) {
    try {
      const emailResult = await sendTemplateEmail({
        to: to.email,
        subject: emailSubject,
        html: emailHtml,
        template: templateKey,
        matterId,
        meta: meta as Prisma.InputJsonValue | null,
      });
      result.email = emailResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`[messaging] Email error:`, errorMessage);
      result.email = { success: false, error: errorMessage };
    }
  }

  // 4. Send SMS if enabled and phone provided
  if (to.phone && template.smsEnabled && smsBody) {
    try {
      const smsResult = await sendSMS({ to: to.phone, body: smsBody });
      result.sms = smsResult;

      // Log SMS to database
      await logSms({
        to: to.phone,
        body: smsBody,
        templateKey,
        matterId,
        status: smsResult.success ? "sent" : "failed",
        twilioSid: smsResult.sid,
        errorMessage: smsResult.error,
        meta: meta as Record<string, unknown> | undefined,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`[messaging] SMS error:`, errorMessage);
      result.sms = { success: false, error: errorMessage };
    }
  } else if (to.phone && !template.smsEnabled) {
    console.log(`[messaging] SMS disabled for template: ${templateKey}`);
  } else if (!to.phone && template.smsEnabled) {
    console.log(`[messaging] No phone provided for SMS-enabled template: ${templateKey}`);
  }

  console.log(`[messaging] Message sent:`, { templateKey, result });
  return result;
}

/**
 * Get a template from the database, falling back to defaults
 */
interface TemplateData {
  key: string;
  name: string;
  emailSubject: string;
  emailHtml: string;
  emailPlainText?: string | null;
  smsBody?: string | null;
  smsEnabled: boolean;
  availableVariables: unknown;
  variableDescriptions: unknown;
}

async function getTemplate(key: string): Promise<TemplateData | null> {
  // Try database first (if enabled)
  if (prismaEnabled) {
    try {
      const dbTemplate = await prisma.messageTemplate.findUnique({
        where: { key, active: true },
      });

      if (dbTemplate) {
        return {
          key: dbTemplate.key,
          name: dbTemplate.name,
          emailSubject: dbTemplate.emailSubject,
          emailHtml: dbTemplate.emailHtml,
          emailPlainText: dbTemplate.emailPlainText,
          smsBody: dbTemplate.smsBody,
          smsEnabled: dbTemplate.smsEnabled,
          availableVariables: dbTemplate.availableVariables,
          variableDescriptions: dbTemplate.variableDescriptions,
        };
      }
    } catch (error) {
      console.warn(`[messaging] Failed to fetch template from DB, using default:`, error);
    }
  }

  // Fall back to hardcoded defaults
  const defaultTemplate = getDefaultTemplate(key);
  if (defaultTemplate) {
    return {
      key: defaultTemplate.key,
      name: defaultTemplate.name,
      emailSubject: defaultTemplate.emailSubject,
      emailHtml: defaultTemplate.emailHtml,
      emailPlainText: defaultTemplate.emailPlainText,
      smsBody: defaultTemplate.smsBody,
      smsEnabled: defaultTemplate.smsEnabled,
      availableVariables: defaultTemplate.availableVariables,
      variableDescriptions: defaultTemplate.variableDescriptions,
    };
  }

  return null;
}

/**
 * Replace {{variables}} in a template string
 */
function replaceVariables(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] ?? match;
  });
}

/**
 * Preview a template with sample variables
 */
export async function previewTemplate(
  templateKey: string,
  variables: Record<string, string>
): Promise<TemplatePreview | null> {
  const template = await getTemplate(templateKey);
  if (!template) {
    return null;
  }

  return {
    emailSubject: replaceVariables(template.emailSubject, variables),
    emailHtml: replaceVariables(template.emailHtml, variables),
    emailPlainText: template.emailPlainText
      ? replaceVariables(template.emailPlainText, variables)
      : undefined,
    smsBody: template.smsBody ? replaceVariables(template.smsBody, variables) : undefined,
  };
}

/**
 * Get all templates (from DB if available, otherwise defaults)
 */
export async function getAllTemplates(): Promise<TemplateData[]> {
  const defaultTemplates = await import("./default-templates").then((m) => m.DEFAULT_TEMPLATES);

  if (!prismaEnabled) {
    return defaultTemplates.map((t) => ({
      key: t.key,
      name: t.name,
      emailSubject: t.emailSubject,
      emailHtml: t.emailHtml,
      emailPlainText: t.emailPlainText,
      smsBody: t.smsBody,
      smsEnabled: t.smsEnabled,
      availableVariables: t.availableVariables,
      variableDescriptions: t.variableDescriptions,
    }));
  }

  // Get DB templates
  const dbTemplates = await prisma.messageTemplate.findMany({
    where: { active: true },
    orderBy: { key: "asc" },
  });

  // Merge: DB templates override defaults
  const dbTemplateMap = new Map(dbTemplates.map((t) => [t.key, t]));

  return defaultTemplates.map((defaultT) => {
    const dbT = dbTemplateMap.get(defaultT.key);
    if (dbT) {
      return {
        key: dbT.key,
        name: dbT.name,
        emailSubject: dbT.emailSubject,
        emailHtml: dbT.emailHtml,
        emailPlainText: dbT.emailPlainText,
        smsBody: dbT.smsBody,
        smsEnabled: dbT.smsEnabled,
        availableVariables: dbT.availableVariables,
        variableDescriptions: dbT.variableDescriptions,
      };
    }
    return {
      key: defaultT.key,
      name: defaultT.name,
      emailSubject: defaultT.emailSubject,
      emailHtml: defaultT.emailHtml,
      emailPlainText: defaultT.emailPlainText,
      smsBody: defaultT.smsBody,
      smsEnabled: defaultT.smsEnabled,
      availableVariables: defaultT.availableVariables,
      variableDescriptions: defaultT.variableDescriptions,
    };
  });
}

/**
 * Update or create a template in the database
 */
export async function upsertTemplate(
  key: string,
  data: Partial<{
    name: string;
    description: string;
    category: string;
    emailSubject: string;
    emailHtml: string;
    emailPlainText: string | null;
    smsBody: string | null;
    smsEnabled: boolean;
    availableVariables: string[];
    variableDescriptions: Record<string, string>;
    active: boolean;
  }>
): Promise<TemplateData | null> {
  if (!prismaEnabled) {
    console.warn("[messaging] Cannot upsert template: Prisma not enabled");
    return null;
  }

  // Get default template for fallback values
  const defaultTemplate = getDefaultTemplate(key);
  if (!defaultTemplate) {
    console.error(`[messaging] Unknown template key: ${key}`);
    return null;
  }

  const template = await prisma.messageTemplate.upsert({
    where: { key },
    create: {
      key,
      name: data.name ?? defaultTemplate.name,
      description: data.description ?? defaultTemplate.description,
      category: data.category ?? defaultTemplate.category,
      emailSubject: data.emailSubject ?? defaultTemplate.emailSubject,
      emailHtml: data.emailHtml ?? defaultTemplate.emailHtml,
      emailPlainText: data.emailPlainText ?? defaultTemplate.emailPlainText,
      smsBody: data.smsBody ?? defaultTemplate.smsBody,
      smsEnabled: data.smsEnabled ?? defaultTemplate.smsEnabled,
      availableVariables: data.availableVariables ?? defaultTemplate.availableVariables,
      variableDescriptions: data.variableDescriptions ?? defaultTemplate.variableDescriptions,
      active: data.active ?? true,
    },
    update: {
      name: data.name,
      description: data.description,
      category: data.category,
      emailSubject: data.emailSubject,
      emailHtml: data.emailHtml,
      emailPlainText: data.emailPlainText,
      smsBody: data.smsBody,
      smsEnabled: data.smsEnabled,
      availableVariables: data.availableVariables,
      variableDescriptions: data.variableDescriptions,
      active: data.active,
      updatedAt: new Date(),
    },
  });

  return {
    key: template.key,
    name: template.name,
    emailSubject: template.emailSubject,
    emailHtml: template.emailHtml,
    emailPlainText: template.emailPlainText,
    smsBody: template.smsBody,
    smsEnabled: template.smsEnabled,
    availableVariables: template.availableVariables,
    variableDescriptions: template.variableDescriptions,
  };
}

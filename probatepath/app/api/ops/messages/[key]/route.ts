import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma, prismaEnabled } from "@/lib/prisma";
import { upsertTemplate } from "@/lib/messaging/service";
import { getDefaultTemplate, DEFAULT_TEMPLATES } from "@/lib/messaging/default-templates";
import { z } from "zod";

/**
 * Check ops authentication
 */
async function requireOpsAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("ops_auth")?.value === "1";
}

/**
 * GET /api/ops/messages/[key] - Get a single template
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  if (!(await requireOpsAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;

  try {
    // Try database first
    let template = null;
    if (prismaEnabled) {
      template = await prisma.messageTemplate.findUnique({
        where: { key },
      });
    }

    // Fall back to defaults
    const defaultTemplate = getDefaultTemplate(key);

    if (!template && !defaultTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Merge DB with defaults
    const result = template
      ? {
          key: template.key,
          name: template.name,
          description: template.description ?? defaultTemplate?.description,
          category: template.category ?? defaultTemplate?.category,
          emailSubject: template.emailSubject,
          emailHtml: template.emailHtml,
          emailPlainText: template.emailPlainText,
          smsBody: template.smsBody,
          smsEnabled: template.smsEnabled,
          availableVariables: template.availableVariables ?? defaultTemplate?.availableVariables,
          variableDescriptions: template.variableDescriptions ?? defaultTemplate?.variableDescriptions,
          active: template.active,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
          isCustomized: true,
        }
      : {
          key: defaultTemplate!.key,
          name: defaultTemplate!.name,
          description: defaultTemplate!.description,
          category: defaultTemplate!.category,
          emailSubject: defaultTemplate!.emailSubject,
          emailHtml: defaultTemplate!.emailHtml,
          emailPlainText: defaultTemplate!.emailPlainText,
          smsBody: defaultTemplate!.smsBody,
          smsEnabled: defaultTemplate!.smsEnabled,
          availableVariables: defaultTemplate!.availableVariables,
          variableDescriptions: defaultTemplate!.variableDescriptions,
          active: true,
          isCustomized: false,
        };

    return NextResponse.json({ template: result });
  } catch (error) {
    console.error("[api/ops/messages/[key]] Error fetching template:", error);
    return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 });
  }
}

const UpdateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.enum(["transactional", "reminder", "recovery", "auth"]).optional(),
  emailSubject: z.string().min(1).optional(),
  emailHtml: z.string().min(1).optional(),
  emailPlainText: z.string().optional(),
  smsBody: z.string().optional().nullable(),
  smsEnabled: z.boolean().optional(),
  active: z.boolean().optional(),
});

/**
 * PUT /api/ops/messages/[key] - Update a template
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  if (!(await requireOpsAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;

  // Verify template key exists in defaults
  const defaultTemplate = DEFAULT_TEMPLATES.find((t) => t.key === key);
  if (!defaultTemplate) {
    return NextResponse.json({ error: "Unknown template key" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = UpdateTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const template = await upsertTemplate(key, parsed.data);

    if (!template) {
      return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("[api/ops/messages/[key]] Error updating template:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

/**
 * DELETE /api/ops/messages/[key] - Soft delete (set active=false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  if (!(await requireOpsAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;

  if (!prismaEnabled) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    // Only soft-delete if it exists in DB (otherwise it's just using defaults)
    const existing = await prisma.messageTemplate.findUnique({ where: { key } });
    if (!existing) {
      return NextResponse.json({ error: "Template not customized, nothing to delete" }, { status: 404 });
    }

    await prisma.messageTemplate.update({
      where: { key },
      data: { active: false },
    });

    return NextResponse.json({ success: true, message: "Template deactivated" });
  } catch (error) {
    console.error("[api/ops/messages/[key]] Error deleting template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}

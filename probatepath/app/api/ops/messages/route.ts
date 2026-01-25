import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllTemplates, upsertTemplate } from "@/lib/messaging/service";
import { DEFAULT_TEMPLATES } from "@/lib/messaging/default-templates";
import { z } from "zod";

/**
 * Check ops authentication
 */
async function requireOpsAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("ops_auth")?.value === "1";
}

/**
 * GET /api/ops/messages - List all templates
 */
export async function GET() {
  if (!(await requireOpsAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const templates = await getAllTemplates();

    // Add metadata from defaults
    const templatesWithMeta = templates.map((t) => {
      const defaultT = DEFAULT_TEMPLATES.find((d) => d.key === t.key);
      return {
        ...t,
        description: defaultT?.description,
        category: defaultT?.category,
      };
    });

    return NextResponse.json({ templates: templatesWithMeta });
  } catch (error) {
    console.error("[api/ops/messages] Error fetching templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

const CreateTemplateSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.enum(["transactional", "reminder", "recovery", "auth"]).optional(),
  emailSubject: z.string().min(1).optional(),
  emailHtml: z.string().min(1).optional(),
  emailPlainText: z.string().optional(),
  smsBody: z.string().optional(),
  smsEnabled: z.boolean().optional(),
});

/**
 * POST /api/ops/messages - Create/update a template
 */
export async function POST(request: Request) {
  if (!(await requireOpsAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = CreateTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { key, ...data } = parsed.data;
    const template = await upsertTemplate(key, data);

    if (!template) {
      return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("[api/ops/messages] Error creating template:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

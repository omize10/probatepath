import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { previewTemplate } from "@/lib/messaging/service";
import { z } from "zod";

/**
 * Check ops authentication
 */
async function requireOpsAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("ops_auth")?.value === "1";
}

const PreviewSchema = z.object({
  key: z.string().min(1),
  variables: z.record(z.string(), z.string()).optional(),
});

/**
 * POST /api/ops/messages/preview - Preview a template with variables
 */
export async function POST(request: Request) {
  if (!(await requireOpsAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = PreviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { key, variables } = parsed.data;
    const preview = await previewTemplate(key, variables || {});

    if (!preview) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ preview });
  } catch (error) {
    console.error("[api/ops/messages/preview] Error:", error);
    return NextResponse.json({ error: "Failed to preview template" }, { status: 500 });
  }
}

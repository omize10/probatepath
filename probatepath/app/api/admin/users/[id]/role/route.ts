import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { roleBody } from "@/lib/admin/schemas";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, context: any) {
  const maybe = await requireAdminSession();
  if ((maybe as unknown as Response)?.status === 403) return maybe as unknown as Response;
  const { session } = maybe as { session: any };

  try {
    const body = await request.json();
    const parsed = roleBody.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

    const targetId = context?.params?.id ?? (await context.params)?.id;
    const updated = await prisma.user.update({ where: { id: targetId }, data: { role: parsed.data.role } });

    await prisma.auditLog.create({
      data: {
        userId: session.user?.id ?? null,
        action: "admin.set_role",
        meta: { targetUserId: targetId, role: parsed.data.role },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin] Failed to update role", error);
    return NextResponse.json({ error: "Unable to update role" }, { status: 500 });
  }
}

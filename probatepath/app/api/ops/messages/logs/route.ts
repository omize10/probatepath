import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma, prismaEnabled } from "@/lib/prisma";

/**
 * Check ops authentication
 */
async function requireOpsAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("ops_auth")?.value === "1";
}

/**
 * GET /api/ops/messages/logs - Get message logs
 *
 * Query params:
 * - type: "email" | "sms" | "all" (default: "all")
 * - templateKey: filter by template
 * - status: filter by status
 * - matterId: filter by matter
 * - from: start date (ISO string)
 * - to: end date (ISO string)
 * - page: page number (default: 1)
 * - limit: items per page (default: 50)
 */
export async function GET(request: NextRequest) {
  if (!(await requireOpsAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!prismaEnabled) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "all";
  const templateKey = searchParams.get("templateKey");
  const status = searchParams.get("status");
  const matterId = searchParams.get("matterId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
  const skip = (page - 1) * limit;

  try {
    const dateFilter = {
      ...(from && { gte: new Date(from) }),
      ...(to && { lte: new Date(to) }),
    };

    const logs: Array<{
      id: string;
      type: "email" | "sms";
      to: string;
      subject?: string;
      body?: string;
      templateKey?: string;
      status?: string;
      matterId?: string | null;
      createdAt: Date;
      meta?: unknown;
    }> = [];

    // Fetch email logs
    if (type === "all" || type === "email") {
      const emailWhere = {
        ...(templateKey && { template: templateKey }),
        ...(matterId && { matterId }),
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      };

      const emailLogs = await prisma.emailLog.findMany({
        where: emailWhere,
        orderBy: { createdAt: "desc" },
        take: type === "all" ? Math.ceil(limit / 2) : limit,
        skip: type === "all" ? 0 : skip,
      });

      logs.push(
        ...emailLogs.map((log) => ({
          id: log.id,
          type: "email" as const,
          to: log.to,
          subject: log.subject,
          templateKey: log.template,
          status: (log.meta as Record<string, unknown>)?.sent === false ? "failed" : "sent",
          matterId: log.matterId,
          createdAt: log.createdAt,
          meta: log.meta,
        }))
      );
    }

    // Fetch SMS logs
    if (type === "all" || type === "sms") {
      const smsWhere = {
        ...(templateKey && { templateKey }),
        ...(status && { status }),
        ...(matterId && { matterId }),
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      };

      const smsLogs = await prisma.smsLog.findMany({
        where: smsWhere,
        orderBy: { createdAt: "desc" },
        take: type === "all" ? Math.ceil(limit / 2) : limit,
        skip: type === "all" ? 0 : skip,
      });

      logs.push(
        ...smsLogs.map((log) => ({
          id: log.id,
          type: "sms" as const,
          to: log.to,
          body: log.body,
          templateKey: log.templateKey || undefined,
          status: log.status,
          matterId: log.matterId,
          createdAt: log.createdAt,
          meta: log.meta,
        }))
      );
    }

    // Sort combined logs by date
    logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Get total counts
    const [emailCount, smsCount] = await Promise.all([
      type === "all" || type === "email"
        ? prisma.emailLog.count({
            where: {
              ...(templateKey && { template: templateKey }),
              ...(matterId && { matterId }),
              ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
            },
          })
        : 0,
      type === "all" || type === "sms"
        ? prisma.smsLog.count({
            where: {
              ...(templateKey && { templateKey }),
              ...(status && { status }),
              ...(matterId && { matterId }),
              ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
            },
          })
        : 0,
    ]);

    const totalCount = emailCount + smsCount;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      logs: logs.slice(0, limit),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
      counts: {
        email: emailCount,
        sms: smsCount,
      },
    });
  } catch (error) {
    console.error("[api/ops/messages/logs] Error:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

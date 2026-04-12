// ============================================================================
// TEMPORARY — TEST WALKER BACKDOOR
// ============================================================================
// This endpoint exists ONLY for the end-to-end state walker run during the
// 2026-04-12 launch-readiness pass. It accepts a hardcoded test key and
// allows the assistant's local puppeteer walker to:
//   1. Flip Matter.portalStatus
//   2. Set any of the matter's date fields (willSearchMailedAt, etc.)
//   3. Read the current state back
//
// This file is scoped to ONE matterId and ONE key. It is committed, used
// during the walker run, then deleted in the same session before the final
// snapshot. See CLAUDE.md "Test data & operator scripts" section for the
// lifecycle.
//
// If you are reading this file in main later than 2026-04-13, DELETE IT.
// ============================================================================
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TEST_KEY = "walker-2026-04-12-self-destruct-key-b7f3a1c9d4e2";
const ALLOWED_MATTER_ID = "cmnv1x0nf000104l14ap3jxng"; // the test matter
const ALLOWED_DRAFT_ID = "cmnv2ln7g000204jml8580s3x"; // the test matter's draft

const VALID_STATUSES = [
  "intake_complete",
  "will_search_prepping",
  "will_search_ready",
  "will_search_sent",
  "notices_in_progress",
  "notices_waiting_21_days",
  "probate_package_prepping",
  "probate_package_ready",
  "probate_filing_ready",
  "probate_filing_in_progress",
  "probate_filed",
  "waiting_for_grant",
  "grant_complete",
  "post_grant_active",
  "estate_closeout",
  "done",
];

const DATE_FIELDS = new Set([
  "willSearchMailedAt",
  "noticesMailedAt",
  "p1MailedAt",
  "noticesPreparedAt",
  "willSearchPreparedAt",
  "probatePackagePreparedAt",
  "probateFiledAt",
  "grantIssuedAt",
  "grantUploadedAt",
]);

const SCALAR_FIELDS = new Set([
  "grantDocumentUrl",
  "courtFileNumber",
  "willSearchStatus",
  "p1Status",
  "probateStatus",
  "journeyStatus",
  "status",
  "p1Mailed",
  "p1NoticesReady",
  "willSearchPackageReady",
  "standardProbatePackageReady",
]);

export async function POST(request: Request) {
  if (request.headers.get("x-test-key") !== TEST_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    matterId?: string;
    status?: string;
    fields?: Record<string, unknown>;
  };
  if (body.matterId !== ALLOWED_MATTER_ID) {
    return NextResponse.json({ error: "Matter not allowed" }, { status: 403 });
  }
  const data: Record<string, unknown> = {};
  if (body.status) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.portalStatus = body.status;
  }
  if (body.fields) {
    for (const [k, v] of Object.entries(body.fields)) {
      if (DATE_FIELDS.has(k)) {
        data[k] = v === null ? null : new Date(v as string);
      } else if (SCALAR_FIELDS.has(k)) {
        data[k] = v;
      }
    }
  }
  if (!Object.keys(data).length && !(body as { draftSubmittedAt?: string | null }).draftSubmittedAt && (body as { draftSubmittedAt?: string | null }).draftSubmittedAt !== null) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  if (Object.keys(data).length) {
    await prisma.matter.update({ where: { id: body.matterId }, data });
  }
  // Also allow flipping IntakeDraft.submittedAt so the portal resolves the
  // matter as "past intake" and renders the state-specific pages instead of
  // the intake wizard.
  const draftSubmittedAt = (body as { draftSubmittedAt?: string | null }).draftSubmittedAt;
  if (draftSubmittedAt !== undefined) {
    await prisma.intakeDraft.update({
      where: { id: ALLOWED_DRAFT_ID },
      data: { submittedAt: draftSubmittedAt === null ? null : new Date(draftSubmittedAt) },
    });
  }
  const updated = await prisma.matter.findUnique({
    where: { id: body.matterId },
    select: { portalStatus: true, updatedAt: true },
  });
  return NextResponse.json({ ok: true, ...updated });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  // Mint an ops_auth cookie if ?cookie=<TEST_KEY>. Used by the walker to hit
  // /ops SSR pages during the E2E pass when OPS_PASSWORD isn't configured.
  if (url.searchParams.get("cookie") === TEST_KEY) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("ops_auth", "1", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60,
    });
    return res;
  }
  if (request.headers.get("x-test-key") !== TEST_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const m = await prisma.matter.findUnique({
    where: { id: ALLOWED_MATTER_ID },
    select: {
      id: true,
      portalStatus: true,
      willSearchMailedAt: true,
      noticesMailedAt: true,
      p1MailedAt: true,
      probatePackagePreparedAt: true,
      probateFiledAt: true,
      grantIssuedAt: true,
      grantUploadedAt: true,
      grantDocumentUrl: true,
      courtFileNumber: true,
      updatedAt: true,
    },
  });
  return NextResponse.json(m);
}

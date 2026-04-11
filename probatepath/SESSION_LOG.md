# ProbateDesk Launch-Readiness Session Log

**Started:** 2026-04-11
**Goal:** Full system audit, fix, build missing pieces, end-to-end test, launch-ready.

## Phase 1 — Recon
- Confirmed real Next.js app at `/workspaces/probatepath/probatepath/` (top-level is a Puck/editor shim).
- Env vars present in nested `.env`: Resend, Anthropic, Supabase, Twilio, Retell, Google OAuth, Azure AD, Google Vision, GitHub PAT, NextAuth, DB URL, CRON_SECRET, APP_URL.
- Agent teams flag enabled (CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS).

## Findings

### Auth / Portal / Ops (agent A)
**BLOCKERS**
- `app/api/ops-auth/route.ts:3` — OPS_PASSWORD fallback `"123"` if env missing
- `components/portal/PortalClient.tsx:79-144` — switch missing case for `notices_in_progress`; falls through to wrong UI
- `components/portal/PortalClient.tsx:90` — duplicate ternary, both branches same URL
- `app/api/ops/dev/set-status/route.ts` — unprotected dev endpoint, anyone can rewrite case status

**CRITICAL**
- `app/api/auth/register/route.ts:64-70` — welcome email send is `.catch()` swallowed; user account created even if email fails
- `app/api/ops/cases/[matterId]/route.ts:11` — DELETE only protected by single cookie, no rate limit
- `app/api/ops/callbacks/[id]/status/route.ts:26-29` — unsafe role cast; if NextAuth omits role, auth bypass risk
- `app/api/auth/login/route.ts` + `lib/auth/index.ts` — split auth (custom login coexists with NextAuth); OAuth bypasses audit log

**MAJOR**
- `lib/auth/index.ts:334-352` — OAuth errors swallowed, generic 401 to client
- `PortalClient.tsx:58` — possible null `matter` crash when `empty=false`

### Intake / Forms / Will OCR (agent B)
**CRITICAL**
- `components/intake/matter-intake-wizard.tsx:224-346` — three steps defined in `portalSteps` but **no renderStep case** and **no validators**: `will-issues`, `notice-minors`, `notice-review`. Users physically cannot complete intake.

**MAJOR**
- `lib/intake/portal/steps.ts:74` — no dedicated red-flag capture step; `special-prior` only asks about prior grants/disputes

**MINOR**
- `app/api/forms/generated/[formId]/[matterId]/route.ts:64` — `transformEstateData()` called but not imported/defined
- `lib/forms-new/integration.ts:92` — validation warns rather than errors on missing secondary data

**OK**
- Will upload → Supabase → OCR → Claude → WillExtraction pipeline fully wired
- All 46 P-form generators present in `lib/forms-new/generators/`
- `mapToEstateData()` covers full intake payload
- Autosave + step validation working

### Email / Cron / Retell / Payments (agent C)
**CRITICAL**
- `lib/email.ts:7` — fallback from `"notifications@example.com"` if `RESEND_FROM` unset
- env var name mismatch: `lib/email.ts` reads `RESEND_FROM`, `lib/email/resend.ts` reads `MAIL_FROM`
- `lib/retell/verify.ts:19-26` — if `RETELL_API_KEY` unset, signature verify can pass (dev fallback leaks to prod)
- `lib/reminders.ts:51-70` — `sendReminder()` doesn't validate template exists before send

**MAJOR**
- `app/api/cron/daily:8-11` — CRON_SECRET check is *conditional*: `if (secret && authHeader…)` — bypassable when env unset
- `app/api/retell/webhook` — no replay protection / no idempotency on `call_ended`
- `lib/retell/recovery.ts:62-84` — 1h abandoned-call SMS may not fire if no PaymentToken pre-created

**INTENTIONAL / NOT A BUG**
- No Stripe — payments are deliberately manual per recent commit "Remove beta wall". Card capture stores last4 only by design. Will NOT build Stripe; not in scope.

**OK**
- 14 message templates exist in `lib/messaging/default-templates.ts`
- All Retell webhook handlers (call_started, call_ended) wired with status mapping + fallback lookup
- Cron processes due reminders + abandoned-call recovery + grant check-ins
- Welcome / intake_submitted / packet_ready / probate_package_ready / probate_filing_ready / grant_checkin / generic_reminder / abandoned_call_*h all defined

## Punch List
(blocker / critical / major / minor — filled in after recon)

## Fixes Applied
(running log)

## Tests Run
- ✅ `npm run typecheck` — my edits clean (297 pre-existing errors in lib/forms-new; `next.config.ts` has `ignoreBuildErrors: true`)
- ✅ `npm run build` — exit 0
- ✅ Resend delivery (v1, generic): 14/14 templates sent to omarkebrahim@gmail.com from `ProbateDesk <no-reply@probatedesk.com>` — domain IS verified
- ✅ Resend delivery (v2, rebranded): 14/14 templates re-sent with new brand shell — website-matched design
- ✅ Production E2E via Playwright (probatedesk.com): `/` → `/onboard/executor` → `/onboard/relationship` → `/onboard/email` → `/onboard/call-choice` → `/onboard/screening` (7 questions) → `/onboard/result` → `/onboard/create-account` → `/pay?tier=premium` → `/portal/schedule`. Account creation against prod DB works.
- ✅ Production runtime errors (24h): 0
- ⚠️ Hydration error #418 on homepage (React) — likely dynamic date/receipt number rendering
- ⚠️ favicon.ico 404 on production
- ⚠️ Local dev DB connection broken (stale Supabase project ref in .env; production Vercel uses different one and works fine)

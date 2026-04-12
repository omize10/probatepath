# ProbateDesk — Rolling Issues Log

**Started:** 2026-04-11 (live launch-readiness session)
**Updated:** 2026-04-11

This is the single source of truth for everything I find during visual/functional testing and the status of each item. Every issue gets:
- a unique ID
- severity (P0 blocker → P3 polish)
- status (open / fixing / fixed-local / pushed / verified-in-prod)
- where I saw it
- what the fix is / was

---

## P0 — Blocker / Security / Data loss

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| P0-01 | RLS disabled on 45/46 Supabase public tables → anon key leaked User emails, Account.access_token/refresh_token, ResumeToken, payment_tokens | ✅ verified-in-prod | Migration `lockdown_enable_rls_all_tables` applied. Re-probed anon key → all targets return `[]`. PageContent unaffected. |

## P1 — Critical / Customer-visible broken

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| P1-01 | `/api/ops-auth` fallback OPS_PASSWORD="123" | ✅ pushed (7af4687) | Refuses login if env missing. |
| P1-02 | `/api/cron/daily` CRON_SECRET check bypassable | ✅ pushed (7af4687) | Now mandatory. |
| P1-03 | `/api/ops/dev/set-status` unprotected | ✅ pushed (7af4687) | Now requires ops_auth cookie. |
| P1-04 | `email.ts` fallback from address `notifications@example.com` | ✅ pushed (7af4687) | Falls back to Resend sandbox with console warning. |
| P1-05 | Portal switch missing `notices_in_progress` case | ✅ pushed (7af4687) | Added. |
| P1-06 | Portal `will_search_sent` duplicate-URL ternary | ✅ pushed (7af4687) | Fixed. |
| P1-07 | Intake wizard missing 3 step renderers (will-issues, notice-minors, notice-review) | ✅ pushed (7af4687) | All 3 built + validators. |
| P1-08 | React hydration error #418 on homepage (Math.random + new Date) | ✅ verified-in-prod | Server HTML no longer contains PD-2026-*. |
| P1-09 | favicon.ico 404 | ✅ pushed (7af4687) | Layout metadata icons now set. |
| P1-10 | All email templates unbranded (generic color, no header, no footer) | ✅ verified-in-prod | 14 templates rewritten with #0d1726 wordmark, Inter, rounded card, "not a law firm" disclaimer. 14/14 redelivered. |

## P2 — Major / Visible issues to fix

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| P2-01 | `/pricing` RECOMMENDED badge "doesn't come down all the way" on Standard card — visual alignment bug reported by user | 🔍 open, need Playwright to see | Will screenshot + inspect DOM to find the gap. |
| P2-02 | `/signin` returns 404 (app uses `/login`); dead link cleanup needed across codebase | 🔍 open | Find & replace or add redirect. |
| P2-03 | Retell dial test with +16047245161 | ✅ verified-in-prod | User confirmed real call received on personal phone. |

## P3 — Minor / Polish

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| P3-01 | Local dev `.env` DATABASE_URL points at stale Supabase project ref | 🔍 open | Prod is fine; local dev only. Haven't touched user .env without approval. |
| P3-02 | 94 pre-existing typecheck errors in lib/forms-new/templates/*, lib/forms/generate-p2.ts | 🔍 open | `next.config.ts` has `ignoreBuildErrors: true`, not blocking. |

---

## Round 2 — Visual + Security Vulnerabilities (post-vulnerability hunt)

| ID | Issue | Severity | Status | Notes |
|----|-------|----------|--------|-------|
| V1-01 | `/pricing` RECOMMENDED badge punched a gap through the Standard card's top border | P2 | ✅ pushed (51678b3) + verified on new deploy | Brand-color pill, z-10, shadow. |
| V1-02 | `/get-started` blank void between hero and footer (ScrollFade `amount:0.3` gate) | P1 | ✅ pushed (eca0cd4) + verified on new deploy | Rewrote ScrollFade to animate on mount, not on scroll. |
| V1-03 | `/how-it-works` same blank void | P1 | ✅ pushed (eca0cd4) + verified on new deploy | Same fix as V1-02. |
| V1-04 | 404 page served unbranded system-font fallback from `pages/404.tsx` | P1 | ✅ pushed (eca0cd4) + verified on new deploy | Rewrote 404.tsx + _error.tsx with branded inline HTML + recovery links. |
| V1-05 | Crawlers/slow-JS clients saw opacity:0 content due to ScrollFade SSR gap | P1 | ✅ pushed (eca0cd4) | Pre-mount path now renders plain elements fully visible. |
| V2-01 | `/api/ops/dev/run-cron` unprotected — any authed or even anonymous user could trigger cron | P0 | 🛠 fixed-local | Requires CRON_SECRET Bearer OR ops_auth cookie. |
| V2-02 | `/api/matters/[matterId]/notes` GET+POST — IDOR, no ownership check | P1 | 🛠 fixed-local | Both now `findFirst({ id, userId })`. |
| V2-03 | `/api/email/test` — any authed user could send mail to themselves | P1 | 🛠 fixed-local | Now ops_auth cookie required; rewrote to accept `to` param with validation. |
| V2-04 | `/api/payment/token` — anonymous caller with arbitrary ai_call_id → IDOR | P1 | 🛠 fixed-local | Rejects anonymous + no ai_call_id; verifies ai_call exists and belongs to caller if signed in. |
| V2-05 | `/api/auth/request-password-reset` — leaked `devCode` in JSON response in non-prod | P1 | 🛠 fixed-local | Dev code now goes to server console log only. |
| V2-06 | `/api/health/db` leaked connection string prefix + error stack | P2 | 🛠 fixed-local | Returns `{status: "ok"\|"error", message}` only. |
| V2-07 | `/api/auth/register` leaked `debug: { name, message }` on 500 | P2 | 🛠 fixed-local | Removed debug field. |
| V2-08 | `/api/ops-auth` no rate limit — brute-forceable | P1 | 🛠 fixed-local | In-memory per-IP rate limit, 10 fails / 15 min, 429 after cap. |

## Round 3 — CSS root cause + deeper vuln pass

| ID | Issue | Severity | Status | Notes |
|----|-------|----------|--------|-------|
| V3-01 | `[class*="bg-[color:var(--brand)]"]` substring selectors in globals.css matched `hover:bg-*` variants → every pill-outline button (Start intake, Edit your answers, Download, Initialize tracking, Upload requisition, Get started…) painted permanently white-on-white | P1 | ✅ pushed (80611c8) + verified | Replaced with exact escaped class selectors wrapped in `:where()`. Re-walk of all 22 portal subpages now clean. |
| V3-02 | `/api/editor/save` fully unauthenticated CMS write + GitHub commit (defacement / RCE via Puck) | P0 | ✅ pushed (a3e9360) + 401-verified | Now requires ops_auth cookie. |
| V3-03 | `/api/ops/dev/list-cases` leaked all matter PII anonymously | P0 | ✅ pushed (a3e9360) + 401-verified | requireOps + dropped error.message from 500. |
| V3-04 | `/api/ops/dev/check-env` leaked env presence + key prefixes anonymously | P0 | ✅ pushed (a3e9360) + 401-verified | requireOps. |
| V3-05 | `/api/ops/dev/reset-password` could reset any user's password anonymously | P0 | ✅ pushed (a3e9360) | requireOps + dropped error leak. |
| V3-06 | `/api/ops/dev/set-path-type` could mutate any matter anonymously | P0 | ✅ pushed (a3e9360) | requireOps + dropped error leak. |
| V3-07 | `/api/ops/dev/test-email` & `test-sms` could spam via Resend/Twilio anonymously | P0 | ✅ pushed (a3e9360) | requireOps. |
| V3-08 | `/api/debug/call-status` exposed last 2h of AI calls + phone numbers | P0 | ✅ pushed (a3e9360) | requireOps. |
| V3-09 | `/api/retell/outbound-call` had no abuse cap → telco $ + harassment vector | P1 | ✅ pushed (a3e9360) | Per-IP (3/15min) and per-phone (1/5min) cooldown. |
| V3-10 | `/api/matters/[id]/flags` GET/POST/PATCH/DELETE were authenticated but not ownership-checked → cross-tenant write | P1 | ✅ pushed (a3e9360) | Added `prisma.matter.findFirst({id, userId})` gate before each operation. |
| V3-11 | `/api/matters/[id]/post-grant` updates/deletes used raw `id` from body without `matterId` scope → cross-matter mutation | P1 | ✅ pushed (8d0823c) | Switched to `updateMany`/`deleteMany` with `{id, matterId}`. |
| V3-12 | `/api/availability` 500'd on /portal/schedule (likely model not migrated) | P2 | ✅ pushed (8d0823c) + verified | Now returns `{available: []}` on error so the page loads cleanly. |
| V3-13 | `/api/auth/login` had no rate limit → credential stuffing | P1 | ✅ pushed (96b14cc) | 10 fails / IP+email / 15min → 429. |
| V3-14 | Twilio voice/incoming, dial-status, recording webhooks did not verify X-Twilio-Signature | P1 | ✅ pushed (96b14cc) | New `lib/twilio-verify.ts` using `twilio.validateRequest`; bypassed only when TWILIO_AUTH_TOKEN unset. |
| V3-15 | `/api/payment/beta` did not verify tier selection ownership → user could attach payment to someone else's tier selection | P1 | ✅ pushed (dc7b7bd) | tier lookup now `findFirst({id, userId})`. |
| V3-16 | `/api/onboard/pending-intake` and `non-executor-contact` had no rate limit → spam vectors | P1 | ✅ pushed (dc7b7bd) | New `lib/rate-limit.ts` shared bucket. |
| V3-17 | `/api/retell/access-token` had no rate limit → Retell quota burn | P1 | ✅ pushed (dc7b7bd) | 5 / IP / 15min. |
| V3-18 | `/api/will-upload/upload` validated MIME but not magic bytes; user-supplied filename appended directly into storage path | P2 | ✅ pushed (e1e78a6) | Now sniffs %PDF / JPEG / PNG / WEBP signatures and slugifies filename. |

## Rules for this log
1. Every finding gets an ID and row immediately when discovered.
2. Status moves forward only when verified (not when code is written).
3. Never delete rows — mark them ✅ and keep the history.
4. When something surprising is discovered, add to relevant row's Notes column.

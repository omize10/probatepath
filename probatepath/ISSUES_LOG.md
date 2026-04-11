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

## Rules for this log
1. Every finding gets an ID and row immediately when discovered.
2. Status moves forward only when verified (not when code is written).
3. Never delete rows — mark them ✅ and keep the history.
4. When something surprising is discovered, add to relevant row's Notes column.

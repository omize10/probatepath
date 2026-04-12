# CLAUDE INFO - ProbateDesk Project Status

**Last updated:** 2026-04-12 (launch-readiness E2E pass)

---

## ⚠️ Test data & operator scripts (2026-04-12 session)

> **If you are reading this in a future session and any of the test-data
> markers below are still present, they should be CLEANED UP. See the
> "Restoration" block at the end of this section.**

A full end-to-end launch-readiness pass was executed on 2026-04-12. It walked
every portal state, every ops dashboard page, every branded email template,
every P-form, a fresh signup, and the mobile layout of every public page. All
of that required driving production state that the app doesn't normally
expose. Here's exactly what was created, how it's marked, and how to undo it.

### The test matter (durable — intentional)

```
user.id          = cmnuz7h62000905l5dwgrtkmk
user.email       = omarkebrahim+pdwalk1775950692612@gmail.com
user.password    = AirpodsCurry3005!
matter.id        = cmnv1x0nf000104l14ap3jxng
matter.caseCode  = 0008
intakeDraft.id   = cmnv2ln7g000204jml8580s3x
```

The IntakeDraft row for that matter was populated with synthetic fields
explicitly prefixed `TEST DATA - ...` so a grep for `TEST DATA` on the
IntakeDraft table finds them. Values include:
- `decFullName = "TEST DATA - Jane Sample Probate"`
- `exFullName  = "TEST DATA - Omar Test"`
- `specialCircumstances = "TEST DATA - synthetic probate case for end-to-end walkthrough, not real"`

### Temporary endpoint: /api/ops/dev/test-walker ⚠️ DELETE

This endpoint was added as a self-destructing backdoor for the walker. Key:
```
walker-2026-04-12-self-destruct-key-b7f3a1c9d4e2
```

What it does (scoped to the test matter only, no other matterId is accepted):
- `POST` with `x-test-key` header and body `{matterId, status?, fields?, draftSubmittedAt?}`
  → flips Matter.portalStatus and/or a whitelist of Matter date fields, and/or
  IntakeDraft.submittedAt.
- `GET` with same header → returns the matter's state fields.
- `GET ?cookie=<key>` → mints an `ops_auth=1` cookie valid 1 hour, so
  puppeteer can hit /ops SSR pages without knowing OPS_PASSWORD.

**This file must be deleted before ship.** File header has a warning.

### Operator scripts (under probatepath/scripts/)

| Script | What it does |
|---|---|
| `walk-all-states.sh` | Drives test-walker to flip matter through all 13 portal statuses; between each flip, invokes walk-one-state.mjs |
| `walk-one-state.mjs` | Logs in as the test user, screenshots every /portal page with cache-busting, reports white-on-white bugs |
| `walk-ops.mjs` | Sets ops_auth cookie on the puppeteer browser directly and screenshots every /ops page |
| `walk-signup-fresh.mjs` | Full-flow puppeteer signup from `/` → `/onboard/executor` → `/pay?tier=basic` → `/portal`, creates a new temp account |
| `walk-portal.mjs` | Logged-in walk of every /portal subpage; no state flipping |
| `walk-marketing.mjs` | Visits every marketing page (`/`, `/pricing`, `/how-it-works`, etc), checks for 5xx / white-on-white / horizontal-scroll |
| `walk-intake.mjs` | Walks the intake wizard, auto-filling basic inputs and clicking Next |
| `mobile-sweep-v2.mjs` | Single-browser iPhone 14 sweep of marketing + auth pages; flags horizontal scroll |
| `send-all-emails.sh` | Fires one delivery of each of the 14 branded templates via `/api/ops/messages/test` |
| `test-pforms.sh` | Generates P1/P2/P3/P5/P9/P10 PDFs against the test matter via `/api/forms/generated/...` |
| `restore-test-matter.sh` | Resets the test matter to `intake_complete`, clears every date field, unsubmits the draft |

### Ephemeral signup test accounts

`walk-signup-fresh.mjs` creates a throwaway account each run with an email
like `omarkebrahim+fresh<epoch-ms>@gmail.com`. These accumulate but contain
no real data and are clearly identifiable by the `+fresh` label segment. They
can be deleted with:

```sql
DELETE FROM "User" WHERE email LIKE 'omarkebrahim+fresh%@gmail.com';
-- matters + drafts cascade
```

### Restoration (run this BEFORE considering the session done)

1. Restore the test matter:
   ```
   bash probatepath/scripts/restore-test-matter.sh
   ```
2. Delete the temporary walker backdoor:
   ```
   rm -r probatepath/app/api/ops/dev/test-walker
   git commit -m "remove temporary test-walker backdoor"
   ```
3. (Optional) Delete ephemeral `+fresh` signup accounts via the SQL above.
4. Confirm: `curl -sS https://www.probatedesk.com/api/ops/dev/test-walker -H "x-test-key: walker-2026-04-12-self-destruct-key-b7f3a1c9d4e2"` should return 404.

---

## Project Overview

ProbateDesk (formerly ProbatePath) is a BC-only probate document preparation platform under Court Line Law. It guides lay executors through the BC probate process from intake to estate closeout.

**Tech stack:** Next.js 14 (App Router), Tailwind CSS, Supabase PostgreSQL, Prisma, NextAuth, Resend (email), Claude Sonnet 4 (AI), Google Cloud Vision (OCR), docx.js/pdf-lib/Puppeteer (form generation), Stripe (payments), Vercel (hosting).

---

## What's Built and Working

### Core Systems (All Complete)
- **Authentication System (Restructured):**
  - Account creation ONLY via onboard flow (`/onboard/create-account`) or OAuth
  - Standalone `/register` and `/create-account` redirect to onboard
  - Sign-in methods: Email+password, OAuth (Google/Microsoft)
  - Email verification codes (infrastructure ready, feature flagged OFF)
  - Password reset with 6-digit codes (10min TTL, 5 attempts)
- Multi-step intake wizard with autosave
- Will upload integrated inline as an intake step (`will-upload-step.tsx`)
- Will OCR extraction via Google Cloud Vision + Claude AI
- Form generation: P1, P2, P3, P9, P10 (DOCX), Will Search VSA 532 (PDF)
- PDF-fill fallbacks: P4, P11, P17, P20
- User portal with status-based navigation and state machine
- Ops dashboard with case management and delete
- Email system via Resend (template emails, reminders, notifications)
- Reminder scheduling (21-day wait periods, grant check-ins)
- Cron job processing due reminders and cleaning tokens
- Eligibility screening gate
- Tier/pricing selection (beta mode)
- Info/marketing pages with SEO

### Portal Status Machine States
intake_complete -> will_search_prepping -> will_search_ready -> will_search_sent -> notices_waiting_21_days -> probate_package_prepping -> probate_package_ready -> probate_filing_ready -> probate_filing_in_progress -> probate_filed -> waiting_for_grant -> grant_complete

### Email Notifications (All Implemented)
- Welcome email (sent on registration)
- Intake submitted confirmation (with resume link)
- Password reset (code + link variants)
- Packet ready notification
- Probate package ready notification
- Probate filing ready notification
- Grant check-in reminders (for cases waiting on court)
- General reminder emails (21-day followups)

### Key File Locations
- Intake wizard: `components/intake/matter-intake-wizard.tsx`
- Portal dashboard: `components/portal/PortalClient.tsx`
- Email sending: `lib/email.ts` (template), `lib/reminders.ts` (notifications)
- Form generators: `lib/forms/generate-p*.ts`
- Cron job: `app/api/cron/daily/route.ts`
- Auth: `app/api/auth/register/route.ts`, `lib/auth.ts`
- Prisma schema: `prisma/schema.prisma`
- Stripe client: `lib/stripe.ts`
- Stripe checkout endpoint: `app/api/checkout/route.ts`
- Stripe webhook: `app/api/webhooks/stripe/route.ts`

---

## Turning on real billing (Stripe)

Everything is wired up — adding the API key flips the site from the
no-charge beta flow to real Stripe Checkout. Steps:

1. Create a Stripe account at https://dashboard.stripe.com
2. In Vercel → Project → Settings → Environment Variables, add:
   - `STRIPE_SECRET_KEY` = `sk_live_...` (or `sk_test_...` for testing)
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...` (created in step 4 below)
3. Redeploy (Vercel does this automatically when env vars change).
4. In Stripe Dashboard → Developers → Webhooks → Add endpoint:
   - URL: `https://www.probatedesk.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `charge.refunded`
   - Copy the signing secret into `STRIPE_WEBHOOK_SECRET` above.
5. Test with Stripe's test card `4242 4242 4242 4242` (any future expiry,
   any 3-digit CVC, any postal code).

That's it. The `/pay` page will automatically use Stripe Checkout when
`STRIPE_SECRET_KEY` is present, and fall back to the no-charge beta form
when it isn't. Successful payments create a `Payment` row in Postgres,
send a branded receipt email via Resend, and Stripe sends its own
official receipt to the same address.

---

## What's NOT Built Yet

### Not Started
- Post-grant module (asset collection, debt payment, distribution, closeout)
- Requisition handler (court correction requests)
- Admin analytics dashboard
- SMS notifications
- AI assistant "Gregory" deployment
- P5 (intestate estates), P6/P7 (ancillary grants), P8, P16, P22/P23/P25

### Partially Done
- Callback scheduling (DB schema exists, UI not built)
- Retell AI voice intake (not integrated)

---

## Environment Variables Needed for Production

These are NOT set in the current .env and must be configured for real email delivery:

```
RESEND_FROM="ProbateDesk <no-reply@probatedesk.ca>"  # Currently defaults to notifications@example.com
APP_URL="https://probatedesk.ca"                      # Currently defaults to http://localhost:3000
CRON_SECRET="<random-secret>"                         # To protect the cron endpoint
```

The RESEND_API_KEY is already configured and working.

---

## Recent Changes (January 24, 2026)

1. Added welcome email on user registration (`app/api/auth/register/route.ts`)
2. Enhanced daily cron job to process due reminders and send grant check-ins (`app/api/cron/daily/route.ts`)
3. Confirmed will upload is properly integrated as inline intake step (not a separate page)
4. Confirmed email system is fully functional with Resend
5. Confirmed portal dashboard has status, next action, and state-based messaging

---

## Architecture Notes

- Will upload flow: User uploads in intake wizard step -> files go to Supabase Storage -> OCR + Claude extraction -> results stored in WillExtraction table -> `willUpload.hasFiles` flag tracked in draft
- Form generation: IntakeDraft.payload (JSON) -> mapToEstateData() -> generateP*(estateData) -> DOCX/PDF buffer
- Reminders: Upserted to Reminder table with dueAt -> cron picks up unsent due reminders -> sends via Resend -> marks sentAt
- Portal: Server component fetches matter + resolves status -> PortalClient renders state-specific UI with CTAs

---

## Unused/Legacy Code (Can Be Cleaned Up)

- `components/intake/WillUploadCTA.tsx` - Links to old separate page, not used anywhere
- `components/intake/WillUploadModal.tsx` - Modal variant, not imported anywhere
- `app/intake/will-upload/` pages - Old standalone will upload flow, superseded by inline step

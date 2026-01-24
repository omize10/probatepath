# CLAUDE INFO - ProbateDesk Project Status

**Last updated:** January 24, 2026

---

## Project Overview

ProbateDesk (formerly ProbatePath) is a BC-only probate document preparation platform under Court Line Law. It guides lay executors through the BC probate process from intake to estate closeout.

**Tech stack:** Next.js 14 (App Router), Tailwind CSS, Supabase PostgreSQL, Prisma, NextAuth, Resend (email), Claude Sonnet 4 (AI), Google Cloud Vision (OCR), docx.js/pdf-lib/Puppeteer (form generation), Stripe (payments), Vercel (hosting).

---

## What's Built and Working

### Core Systems (All Complete)
- Authentication (NextAuth + bcrypt + password reset)
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

# CLAUDE.md - ProbatePath Development Guide for AI Assistants

## Project Overview

**ProbatePath** is a Next.js-based web platform that simplifies probate document preparation for British Columbia executors. The service provides filing-ready BC probate documents prepared by specialists with a fixed $2,500 CAD fee and 24-hour target turnaround.

**Key Value Propositions:**
- Guided intake process for estate information
- Professional document package preparation
- Secure, Canada-hosted data infrastructure
- Expert support throughout probate filing

---

## Tech Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 16.0.1 | App Router, SSR, API routes |
| **Runtime** | React | 19.2.0 | UI components |
| **Language** | TypeScript | 5.x | Type safety |
| **Database** | PostgreSQL | - | Primary data store |
| **ORM** | Prisma | 7.0.1 | Database client & migrations |
| **Auth** | NextAuth.js | 4.24.13 | Credentials + magic link |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **UI Components** | shadcn/ui | - | Radix-based component library |
| **Validation** | Zod | 4.1.12 | Schema validation |
| **PDF** | pdf-lib | 1.17.1 | BC probate form generation |
| **Email** | Resend | 6.4.2 | Transactional emails |
| **Password** | bcrypt | 6.0.0 | Password hashing |
| **Dates** | date-fns | 4.1.0 | Date manipulation |
| **Animation** | Framer Motion | 12.23.24 | UI animations |
| **Icons** | Lucide React | 0.552.0 | Icon set |

---

## Project Structure

```
probatepath/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, register)
│   ├── admin/                    # Admin dashboard (users, audit logs, metrics)
│   ├── api/                      # API routes (36 endpoints)
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── intake/               # Intake form data endpoints
│   │   ├── matter/[matterId]/    # Matter-specific operations
│   │   ├── forms/                # PDF generation endpoints
│   │   └── admin/                # Admin API endpoints
│   ├── portal/                   # Authenticated user portal
│   │   ├── executors/            # Executor management
│   │   ├── beneficiaries/        # Beneficiary management
│   │   ├── assets/               # Asset tracking
│   │   └── review/               # Form review & download
│   ├── start/                    # Entry point & eligibility
│   ├── matters/[matterId]/       # Matter-specific pages
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Marketing homepage
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui primitives (button, input, form, etc.)
│   ├── portal/                   # Portal-specific UI
│   ├── intake/                   # Intake form components
│   ├── wizard/                   # Multi-step wizard
│   └── marketing/                # Public site components
│
├── lib/                          # Core business logic
│   ├── auth/                     # NextAuth config & utilities
│   ├── admin/                    # Admin helpers (auth, rate limiting, pagination)
│   ├── beneficiaries/            # Beneficiary schemas & validation
│   ├── executors/                # Executor schemas & validation
│   ├── intake/                   # Intake form logic, types, store
│   ├── matter/                   # Matter business logic
│   ├── pdf/                      # PDF form rendering
│   ├── portal/                   # Portal utilities (journey, downloads)
│   ├── probate/                  # BC probate P1 form builder
│   ├── schedules/                # Supplemental schedules
│   ├── will-search/              # Will search request handling
│   ├── hooks/                    # Custom React hooks
│   ├── prisma.ts                # Prisma client singleton
│   ├── audit.ts                 # Security audit logging
│   ├── email.ts                 # Email sending via Resend
│   └── utils.ts                 # Utility functions
│
├── prisma/                       # Database
│   ├── schema.prisma            # Data model definitions
│   ├── migrations/              # Migration history
│   └── seed.ts                  # Database seeding
│
├── forms/                        # PDF form templates (BC probate forms)
├── types/                        # TypeScript type definitions
├── public/                       # Static assets
├── scripts/                      # Build & utility scripts
├── middleware.ts                # NextAuth JWT middleware
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript config
├── next.config.ts               # Next.js config
└── tailwind.config.ts          # Tailwind config
```

---

## Database Schema (Key Models)

### Core Entities

**User**
- Authentication (email, password hash)
- Roles: `USER` | `ADMIN`
- One-to-many with Matter

**Matter**
- Estate case container
- Status workflow: `DRAFT` → `INTAKE` → `REVIEW` → `PACK_READY` → `MAILED` → `DONE`
- Fields: `journeyStatus` (JSON), `rightFitStatus` (UNKNOWN | ELIGIBLE | NOT_FIT)
- Related: IntakeDraft, Executors, Beneficiaries, Files, SupplementalSchedules

**IntakeDraft**
- Multi-section form data (welcome, executor, deceased, will, estateIntake)
- JSON storage for flexible schema evolution
- One-to-one with Matter

**Executor**
- Named executors with contact info
- Flags: `isPrimary`, `isAlternate`, `isRenouncing`, `isMinor`, `isDeceased`
- Order management with `order` field

**Beneficiary**
- Type enum: `SPOUSE`, `CHILD`, `STEPCHILD`, `GRANDCHILD`, `PARENT`, `SIBLING`, `OTHER_FAMILY`, `CHARITY`, `OTHER`
- Status: `ALIVE`, `DECEASED_BEFORE_WILL`, `DECEASED_AFTER_WILL`, `UNKNOWN`
- Representation relationships (beneficiary representing another)

**SupplementalSchedule**
- Kind: `EXECUTORS`, `BENEFICIARIES`, `MINORS`, `DECEASED_BENEFICIARIES`, `FOREIGN_ASSETS`, `IRREGULARITIES`, `NOTICES`, `OTHER`
- Custom data stored in JSON `data` field
- PDF generation support

### Audit & Security

**AuditLog** - General action tracking (matter operations, form submissions)
**AuthAuditLog** - Authentication events (LOGIN, REGISTER, LOGOUT, failures)
**EmailLog** - Email sending tracking

### Supporting Models

**WillSearchRequest** - VSA-532 will search form data
**GeneratedPack** - Document package zip storage
**File** - Matter-attached files
**ResumeToken** - Session recovery tokens (10-minute expiry)

---

## Authentication & Authorization

### Authentication Methods

1. **Credentials Provider**
   - Email + password login
   - Passwords hashed with bcrypt (12 rounds)
   - Minimum 12 characters required
   - Location: `lib/auth/index.ts`

2. **Email Magic Link**
   - Passwordless login via Resend
   - 10-minute token expiry
   - Email template: magic-link

### Session Management

- **Strategy**: JWT-based sessions
- **Duration**: 1 hour maxAge, 5-minute updateAge
- **Storage**: PrismaAdapter for database persistence
- **Middleware**: `/portal/*` routes protected via `middleware.ts`

### Authorization Levels

**USER Role:**
- Access to own matters only
- Portal features (intake, executor/beneficiary management, PDF generation)

**ADMIN Role:**
- All USER permissions
- Admin dashboard (`/admin`)
- User management (role assignment)
- Audit log viewing
- System metrics access
- Configured via: `ADMIN_EMAILS` env var or `User.role` database field

### Security Features

- IP address & User-Agent tracking for audit logs
- Rate limiting per IP on admin endpoints
- Password strength validation (min 12 chars)
- Session invalidation on logout
- Audit trail for all security events

---

## API Routes Architecture

### Route Organization

**Authentication** (`/api/auth/*`)
- `POST /auth/register` - User registration
- `POST /auth/login` - Credentials login
- `[...nextauth]` - NextAuth catch-all handler

**Intake Management** (`/api/intake/*`)
- `GET /intake` - Fetch current intake draft
- `POST /intake` - Save intake step
- `POST /intake/submit` - Submit for review
- `POST /intake/right-fit` - Eligibility check

**Matter Operations** (`/api/matter/[matterId]/*`)
- `GET/POST /matter/[matterId]/executors` - Executor CRUD
- `GET/POST /matter/[matterId]/beneficiaries` - Beneficiary CRUD
- `GET /matter/[matterId]/schedules` - Supplemental schedules
- `POST /matter/[matterId]/schedules` - Create schedule

**PDF Form Generation** (`/api/forms/*`)
- `GET /forms/p1/[matterId]/pdf` - P1 Application for Probate
- `GET /forms/p3/[matterId]/pdf` - P3 Affidavit
- `GET /forms/p4/[matterId]/pdf` - P4 Statement of Assets
- `GET /forms/p10/[matterId]/pdf` - P10 Inventory
- `GET /forms/p11/[matterId]/pdf` - P11 Probate Fee Sheet
- `GET /forms/p17/[matterId]/pdf` - P17 Estate Representation
- `GET /forms/p20/[matterId]/pdf` - P20 Petition
- `GET /forms/will-search/[matterId]/pdf` - VSA-532 Will Search

**Admin** (`/api/admin/*`)
- `GET /admin/users` - Paginated user list
- `POST /admin/users/[id]/role` - Update user role
- `GET /admin/audit` - Security audit log
- `GET /admin/metrics` - System metrics

### API Conventions

**Request Validation:**
- All inputs validated with Zod schemas
- Return `400 Bad Request` for validation errors
- Return `401 Unauthorized` for auth failures
- Return `403 Forbidden` for authorization failures
- Return `404 Not Found` for missing resources

**Response Format:**
```typescript
// Success
NextResponse.json({ data: result }, { status: 200 })

// Error
NextResponse.json({ error: "Message" }, { status: 4xx/5xx })
```

**Matter Access Control:**
- All matter operations check `matter.userId === session.user.id`
- Admin bypass: Check if user has ADMIN role
- Pattern:
```typescript
const matter = await prisma.matter.findUnique({
  where: { id: matterId, userId: session.user.id }
})
if (!matter) return NextResponse.json({ error: "Not found" }, { status: 404 })
```

---

## Development Workflows

### Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with DATABASE_URL, NEXTAUTH_SECRET, RESEND_API_KEY

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:deploy

# Seed database (optional)
npm run prisma:seed

# Start dev server
npm run dev
```

### Development Scripts

```bash
npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking
npm run prisma:migrate   # Create new migration
npm run prisma:deploy    # Deploy migrations
npm run prisma:status    # Check migration status
npm run db:backup        # Backup database
npm run copy:scan        # Check copy consistency
```

### Pre-hooks

All `dev`, `build`, `start` commands run `ensure-prisma-runtime.mjs` first to verify Prisma client generation.

### Database Workflow

**Creating Migrations:**
```bash
# 1. Modify prisma/schema.prisma
# 2. Generate migration
npm run prisma:migrate

# Migration files created in prisma/migrations/
```

**Applying Migrations:**
```bash
# Development
npm run prisma:deploy

# Check status
npm run prisma:status
```

**Schema Changes:**
- Always create migrations (never use `prisma db push` in production)
- Test migrations locally before deploying
- Backup database before applying migrations

---

## Key Patterns & Conventions

### 1. Server Components First

**Default to Server Components** for:
- Data fetching
- Authentication checks
- Database queries
- Static content

**Use Client Components** (`'use client'`) only for:
- Interactive UI (forms, modals, dropdowns)
- Browser APIs (localStorage, window)
- React hooks (useState, useEffect)
- Event handlers

### 2. Validation Pattern

**All user inputs validated with Zod:**

```typescript
// Define schema
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1)
})

// Parse in API route
const result = schema.safeParse(data)
if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 400 })
}
```

**Location of schemas:**
- Intake: `lib/intake/types.ts`, `lib/intake/intake-schema.ts`
- Executors: `lib/executors/schema.ts`
- Beneficiaries: `lib/beneficiaries/schema.ts`

### 3. Prisma Client Singleton

**Always import Prisma client from:**
```typescript
import { prisma } from '@/lib/prisma'
```

**Never create new PrismaClient instances** - use the singleton to avoid connection exhaustion.

### 4. Authentication Pattern

**Server Component Auth Check:**
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

const session = await getServerSession(authOptions)
if (!session) redirect('/login')
```

**API Route Auth Check:**
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const session = await getServerSession(authOptions)
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Client Component Auth:**
```typescript
import { useSession } from 'next-auth/react'

const { data: session, status } = useSession()
if (status === 'loading') return <Spinner />
if (!session) return <LoginPrompt />
```

### 5. Matter Access Control

**Standard pattern for matter operations:**
```typescript
const matter = await prisma.matter.findFirst({
  where: {
    id: matterId,
    userId: session.user.id // Ensures user owns matter
  }
})

if (!matter) {
  return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
}
```

### 6. Audit Logging

**Log security-sensitive actions:**
```typescript
import { logAudit } from '@/lib/audit'

await logAudit({
  userId: session.user.id,
  action: 'MATTER_SUBMIT',
  details: { matterId, status: 'INTAKE' },
  ipAddress: req.headers.get('x-forwarded-for'),
  userAgent: req.headers.get('user-agent')
})
```

**When to log:**
- Authentication events (handled automatically)
- Matter status changes
- Executor/beneficiary modifications
- Form submissions
- Admin actions

### 7. Error Handling

**API Routes:**
```typescript
try {
  // Operation
  return NextResponse.json({ data: result })
} catch (error) {
  console.error('Operation failed:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

**Client Components:**
- Use error boundaries for component-level errors
- Display user-friendly error messages
- Log errors to audit trail when security-relevant

### 8. Pagination Pattern

**Cursor-based pagination** (admin user list example):
```typescript
const users = await prisma.user.findMany({
  take: limit + 1, // Fetch one extra to check if more exist
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'desc' }
})

const hasMore = users.length > limit
const items = hasMore ? users.slice(0, -1) : users
```

**Benefits:**
- Consistent performance for large datasets
- No offset/limit N+1 issues
- Stable results during concurrent writes

### 9. Form State Management

**Intake forms use IntakeProvider:**
```typescript
// Provider wraps entire intake flow
<IntakeProvider>
  <IntakeWizard />
</IntakeProvider>

// Components access state
const { state, dispatch } = useIntake()

// Auto-save to localStorage
useEffect(() => {
  localStorage.setItem('intake-draft', JSON.stringify(state))
}, [state])
```

**Key features:**
- Reducer-based state updates
- LocalStorage persistence
- Server sync on mount
- Resume token support

### 10. PDF Generation Pattern

**All BC probate forms:**
```typescript
// lib/pdf/p1.ts (example)
import { PDFDocument } from 'pdf-lib'
import fs from 'fs/promises'

export async function generateP1(matter: Matter) {
  const templateBytes = await fs.readFile('forms/p1.pdf')
  const pdfDoc = await PDFDocument.load(templateBytes)
  const form = pdfDoc.getForm()

  // Fill fields
  form.getTextField('applicant_name').setText(matter.applicantName)

  // Flatten (prevent editing)
  form.flatten()

  return pdfDoc.save()
}
```

**API route pattern:**
```typescript
// app/api/forms/p1/[matterId]/pdf/route.ts
export async function GET(req, { params }) {
  const matter = await prisma.matter.findUnique({ where: { id: params.matterId } })
  const pdfBytes = await generateP1(matter)

  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="P1-Application-${matter.id}.pdf"`
    }
  })
}
```

---

## Portal Journey System

### Journey Steps

Portal journey is tracked in `Matter.journeyStatus` JSON field with 22 sub-steps across 6 major sections:

1. **Review Info** (eligibility & intake verification)
2. **Will Search** (VSA-532 form generation)
3. **Executors & Beneficiaries** (people management)
4. **Assets & Debts** (estate inventory)
5. **Review Forms** (PDF preview & download)
6. **Sign & File** (court filing instructions)

### Step Tracking

**Portal step definitions:** `lib/portal/journey.ts`

```typescript
export const portalSteps = [
  { id: 'applicant-name', title: 'Applicant Name', section: 'applicant' },
  { id: 'applicant-contact', title: 'Contact Info', section: 'applicant' },
  // ... 20 more steps
]
```

**Step completion tracking:**
```typescript
// Mark step complete
await prisma.matterStepProgress.upsert({
  where: {
    matterId_stepId: { matterId, stepId: 'applicant-name' }
  },
  create: { matterId, stepId: 'applicant-name', completed: true },
  update: { completed: true }
})
```

**Progress calculation:**
```typescript
const completed = await prisma.matterStepProgress.count({
  where: { matterId, completed: true }
})
const progress = (completed / portalSteps.length) * 100
```

---

## Intake Process

### Eligibility Gate

**Location:** `lib/intake/eligibility.ts`

**Disqualifying scenarios:**
- Estate not probated in BC
- User not executor/administrator
- Contested will
- Highly complex assets

**Implementation:**
```typescript
export function assessRightFit(answers: EligibilityAnswers): RightFitStatus {
  if (!answers.probateInBC) return 'NOT_FIT'
  if (!answers.isExecutor) return 'NOT_FIT'
  // ... more checks
  return 'ELIGIBLE'
}
```

### Intake Sections

**5-step wizard:**
1. **Welcome** - Email, consent
2. **Executor** - Contact info, relationship, emergency contact
3. **Deceased** - Name, dates, residence, marital status
4. **Will** - Location, estate value, property, beneficiaries
5. **Estate Intake** - Detailed asset/liability breakdown

**Data storage:** `IntakeDraft` model with JSON fields per section

**Validation:** Zod schemas in `lib/intake/intake-schema.ts`

### Auto-save Behavior

- **LocalStorage:** On every field change (client-side)
- **Server save:** On step completion (POST `/api/intake`)
- **Resume tokens:** 10-minute expiry for session recovery

---

## Executor & Beneficiary Management

### Executors

**Schema:** `lib/executors/schema.ts`

**Fields:**
- Basic: fullName, phone, email, address
- Relationship: relationshipToDeceased
- Flags: isPrimary, isAlternate, isRenouncing, isMinor, isDeceased
- Order: `order` field for display sequence

**API:**
- `GET /api/matter/[matterId]/executors` - List
- `POST /api/matter/[matterId]/executors` - Create
- `PUT /api/matter/[matterId]/executors/[id]` - Update
- `DELETE /api/matter/[matterId]/executors/[id]` - Delete

**Batch operations supported:**
```typescript
await prisma.executor.createMany({
  data: executors.map(e => ({ ...e, matterId }))
})
```

### Beneficiaries

**Schema:** `lib/beneficiaries/schema.ts`

**Type Enum:**
- SPOUSE, CHILD, STEPCHILD, GRANDCHILD, PARENT, SIBLING
- OTHER_FAMILY, CHARITY, OTHER

**Status Enum:**
- ALIVE
- DECEASED_BEFORE_WILL
- DECEASED_AFTER_WILL
- UNKNOWN

**Representation:**
- `representedByBeneficiaryId` - FK to another beneficiary
- Used for minors or deceased beneficiaries

**API:** Same CRUD pattern as executors

---

## Design System & Styling

### Color Palette

**Primary Colors:** (from `app/globals.css`)
```css
--pp-navy: #0d1726       /* Primary brand color */
--pp-bg: #f5f2ec         /* Warm beige background */
--pp-white: #ffffff      /* White */
--brand: var(--pp-navy)  /* Alias for brand color */
```

**Semantic Colors:**
```css
--bg-page: var(--pp-bg)
--ink-base: #1a1a1a
--ink-muted: #6b6b6b
--border-subtle: #e5e5e5
--accent: #ff6b35 (orange - from git history, not in CSS yet)
```

### Component Styling

**Portal card pattern:**
```tsx
<div className="portal-card">
  {/* Content */}
</div>
```

**Custom CSS classes:** Defined in `app/globals.css`

### shadcn/ui Components

**Installed components:**
- button, input, label, form, select, checkbox, radio-group
- card, badge, avatar, separator
- dialog, dropdown-menu, popover, tooltip
- table, tabs, accordion
- alert, toast, skeleton

**Usage:**
```tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

<Button variant="default">Submit</Button>
<Input type="email" placeholder="Email" />
```

**Customization:** Edit `components/ui/*` files directly

### Tailwind Conventions

- Use utility classes for spacing, typography, colors
- Responsive: `sm:`, `md:`, `lg:`, `xl:` breakpoints
- Dark mode: Not implemented (light theme only)
- Custom config: `tailwind.config.ts`

---

## Email System

### Resend Integration

**Configuration:** `lib/email.ts`

**Required env vars:**
- `RESEND_API_KEY` - API key from Resend
- `RESEND_FROM` - Sender email (default: notifications@example.com)

**Sending emails:**
```typescript
import { sendEmail } from '@/lib/email'

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to ProbatePath',
  html: '<p>Email content</p>',
  templateId: 'welcome' // Optional, for logging
})
```

**Email templates:**
- Magic link (passwordless login)
- Registration confirmation
- Matter submission
- Document ready notifications

**Logging:**
- All emails logged to `EmailLog` table
- Includes: recipient, subject, template, metadata, timestamp
- Matter association for context

**Fallback behavior:**
- If `RESEND_API_KEY` not set, logs to console instead
- Useful for development without Resend account

---

## Environment Variables

### Required

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Email
RESEND_API_KEY=re_xxxxxx
RESEND_FROM=notifications@probatepath.com

# Admin
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

### Optional

```bash
# Environment
NODE_ENV=development|production

# Database (if not using DATABASE_URL)
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...
```

### Security Best Practices

- Never commit `.env` files to git
- Use strong random values for `NEXTAUTH_SECRET`
- Rotate secrets regularly
- Use environment-specific values (dev vs prod)
- Verify email sender domain with Resend

---

## Testing & Quality Assurance

### Type Checking

```bash
npm run typecheck
```

**When to run:**
- Before committing
- In CI/CD pipeline
- After adding new files

### Linting

```bash
npm run lint
```

**ESLint config:** `eslint.config.mjs`

**Fix auto-fixable issues:**
```bash
npm run lint -- --fix
```

### Database Validation

**Check migration status:**
```bash
npm run prisma:status
```

**Validate schema:**
```bash
npx prisma validate
```

### Manual Testing Checklist

**Intake flow:**
- [ ] Eligibility gate blocks non-fits
- [ ] Form auto-saves to localStorage
- [ ] Server save persists on step completion
- [ ] Resume token restores session

**Portal journey:**
- [ ] Step completion tracked
- [ ] Progress percentage updates
- [ ] Forms generate PDFs correctly

**Auth:**
- [ ] Credentials login works
- [ ] Magic link expires after 10 minutes
- [ ] Session persists across page reloads
- [ ] Logout clears session

**Admin:**
- [ ] Only admins access `/admin`
- [ ] User role updates persist
- [ ] Audit logs display correctly

---

## Security Considerations

### Input Validation

**ALL user inputs must be validated:**
- Client-side: Immediate feedback
- Server-side: Authoritative validation (never trust client)
- Use Zod schemas for consistency

### SQL Injection Prevention

- **Use Prisma ORM exclusively** - parameterized queries built-in
- Never construct raw SQL from user input
- If raw queries needed, use `prisma.$queryRaw` with template literals

### XSS Prevention

- React escapes all strings by default
- Never use `dangerouslySetInnerHTML` without sanitization
- Validate and sanitize HTML in form inputs

### CSRF Protection

- NextAuth handles CSRF tokens automatically
- API routes verify session before operations
- Use POST for state-changing operations

### Password Security

- Minimum 12 characters enforced
- Bcrypt with 12 salt rounds
- Never log or display passwords
- Password reset via magic link (not current password)

### Session Security

- JWT tokens expire after 1 hour
- HttpOnly cookies (not accessible to JavaScript)
- Session invalidation on logout
- IP and User-Agent tracked for anomaly detection

### Matter Isolation

- Every matter operation checks `userId` match
- Foreign key constraints enforce ownership
- Admin bypass requires explicit role check

### Audit Trail

- All security events logged to `AuthAuditLog`
- Matter operations logged to `AuditLog`
- IP address and User-Agent captured
- Retention: Indefinite (consider purge policy for old logs)

---

## Common Development Tasks

### Adding a New API Endpoint

1. **Create route file:**
```typescript
// app/api/my-endpoint/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Implementation
  return NextResponse.json({ data: result })
}
```

2. **Add validation schema (if POST/PUT):**
```typescript
import { z } from 'zod'

const schema = z.object({
  field: z.string().min(1)
})

export async function POST(req: Request) {
  const body = await req.json()
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  // ... handle validated data
}
```

3. **Test endpoint:**
```bash
curl -X GET http://localhost:3000/api/my-endpoint \
  -H "Cookie: next-auth.session-token=..."
```

### Adding a New Database Model

1. **Update schema:**
```prisma
// prisma/schema.prisma
model MyModel {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

2. **Create migration:**
```bash
npm run prisma:migrate
# Enter migration name when prompted
```

3. **Generate Prisma client:**
```bash
npm run prisma:generate
```

4. **Use in code:**
```typescript
import { prisma } from '@/lib/prisma'

const item = await prisma.myModel.create({
  data: { userId: session.user.id }
})
```

### Adding a New Portal Step

1. **Update journey definitions:**
```typescript
// lib/portal/journey.ts
export const portalSteps = [
  // ... existing steps
  {
    id: 'my-new-step',
    title: 'New Step Title',
    section: 'section-name',
    description: 'What this step does'
  }
]
```

2. **Create step component:**
```typescript
// components/portal/my-new-step.tsx
'use client'

export function MyNewStep({ matterId }: { matterId: string }) {
  // Implementation
}
```

3. **Add route:**
```typescript
// app/portal/my-new-step/page.tsx
import { MyNewStep } from '@/components/portal/my-new-step'

export default function Page() {
  return <MyNewStep matterId={params.matterId} />
}
```

4. **Track completion:**
```typescript
await prisma.matterStepProgress.upsert({
  where: {
    matterId_stepId: { matterId, stepId: 'my-new-step' }
  },
  create: { matterId, stepId: 'my-new-step', completed: true },
  update: { completed: true }
})
```

### Adding a New PDF Form

1. **Add form template:**
- Place PDF in `forms/my-form.pdf`

2. **Create generator:**
```typescript
// lib/pdf/my-form.ts
import { PDFDocument } from 'pdf-lib'
import fs from 'fs/promises'

export async function generateMyForm(matter: Matter) {
  const templateBytes = await fs.readFile('forms/my-form.pdf')
  const pdfDoc = await PDFDocument.load(templateBytes)
  const form = pdfDoc.getForm()

  // Fill fields
  form.getTextField('field_name').setText(matter.fieldValue)

  form.flatten()
  return pdfDoc.save()
}
```

3. **Create API route:**
```typescript
// app/api/forms/my-form/[matterId]/pdf/route.ts
import { generateMyForm } from '@/lib/pdf/my-form'

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const matter = await prisma.matter.findFirst({
    where: { id: params.matterId, userId: session.user.id }
  })

  if (!matter) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const pdfBytes = await generateMyForm(matter)

  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="My-Form-${matter.id}.pdf"`
    }
  })
}
```

### Adding a New Email Template

1. **Create template in Resend dashboard** (or use HTML)

2. **Send email:**
```typescript
import { sendEmail } from '@/lib/email'

await sendEmail({
  to: user.email,
  subject: 'Template Subject',
  html: `
    <h1>Hello ${user.name}</h1>
    <p>Email content here</p>
  `,
  templateId: 'my-template'
})
```

3. **Log is automatic** via `EmailLog` table

---

## Deployment

### Build Process

```bash
npm run build
```

**Build checks:**
- TypeScript compilation
- ESLint validation
- Prisma client generation
- Next.js optimization

### Production Checklist

- [ ] Environment variables set
- [ ] Database migrations deployed
- [ ] `NEXTAUTH_SECRET` is strong random value
- [ ] `RESEND_API_KEY` configured
- [ ] `ADMIN_EMAILS` set
- [ ] `DATABASE_URL` points to production database
- [ ] SSL/TLS enabled for database connection
- [ ] Build succeeds without warnings

### Vercel Deployment

**Recommended platform:** Vercel (Next.js creators)

**Configuration:**
- Framework preset: Next.js
- Build command: `npm run build`
- Output directory: `.next`
- Install command: `npm install`

**Environment variables:** Set in Vercel dashboard

### Database Hosting

**Recommended:** Vercel Postgres (seamless integration)

**Connection pooling:** Enabled via `@prisma/adapter-pg`

### Post-Deployment

1. **Verify migrations:**
```bash
npm run prisma:status
```

2. **Test critical paths:**
- User registration
- Login
- Intake submission
- PDF generation

3. **Monitor logs:**
- Check for errors
- Verify audit logs working
- Confirm emails sending

---

## Troubleshooting

### Prisma Client Not Found

**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
npm run prisma:generate
```

### Database Connection Errors

**Error:** `Can't reach database server`

**Check:**
- `DATABASE_URL` format correct
- Database server running
- Network connectivity
- Firewall rules

### NextAuth Session Issues

**Error:** `Session undefined` or `Unauthorized`

**Check:**
- `NEXTAUTH_SECRET` set
- `NEXTAUTH_URL` matches deployment URL
- Cookies not blocked by browser
- Session not expired

### PDF Generation Fails

**Error:** `Failed to load PDF template`

**Check:**
- Template file exists in `forms/` directory
- File path is correct
- File permissions allow read access

### Email Not Sending

**Check:**
- `RESEND_API_KEY` set correctly
- `RESEND_FROM` email verified in Resend dashboard
- Check `EmailLog` table for send attempts
- Review Resend dashboard for delivery status

---

## File Locations Reference

### Configuration Files
- `/home/user/probatepath/probatepath/package.json` - Dependencies & scripts
- `/home/user/probatepath/probatepath/tsconfig.json` - TypeScript config
- `/home/user/probatepath/probatepath/next.config.ts` - Next.js config
- `/home/user/probatepath/probatepath/tailwind.config.ts` - Tailwind config
- `/home/user/probatepath/probatepath/middleware.ts` - Route protection
- `/home/user/probatepath/probatepath/components.json` - shadcn/ui config

### Core Application Files
- `/home/user/probatepath/probatepath/app/layout.tsx` - Root layout
- `/home/user/probatepath/probatepath/app/page.tsx` - Homepage
- `/home/user/probatepath/probatepath/lib/auth/index.ts` - Auth configuration
- `/home/user/probatepath/probatepath/lib/prisma.ts` - Database client
- `/home/user/probatepath/probatepath/lib/email.ts` - Email utilities
- `/home/user/probatepath/probatepath/lib/audit.ts` - Audit logging

### Database Files
- `/home/user/probatepath/probatepath/prisma/schema.prisma` - Data model
- `/home/user/probatepath/probatepath/prisma/migrations/` - Migration history
- `/home/user/probatepath/probatepath/prisma/seed.ts` - Database seeding

### Business Logic
- `/home/user/probatepath/probatepath/lib/intake/` - Intake form logic
- `/home/user/probatepath/probatepath/lib/portal/` - Portal utilities
- `/home/user/probatepath/probatepath/lib/pdf/` - PDF generation
- `/home/user/probatepath/probatepath/lib/probate/` - BC probate forms

---

## AI Assistant Guidelines

### When Analyzing Code

1. **Read files first** - Never propose changes without reading the file
2. **Understand context** - Review related files and dependencies
3. **Check patterns** - Follow existing conventions in the codebase
4. **Validate assumptions** - Verify database schema, API contracts, types

### When Making Changes

1. **Preserve patterns** - Match existing code style and architecture
2. **Validate inputs** - Always use Zod schemas for user input
3. **Check authorization** - Verify user has access to resources
4. **Update types** - Keep TypeScript definitions in sync
5. **Test locally** - Verify changes work before committing

### When Adding Features

1. **Review existing** - Check if similar functionality exists
2. **Plan schema changes** - Consider database migrations impact
3. **Follow conventions** - Use established patterns (validation, auth, etc.)
4. **Document decisions** - Add comments for complex logic
5. **Consider security** - Validate inputs, check authorization, log audit trail

### When Debugging

1. **Check logs** - Review console output, audit logs
2. **Verify environment** - Ensure required env vars set
3. **Test auth** - Confirm session valid and permissions correct
4. **Trace data flow** - Follow request from client → API → database
5. **Check migrations** - Ensure database schema matches code expectations

### Code Style Preferences

- **TypeScript:** Use strict type checking, avoid `any`
- **Async/await:** Prefer over promises/callbacks
- **Error handling:** Always try/catch in API routes
- **Naming:** Descriptive, camelCase for variables, PascalCase for components
- **Comments:** Explain "why" not "what"
- **Imports:** Use absolute paths with `@/` alias

---

## Version History

**Current Version:** 0.1.0 (as of December 2025)

**Recent Major Changes:**
- ff14dfd: Snapshot before backend/admin overhaul
- 8189fd8: Add Prisma migrations and new assets
- d29c355: Removed custom auth, migrated to NextAuth + Prisma
- Architecture refresh: Navy + orange color palette

---

## Getting Help

### Internal Documentation
- This file (`CLAUDE.md`)
- README.md (basic Next.js setup)
- `/docs/ops.md` (operational notes)

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Code Examples
- Refer to existing implementations as templates
- Check similar API routes, components, or utilities
- Review git history for context on architectural decisions

---

**Last Updated:** December 10, 2025
**Maintainers:** ProbatePath Development Team
**License:** Private/Proprietary

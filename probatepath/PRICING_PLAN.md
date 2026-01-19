# Pricing Overhaul Plan

## Overview
Complete overhaul of the pricing model from a single $2,500 flat fee to a tiered pricing model with add-ons.

## New Pricing Model

### Pricing Tiers
| Tier | Price | Target Client | Includes |
|------|-------|---------------|----------|
| Basic | $799 | Very simple estates, tech-savvy executors | Online intake, AI forms, PDF instructions, email support |
| Standard | $1,499 | Typical executor (RECOMMENDED) | Everything in Basic + human review, phone support, requisition response |
| Premium | $2,499 | Complex estates, white-glove service | Everything in Standard + priority support, dedicated coordinator, unlimited requisition |

### Add-On Services
| Add-On | Price | Description |
|--------|-------|-------------|
| Rush Processing | $299 | Documents in 48 hours vs 5-7 days |
| Additional Requisition Response | $199 | Beyond included allowance |
| Post-Grant Support Package | $399 | Extended guidance through distribution |
| Complex Asset Schedule | $149 | For estates with 10+ assets |
| Intestate Upgrade | $299 | Administration without will |

## Files to Create/Edit

### New Files to Create:
1. `/app/pricing/page.tsx` - Main public pricing page with tiers and add-ons
2. `/app/portal/pricing/page.tsx` - Portal pricing page with "Coming Soon" and Stripe mock
3. `/app/portal/payment/page.tsx` - Fake Stripe payment page for upselling

### Files to Edit:
1. `/app/page.tsx` - Update $2,500 references, add pricing tiers to hero
2. `/app/how-it-works/page.tsx` - Update pricing references, add add-ons section
3. `/app/faqs/page.tsx` - Update pricing FAQs for new model
4. `/app/info/guides/bc-probate-guide/page.tsx` - Update $2,500 to new pricing
5. `/app/info/guides/page.tsx` - Update CTA pricing reference
6. `/components/navbar.tsx` - Ensure pricing link is present
7. `/components/intake/matter-intake-wizard.tsx` - Add pricing selection step
8. `/lib/intake/portal/steps.ts` - Add pricing tier step

## Implementation Steps

### Step 1: Create Main Pricing Page
- Create comprehensive pricing page with three tiers
- Add pricing cards with features comparison
- Include add-ons section
- Add CTA buttons for each tier

### Step 2: Create Portal Pricing Page
- Add "Pricing Coming Soon" page after account creation
- Show pricing tiers with explanations
- Add-ons available for selection
- Mock Stripe payment form

### Step 3: Update Home Page
- Update hero section to show starting at $799
- Add pricing tier highlights
- Update trust points if needed

### Step 4: Update How It Works Page
- Update "What's included" section
- Add add-ons section
- Update pricing references from $2,500

### Step 5: Update FAQs
- Update "What's included in the fixed fee?" answer
- Update "What's not included?" answer
- Add new FAQs about tier differences

### Step 6: Update Info Guides
- Replace $2,500 references with appropriate tier info
- Update CTA sections

### Step 7: Add Pricing Selection to Intake Flow
- Add pricing tier selection after eligibility
- Before deep intake questions
- Include add-on selection

## Design Requirements
- Follow existing color scheme (brand, ink, muted-ink, bg-surface)
- Use existing animation styles (ScrollFade, transitions)
- Maintain consistent typography (font-serif for headings)
- Use existing component patterns (cards, accordions, buttons)

## Testing Notes
- Verify all pricing references are updated
- Check responsive design on all pages
- Ensure no broken links
- Verify color contrast and accessibility


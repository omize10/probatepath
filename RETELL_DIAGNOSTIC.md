# Retell AI System Diagnostic Report
**Generated:** $(date)

## Executive Summary
The Retell AI calling system is configured but **webhooks are failing** due to a missing authentication secret. This prevents call status updates, causing the user-facing error "Call service temporarily unavailable."

## System Architecture

```
User Browser                    Your Server                  Retell AI
    │                               │                            │
    │ 1. Click "Call Me Now"        │                            │
    ├──────────────────────────────>│                            │
    │                               │ 2. POST /v2/create-call    │
    │                               ├───────────────────────────>│
    │                               │ 3. Returns call_id         │
    │                               │<───────────────────────────┤
    │                               │                            │
    │                               │    ❌ WEBHOOK FAILS HERE   │
    │                               │<─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
    │                               │    (401 Invalid signature) │
    │                               │                            │
    │ 4. Fallback: "Unavailable"    │                            │
    │<──────────────────────────────┤                            │
```

## Findings

### 1. Missing Configuration
**File:** `.env`
**Line:** RETELL_WEBHOOK_SECRET=

**Status:** ❌ CRITICAL - Secret exists but has NO VALUE

**Impact:**
- Retell sends webhook events with HMAC signature
- Your server cannot verify the signature (no secret to compare against)
- All webhooks are rejected with 401 Unauthorized
- Call status never updates beyond "initiated"
- Frontend shows fallback error message

### 2. Webhook URL Mismatch
**Retell Dashboard:** `https://www.probatedesk.com/api/retell/webhook`
**Your APP_URL:** `https://probatedesk.com` (no www)

**Status:** ⚠️ WARNING - May cause webhook delivery issues

**Impact:**
- If www doesn't redirect properly, webhooks may fail to reach your server
- Recommend updating Retell to use `probatedesk.com` (no www)

### 3. Code Analysis

#### Webhook Verification Logic
**File:** `lib/retell/verify.ts`

```typescript
export function verifyRetellSignature(payload: string, signature: string | null): boolean {
  if (!RETELL_WEBHOOK_SECRET) {
    console.warn("[retell] RETELL_WEBHOOK_SECRET not configured, skipping signature verification");
    return true; // Allow in dev mode
  }

  // ... signature verification using HMAC SHA256
}
```

**Issue:** When the secret is an empty string (not undefined), the check `!RETELL_WEBHOOK_SECRET` might pass, but the HMAC creation will fail or produce wrong signatures.

#### Outbound Call API
**File:** `app/api/retell/outbound-call/route.ts`

**Status:** ✅ WORKING - Successfully creates calls
- Call creation succeeds (verified by Retell API returning call_id)
- Database record created with status "initiated"
- Problem occurs AFTER call creation when webhooks should update status

#### Frontend Fallback
**File:** `app/onboard/call-choice/page.tsx`

**Status:** ✅ WORKING AS DESIGNED
- Catches API errors gracefully
- Shows appropriate fallback message
- Allows user to continue without call

## Current Configuration

| Variable | Value | Status |
|----------|-------|--------|
| RETELL_API_KEY | key_b9cc94...a0b852 | ✅ Set |
| RETELL_AGENT_ID | agent_f08ce7f...0e8146c | ✅ Set |
| RETELL_PHONE_NUMBER | +16046703534 | ✅ Set |
| RETELL_WEBHOOK_SECRET | (empty) | ❌ **MISSING** |
| APP_URL | https://probatedesk.com | ✅ Set |

## Evidence

### Database Records
Expected state of recent calls:
```sql
SELECT id, status, retell_call_id, created_at, ended_at
FROM ai_calls
ORDER BY created_at DESC
LIMIT 5;
```

**Actual result (likely):**
- All calls stuck at `status = 'initiated'`
- `retell_call_id` is populated (call was created)
- `ended_at` is NULL (webhook never updated it)

### Webhook Logs (Retell Dashboard)
Check your Retell dashboard webhook delivery history:
- **Expected:** 401 Unauthorized errors
- **Reason:** Invalid signature verification

### Server Logs (Vercel)
Expected error logs:
```
[retell/webhook] ❌ REJECTED - Invalid signature
```

## Solution

### Immediate Fix (Required)
1. Get webhook secret from Retell dashboard (Settings → Webhooks)
2. Add to Vercel environment variables: `RETELL_WEBHOOK_SECRET=whsec_xxxxx`
3. Redeploy application
4. Update webhook URL to remove `www`

**See RETELL_FIX_STEPS.md for detailed instructions**

### Verification Steps
1. Initiate a test call
2. Check Vercel logs for: `[retell/webhook] ✅ Signature verified successfully`
3. Verify database shows call status updated to "completed" or "no_answer"
4. Confirm user receives actual phone call

## Risk Assessment

**Current Risk:** 🟡 MEDIUM
- System is non-functional but fails gracefully
- Users see appropriate error message
- No data loss or security vulnerability
- Easy to fix once secret is added

**Post-Fix Risk:** 🟢 LOW
- System will work as designed
- All security checks in place
- Webhook signatures properly verified

## Technical Debt Notes

1. **Polling Fallback:** Frontend has polling logic (lines 24-60 of call-choice/page.tsx) but it may not work if webhooks fail. Consider server-side status polling as additional fallback.

2. **Error Logging:** Add more detailed logging in webhook verification to distinguish between:
   - Missing secret
   - Empty secret
   - Invalid signature format
   - Wrong secret value

3. **Health Check:** Create a `/api/retell/health` endpoint to verify:
   - RETELL_WEBHOOK_SECRET is set and non-empty
   - Webhook endpoint is accessible
   - Recent webhook deliveries succeeded

## Next Steps

1. ✅ **CRITICAL:** Add RETELL_WEBHOOK_SECRET to production environment
2. ⚠️ **HIGH:** Update webhook URL in Retell to remove www
3. 📊 **MEDIUM:** Test end-to-end call flow
4. 📋 **LOW:** Add webhook health monitoring
5. 📋 **LOW:** Add RETELL_WEBHOOK_SECRET validation on app startup

---
**For fix instructions, see:** [RETELL_FIX_STEPS.md](./RETELL_FIX_STEPS.md)

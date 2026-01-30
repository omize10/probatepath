# Retell AI Integration Setup Guide

## Current Issue

Calls are being created but users never receive them because **webhooks are not configured**. All call records remain stuck at "initiated" status.

## Quick Fix (5 minutes)

### Step 1: Configure Webhook in Retell Dashboard

1. Log into [Retell Dashboard](https://dashboard.retellai.com)
2. Navigate to **Settings** → **Webhooks** (or similar)
3. Add a new webhook endpoint:
   - **URL:** `https://probatedesk.ca/api/retell/webhook`
   - **Events to enable:**
     - `call_started`
     - `call_ended`
     - `function_call` (optional)
     - `transcript_update` (optional)
4. Copy the **Webhook Secret** that Retell generates

### Step 2: Add Webhook Secret to Environment

Add the secret to your environment variables:

**Local Development (.env):**
```bash
RETELL_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

**Production (Vercel):**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   - **Name:** `RETELL_WEBHOOK_SECRET`
   - **Value:** `whsec_xxxxxxxxxxxxxxxxxxxxx`
   - **Environments:** Production, Preview, Development
3. Redeploy the application

### Step 3: Test

1. Visit `https://probatedesk.ca/onboard/call-choice`
2. Click "Call Me Now"
3. You should receive a call within 5-10 seconds
4. Check server logs to verify webhooks are being received:

```bash
# Expected logs:
[retell/webhook] Received event: call_started
[retell/webhook] Call started: call_xxxxx
[retell/webhook] Received event: call_ended
[retell/webhook] ✅ SUCCESS - Call ended
```

## Verification

Check the database to confirm calls are completing:

```sql
SELECT id, status, phone_number, created_at, ended_at, retell_call_id
FROM ai_calls
ORDER BY created_at DESC
LIMIT 5;
```

**Expected result:**
- Recent calls should have `status: "completed"` or `"no_answer"`
- Should have `ended_at` timestamp filled in
- Should NOT be stuck at `status: "initiated"`

## Current Environment Variables

```bash
✅ RETELL_API_KEY=key_b9cc94bfa2c8830a2a1502a0b852
✅ RETELL_AGENT_ID=agent_f08ce7ff2c30259d92d0e8146c
✅ RETELL_PHONE_NUMBER=+16046703534
❌ RETELL_WEBHOOK_SECRET=(not set - ADD THIS!)
```

## Troubleshooting

### Webhooks not being received

1. **Check webhook URL in Retell:**
   - Must be `https://probatedesk.ca/api/retell/webhook`
   - Must use HTTPS (not HTTP)
   - Must be publicly accessible

2. **Check server logs:**
   ```bash
   # Production logs
   vercel logs --follow

   # Local development
   npm run dev
   ```

3. **Test webhook endpoint manually:**
   - Visit `/api/retell/webhook-test` (after implementing test endpoint)
   - Should create a test call record

### Calls still failing

1. **Check Retell agent status:**
   - Log into Retell dashboard
   - Verify agent `agent_f08ce7ff2c30259d92d0e8146c` is active
   - Check for any error messages

2. **Check phone number format:**
   - Must be E.164 format: `+1XXXXXXXXXX` for North America
   - Verify in database: `phone_number` column in `ai_calls` table

3. **Monitor for Retell API errors:**
   - Check `/api/retell/outbound-call` logs
   - Look for timeout or error responses

## Architecture

### Current Flow
1. User clicks "Call Me Now" on `/onboard/call-choice`
2. Frontend → `/api/retell/outbound-call`
3. Backend → Retell API `/v2/create-phone-call`
4. Retell returns `call_id`
5. **❌ MISSING:** Retell → Webhook → Update status
6. Frontend shows "busy" fallback (because status never updates)

### Fixed Flow (After Webhook Configuration)
1. User clicks "Call Me Now"
2. Frontend → `/api/retell/outbound-call`
3. Backend → Retell API
4. Retell returns `call_id`
5. **✅ Retell → `/api/retell/webhook` → Update status to "connected"**
6. User answers call
7. **✅ Retell → `/api/retell/webhook` → Update status to "completed"**
8. Frontend shows success and redirects

## Additional Improvements

After webhooks are configured, consider implementing:

1. **Polling Fallback:** Frontend polls call status as backup
2. **Better Error Messages:** Update "busy" fallback to be more accurate
3. **Webhook Logging:** Track all webhook events in database
4. **Admin Dashboard:** Monitor call success rate and webhook health

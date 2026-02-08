# Retell AI Call Service - Fix Instructions

## Problem
Retell webhooks are failing because the webhook secret is not configured.

## Fix Steps (5-10 minutes)

### Step 1: Get Your Webhook Secret from Retell Dashboard

1. Go to the Retell dashboard: https://dashboard.retellai.com
2. Navigate to: **Settings** → **Webhooks**
3. You should see your webhook configuration with URL: `https://www.probatedesk.com/api/retell/webhook`
4. **IMPORTANT**: Look for the "Webhook Secret" - it will look like: `whsec_xxxxxxxxxxxxxxxxxxxxx`
5. **Copy this secret** (you'll need it in Step 2)

**Note**: If you don't see a webhook secret:
- You may need to regenerate it or create a new webhook
- Make sure the webhook is enabled and active

### Step 2: Update Your Production Environment Variables

#### Option A: Via Vercel Dashboard (Recommended for Production)

1. Go to: https://vercel.com/dashboard
2. Select your **probatedesk** project
3. Go to: **Settings** → **Environment Variables**
4. Find `RETELL_WEBHOOK_SECRET` or add it if missing:
   - **Name**: `RETELL_WEBHOOK_SECRET`
   - **Value**: `whsec_xxxxxxxxxxxxxxxxxxxxx` (paste the secret from Step 1)
   - **Environments**: Check all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your application (Vercel → Deployments → Redeploy latest)

#### Option B: Via Vercel CLI (Alternative)

```bash
# Set the production environment variable
vercel env add RETELL_WEBHOOK_SECRET production
# Paste your secret when prompted: whsec_xxxxxxxxxxxxxxxxxxxxx

# Redeploy
vercel --prod
```

### Step 3: Fix Webhook URL Mismatch

The webhook URL in your Retell dashboard uses `www.probatedesk.com` but your app is at `probatedesk.com`.

**Fix in Retell Dashboard:**
1. Go to: Retell Dashboard → Settings → Webhooks
2. Change the webhook URL from:
   - ❌ `https://www.probatedesk.com/api/retell/webhook`
   - ✅ `https://probatedesk.com/api/retell/webhook` (remove www)
3. Save the changes

**OR fix your DNS** to ensure `www.probatedesk.com` redirects to `probatedesk.com`

### Step 4: Test the Fix

1. Wait 1-2 minutes for the deployment to complete
2. Visit: https://probatedesk.com/onboard/call-choice
3. Click **"Call Me Now"**
4. You should receive a call within 5-10 seconds

### Step 5: Verify It's Working

Check your Vercel logs to confirm webhooks are being received:

```bash
vercel logs --follow
```

**Expected logs:**
```
[retell/webhook] ✅ Signature verified successfully
[retell/webhook] ✅ Received event: call_started
[retell/webhook] Call started: call_xxxxx
[retell/webhook] ✅ Received event: call_ended
[retell/webhook] ✅ SUCCESS - Call ended
```

## Current Environment Status

✅ RETELL_API_KEY = `key_b9cc94bfa2c8830a2a1502a0b852` (configured)
✅ RETELL_AGENT_ID = `agent_f08ce7ff2c30259d92d0e8146c` (configured)
✅ RETELL_PHONE_NUMBER = `+16046703534` (configured)
❌ **RETELL_WEBHOOK_SECRET = (MISSING - MUST ADD THIS!)**

## Troubleshooting

### Still not working after these steps?

1. **Check webhook deliveries in Retell dashboard:**
   - Look for webhook delivery logs/history
   - Check if webhooks are returning 401 or 500 errors

2. **Verify the secret is correct:**
   - Copy it again from Retell dashboard
   - Make sure there are no extra spaces
   - Secret should start with `whsec_`

3. **Check Vercel deployment:**
   - Confirm the environment variable was saved
   - Confirm you redeployed after adding the variable

4. **Test webhook manually:**
   - Use the Retell dashboard's "Send Test Webhook" feature if available
   - Check Vercel logs for incoming requests

## Need Help?

If you're still stuck after following these steps, check:
- Retell API status: https://status.retellai.com
- Vercel deployment logs for any errors
- Your Retell agent configuration (should be active)

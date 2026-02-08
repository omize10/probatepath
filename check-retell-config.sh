#!/bin/bash

echo "=================================================="
echo "  Retell Configuration Diagnostic"
echo "=================================================="
echo ""

# Check local .env file
echo "📋 Checking local .env file..."
echo ""

if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    exit 1
fi

echo "Local Environment Variables:"
echo "----------------------------"
grep "RETELL_" .env | while read -r line; do
    var_name=$(echo "$line" | cut -d'=' -f1)
    var_value=$(echo "$line" | cut -d'=' -f2-)

    if [ -z "$var_value" ]; then
        echo "❌ $var_name = (EMPTY - NOT SET!)"
    elif [ "$var_name" = "RETELL_API_KEY" ] || [ "$var_name" = "RETELL_WEBHOOK_SECRET" ]; then
        # Mask sensitive values
        prefix="${var_value:0:8}"
        echo "✅ $var_name = ${prefix}... (${#var_value} chars)"
    else
        echo "✅ $var_name = $var_value"
    fi
done

echo ""
echo "=================================================="
echo "📡 Checking Production (Vercel) Environment..."
echo "=================================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not installed. Install with: npm i -g vercel"
    echo ""
    echo "To check production config manually:"
    echo "1. Go to https://vercel.com/dashboard"
    echo "2. Select your project"
    echo "3. Go to Settings → Environment Variables"
    echo "4. Verify these are set:"
    echo "   - RETELL_API_KEY"
    echo "   - RETELL_AGENT_ID"
    echo "   - RETELL_PHONE_NUMBER"
    echo "   - RETELL_WEBHOOK_SECRET (CRITICAL!)"
else
    echo "Fetching production environment variables..."
    echo ""

    # Try to get production env vars
    vercel env ls production 2>/dev/null | grep RETELL || echo "⚠️  Could not fetch production env vars. Make sure you're logged in: vercel login"
fi

echo ""
echo "=================================================="
echo "🔍 Testing Production Health Endpoint..."
echo "=================================================="
echo ""

# Test the health endpoint
HEALTH_URL="https://probatedesk.com/api/retell/health"
echo "Fetching: $HEALTH_URL"
echo ""

if command -v curl &> /dev/null; then
    response=$(curl -s "$HEALTH_URL")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
else
    echo "⚠️  curl not installed, skipping health check"
    echo "Visit manually: $HEALTH_URL"
fi

echo ""
echo "=================================================="
echo "📝 Summary & Next Steps"
echo "=================================================="
echo ""
echo "If you see ❌ EMPTY values above:"
echo "1. Get webhook secret from Retell dashboard"
echo "2. Add to Vercel: Settings → Environment Variables"
echo "3. Add RETELL_WEBHOOK_SECRET=whsec_xxxxx"
echo "4. Redeploy your app"
echo ""
echo "For detailed instructions, see: RETELL_FIX_STEPS.md"
echo ""

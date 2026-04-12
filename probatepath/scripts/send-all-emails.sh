#!/usr/bin/env bash
# Fires one test delivery of each of the 14 branded templates to the
# session test address. Requires the temporary /api/ops/dev/test-walker
# cookie helper to still be live.
set -euo pipefail

BASE="https://www.probatedesk.com"
KEY="walker-2026-04-12-self-destruct-key-b7f3a1c9d4e2"
TO="omarkebrahim+emailtest@gmail.com"
COOKIE_JAR=/tmp/pd-ops-cookie.txt

# Mint ops_auth cookie via the walker helper
curl -sS -c "$COOKIE_JAR" "${BASE}/api/ops/dev/test-walker?cookie=${KEY}" >/dev/null

TEMPLATES=(
  welcome
  intake_submitted
  resume_token
  password_reset_code
  verification_code
  magic_link
  generic_reminder
  packet_ready
  probate_package_ready
  probate_filing_ready
  grant_checkin
  abandoned_call_1h
  abandoned_call_24h
  abandoned_call_3d
)

ok=0
fail=0
for key in "${TEMPLATES[@]}"; do
  res=$(curl -sS -b "$COOKIE_JAR" -X POST "${BASE}/api/ops/messages/test" \
    -H "content-type: application/json" \
    -d "{\"key\":\"${key}\",\"email\":\"${TO}\"}")
  if echo "$res" | grep -q '"success":true'; then
    printf "  %-22s ✓\n" "$key"
    ok=$((ok+1))
  else
    printf "  %-22s ✗ %s\n" "$key" "$res"
    fail=$((fail+1))
  fi
done

echo
echo "== ${ok}/${#TEMPLATES[@]} templates sent, ${fail} failed =="

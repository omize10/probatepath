#!/usr/bin/env bash
# Requests each probate P-form for the test matter via the
# /api/forms/generated/[formId]/[matterId] endpoint using the ops_auth
# cookie (minted by the temporary test-walker helper). Saves the PDFs to
# /tmp/pd-pforms/ and reports bytes + content-type.
#
# TEST DATA ONLY — this walks the synthetic test matter. See CLAUDE.md.
set -euo pipefail

BASE="https://www.probatedesk.com"
KEY="walker-2026-04-12-self-destruct-key-b7f3a1c9d4e2"
MATTER="cmnv1x0nf000104l14ap3jxng"
OUT=/tmp/pd-pforms
COOKIE_JAR=/tmp/pd-pforms-cookie.txt
mkdir -p "$OUT"

# Mint ops_auth cookie
curl -sS -c "$COOKIE_JAR" "${BASE}/api/ops/dev/test-walker?cookie=${KEY}" >/dev/null

# Canonical set the app generates for a probate package
FORMS=(P1 P2 P3 P9 P10 P5)

ok=0
fail=0
for form in "${FORMS[@]}"; do
  file="${OUT}/${form}.bin"
  http=$(curl -sS -b "$COOKIE_JAR" -o "$file" -w "%{http_code}|%{content_type}|%{size_download}" \
    "${BASE}/api/forms/generated/${form}/${MATTER}")
  code="${http%%|*}"
  rest="${http#*|}"
  ct="${rest%%|*}"
  size="${rest##*|}"
  if [ "$code" = "200" ]; then
    printf "  %-6s %s  %s bytes  %s\n" "$form" "$code" "$size" "$ct"
    ok=$((ok+1))
  else
    printf "  %-6s %s  %s\n" "$form" "$code" "$(head -c 200 "$file")"
    fail=$((fail+1))
  fi
done

echo
echo "== ${ok}/${#FORMS[@]} forms generated, ${fail} failed =="
ls -lh "$OUT"

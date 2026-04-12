#!/usr/bin/env bash
# Drives the full state-machine walk by calling the temporary test-walker
# endpoint between walker runs.
#
# USAGE: bash scripts/walk-all-states.sh
# OUTPUT: /tmp/pd-states/<state>__<page>.png
#
# TEMPORARY — depends on the self-destructing
# /api/ops/dev/test-walker route (see CLAUDE.md).
set -euo pipefail

BASE="https://www.probatedesk.com"
KEY="walker-2026-04-12-self-destruct-key-b7f3a1c9d4e2"
MATTER="cmnv1x0nf000104l14ap3jxng"
H="x-test-key: ${KEY}"

flip() {
  local payload="$1"
  curl -sS -X POST "${BASE}/api/ops/dev/test-walker" \
    -H "${H}" -H "content-type: application/json" \
    -d "${payload}" | head -c 200
  echo
}

walk() {
  local state="$1"
  echo "== ${state} =="
  node scripts/walk-one-state.mjs "${state}" 2>&1 | sed 's/^/  /'
}

# 1. intake_complete — reset everything
flip "{\"matterId\":\"${MATTER}\",\"status\":\"intake_complete\",\"fields\":{\"willSearchMailedAt\":null,\"noticesMailedAt\":null,\"p1MailedAt\":null,\"probatePackagePreparedAt\":null,\"probateFiledAt\":null,\"grantIssuedAt\":null,\"grantUploadedAt\":null,\"grantDocumentUrl\":null,\"courtFileNumber\":null}}"
walk intake_complete

# 2. will_search_prepping
flip "{\"matterId\":\"${MATTER}\",\"status\":\"will_search_prepping\"}"
walk will_search_prepping

# 3. will_search_ready
flip "{\"matterId\":\"${MATTER}\",\"status\":\"will_search_ready\",\"fields\":{\"willSearchPackageReady\":true}}"
walk will_search_ready

# 4. will_search_sent
flip "{\"matterId\":\"${MATTER}\",\"status\":\"will_search_sent\",\"fields\":{\"willSearchMailedAt\":\"2026-04-01T12:00:00Z\"}}"
walk will_search_sent

# 5. notices_in_progress
flip "{\"matterId\":\"${MATTER}\",\"status\":\"notices_in_progress\",\"fields\":{\"p1NoticesReady\":true}}"
walk notices_in_progress

# 6. notices_waiting_21_days
flip "{\"matterId\":\"${MATTER}\",\"status\":\"notices_waiting_21_days\",\"fields\":{\"noticesMailedAt\":\"2026-03-25T12:00:00Z\",\"p1MailedAt\":\"2026-03-25T12:00:00Z\",\"p1Mailed\":true}}"
walk notices_waiting_21_days

# 7. probate_package_prepping
flip "{\"matterId\":\"${MATTER}\",\"status\":\"probate_package_prepping\"}"
walk probate_package_prepping

# 8. probate_package_ready
flip "{\"matterId\":\"${MATTER}\",\"status\":\"probate_package_ready\",\"fields\":{\"probatePackagePreparedAt\":\"2026-04-10T12:00:00Z\",\"standardProbatePackageReady\":true}}"
walk probate_package_ready

# 9. probate_filing_ready
flip "{\"matterId\":\"${MATTER}\",\"status\":\"probate_filing_ready\"}"
walk probate_filing_ready

# 10. probate_filing_in_progress
flip "{\"matterId\":\"${MATTER}\",\"status\":\"probate_filing_in_progress\"}"
walk probate_filing_in_progress

# 11. probate_filed
flip "{\"matterId\":\"${MATTER}\",\"status\":\"probate_filed\",\"fields\":{\"probateFiledAt\":\"2026-04-11T12:00:00Z\",\"courtFileNumber\":\"VA-TEST-2026-0001\"}}"
walk probate_filed

# 12. waiting_for_grant
flip "{\"matterId\":\"${MATTER}\",\"status\":\"waiting_for_grant\"}"
walk waiting_for_grant

# 13. grant_complete
flip "{\"matterId\":\"${MATTER}\",\"status\":\"grant_complete\",\"fields\":{\"grantIssuedAt\":\"2026-04-12T12:00:00Z\",\"grantUploadedAt\":\"2026-04-12T12:00:00Z\",\"grantDocumentUrl\":\"test-data/grant.pdf\"}}"
walk grant_complete

echo "done"

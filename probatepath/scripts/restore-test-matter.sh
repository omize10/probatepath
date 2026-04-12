#!/usr/bin/env bash
# Resets the synthetic walker test matter back to its pre-session state:
# portalStatus = intake_complete, all date fields NULL, intake draft
# unsubmitted.
#
# TEST DATA LIFECYCLE — see CLAUDE.md "Test data & operator scripts".
set -euo pipefail

BASE="https://www.probatedesk.com"
KEY="walker-2026-04-12-self-destruct-key-b7f3a1c9d4e2"
MATTER="cmnv1x0nf000104l14ap3jxng"

echo "Restoring ${MATTER} to intake_complete..."
curl -sS -X POST "${BASE}/api/ops/dev/test-walker" \
  -H "x-test-key: ${KEY}" -H "content-type: application/json" \
  -d "{\"matterId\":\"${MATTER}\",\"status\":\"intake_complete\",\"draftSubmittedAt\":null,\"fields\":{\"willSearchMailedAt\":null,\"noticesMailedAt\":null,\"p1MailedAt\":null,\"noticesPreparedAt\":null,\"willSearchPreparedAt\":null,\"probatePackagePreparedAt\":null,\"probateFiledAt\":null,\"grantIssuedAt\":null,\"grantUploadedAt\":null,\"grantDocumentUrl\":null,\"courtFileNumber\":null,\"willSearchPackageReady\":false,\"p1NoticesReady\":false,\"p1Mailed\":false,\"standardProbatePackageReady\":false}}"
echo
curl -sS "${BASE}/api/ops/dev/test-walker" -H "x-test-key: ${KEY}"
echo
echo "done"

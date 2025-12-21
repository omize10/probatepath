## Support webhook Apps Script (reference)

If the webhook is hit but no rows are added and you see errors like `ReferenceError: Hom is not defined` or HTML error pages, update the Google Apps Script backing the webhook URL to explicitly open the sheet by ID and respond with JSON.

Replace the Apps Script code with something like this (fill in your sheet ID):

```javascript
// Deploy as a Web App with "Anyone with the link" access and use the given URL as SUPPORT_SHEET_WEBHOOK_URL.

const SHEET_ID = "<YOUR_SHEET_ID_HERE>"; // e.g. the ID from https://docs.google.com/spreadsheets/d/<ID>/edit
const SHEET_NAME = "Support Logs";

function doPost(e) {
  try {
    const secret = e.parameter.secret;
    if (secret !== "<YOUR_SECRET_FROM_ENV>") {
      return jsonResponse({ ok: false, error: "Unauthorized" }, 401);
    }

    const payload = JSON.parse(e.postData.contents || "{}");
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) return jsonResponse({ ok: false, error: "Sheet not found" }, 500);

    sheet.appendRow([
      new Date(),
      payload.ticketId || "",
      payload.email || "",
      payload.userId || "",
      payload.pageUrl || "",
      payload.issueType || "",
      payload.severity || "",
      payload.message || "",
      payload.userAgent || "",
      "ok",
    ]);

    return jsonResponse({ ok: true }, 200);
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
}

function jsonResponse(body, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON)
    .setResponseCode(statusCode);
}
```

After updating the script, redeploy the Web App (new version) and keep the same URL if possible. Then re-run `/api/support/test` locally to confirm `{ ok: true }`.

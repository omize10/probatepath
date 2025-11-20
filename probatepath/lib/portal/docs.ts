const isBrowser = () => typeof window !== "undefined";

export function downloadDocHtml(filename: string, html: string) {
  if (!isBrowser()) return;
  const blob = new Blob([html], { type: "text/html" });
  triggerDownload(filename, blob);
}

export function downloadJson(filename: string, payload: unknown) {
  if (!isBrowser()) return;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  triggerDownload(filename, blob);
}

function triggerDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

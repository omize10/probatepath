"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type IssueType = "Intake" | "Upload" | "Portal" | "Payment" | "Ops" | "Other";
type Severity = "Low" | "Normal" | "High";

const allowedPrefixes = ["/intake", "/portal", "/ops", "/payment", "/checkout", "/upload"];
const issueOptions: IssueType[] = ["Intake", "Upload", "Portal", "Payment", "Ops", "Other"];
const severityOptions: Severity[] = ["Low", "Normal", "High"];

type FormState = {
  issueType: IssueType;
  severity: Severity;
  email: string;
  message: string;
};

type SupportWidgetProps = {
  placement?: "floating" | "inline";
};

export function SupportWidget({ placement = "floating" }: SupportWidgetProps) {
  const pathname = usePathname();
  const shouldRender = useMemo(() => {
    if (!pathname) return false;
    if (placement === "inline") return true;
    return allowedPrefixes.some((prefix) => pathname.startsWith(prefix));
  }, [pathname, placement]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    issueType: "Intake",
    severity: "Normal",
    email: "",
    message: "",
  });
  const [pageUrl, setPageUrl] = useState("");
  const [userAgent, setUserAgent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPageUrl(window.location.href);
    setUserAgent(window.navigator.userAgent);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      setForm({
        issueType: "Intake",
        severity: "Normal",
        email: "",
        message: "",
      });
      setTicketId(null);
      setError(null);
    }
  }, [open]);

  if (!shouldRender) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/support/complaint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim() || undefined,
          message: form.message.trim(),
          issueType: form.issueType,
          severity: form.severity,
          pageUrl,
          userAgent,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; ticketId?: string };
      if (process.env.NODE_ENV === "development") {
        console.debug("[support] submission response", data);
      }

      const success = res.ok && data?.ok === true;
      if (!success) {
        setTicketId(null);
        setError(data?.error || "Could not send. Try again later.");
        return;
      }

      setTicketId(data.ticketId ?? null);
      setForm({
        issueType: "Intake",
        severity: "Normal",
        email: "",
        message: "",
      });
    } catch (err) {
      console.error("[support] Failed to submit complaint", err);
      setError("Could not send. Try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = form.message.trim().length >= 10 && form.message.trim().length <= 2000 && !!pageUrl;

  const buttonClass =
    placement === "inline"
      ? "mt-2 rounded-full border border-[color:var(--border-muted)] bg-white px-5 py-2 text-sm font-semibold text-[color:var(--brand)] shadow-sm transition hover:bg-[color:var(--bg-muted)]"
      : "fixed bottom-6 right-4 z-[50] rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[color:var(--brand)] shadow-[0_18px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur md:right-6 md:top-1/2 md:bottom-auto md:-translate-y-1/2";

  return (
    <>
      <Button variant="secondary" size="sm" className={buttonClass} onClick={() => setOpen(true)}>
        Report a problem
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl border border-[color:var(--border-muted)] bg-white/95">
          <DialogHeader className="space-y-3">
            <DialogTitle className="font-serif text-2xl text-[color:var(--ink)]">Report a problem</DialogTitle>
            <DialogDescription className="text-sm text-[color:var(--ink-muted)]">
              Tell us what happened. We include the page link and your device details automatically so we can investigate quickly.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-muted)]">Issue type</Label>
                <select
                  className={cn(
                    "w-full rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] px-4 py-3 text-sm text-[color:var(--ink)] shadow-sm transition",
                    "hover:border-[rgba(15,26,42,0.35)] focus:border-[color:var(--brand)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(15,26,42,0.2)]"
                  )}
                  value={form.issueType}
                  onChange={(e) => setForm((prev) => ({ ...prev, issueType: e.target.value as IssueType }))}
                  required
                >
                  {issueOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-muted)]">Severity</Label>
                <select
                  className={cn(
                    "w-full rounded-2xl border border-[color:var(--border-muted)] bg-[color:var(--bg-surface)] px-4 py-3 text-sm text-[color:var(--ink)] shadow-sm transition",
                    "hover:border-[rgba(15,26,42,0.35)] focus:border-[color:var(--brand)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(15,26,42,0.2)]"
                  )}
                  value={form.severity}
                  onChange={(e) => setForm((prev) => ({ ...prev, severity: e.target.value as Severity }))}
                  required
                >
                  {severityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-muted)]">
                Email (optional)
              </Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-muted)]">
                What went wrong?
              </Label>
              <Textarea
                placeholder="Share details so we can help. Screenshots, steps taken, and error messages are useful."
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                rows={5}
                required
              />
              <p className="text-xs text-[color:var(--ink-muted)]">Min 10 characters. We&apos;ll attach this page: {pageUrl || "current page"}.</p>
            </div>

            {ticketId ? (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                Thanks. We got your report. We usually reply in 3 to 5 business days. Ticket ID: {ticketId}
              </div>
            ) : null}

            {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" className="text-[color:var(--ink-muted)]" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit || submitting}>
                {submitting ? "Sending..." : "Submit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

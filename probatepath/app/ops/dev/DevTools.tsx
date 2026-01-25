"use client";

import { useState } from "react";
import Link from "next/link";

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
}

function ResultBox({ result }: { result: TestResult | null }) {
  if (!result) return null;
  return (
    <div
      className={`mt-3 rounded-lg p-3 text-sm ${
        result.success ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
      }`}
    >
      <p className="font-medium">{result.success ? "Success" : "Error"}</p>
      <p>{result.message}</p>
      {result.data && (
        <pre className="mt-2 overflow-x-auto text-xs bg-white/50 p-2 rounded">{JSON.stringify(result.data, null, 2)}</pre>
      )}
    </div>
  );
}

function TestSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--border-muted)] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

const QUICK_LINKS = [
  { label: "Portal Home", href: "/portal", color: "blue" },
  { label: "Intake Start", href: "/intake", color: "green" },
  { label: "Will Search Page", href: "/portal/will-search", color: "purple" },
  { label: "P1 Notices Page", href: "/portal/p1-notices", color: "orange" },
  { label: "Probate Filing", href: "/portal/probate-filing", color: "red" },
  { label: "Post Grant", href: "/portal/post-grant", color: "indigo" },
  { label: "OPS Dashboard", href: "/ops", color: "slate" },
  { label: "Login Page", href: "/login", color: "gray" },
  { label: "Register Page", href: "/register", color: "gray" },
];

const PORTAL_STATUSES = [
  "intake_complete",
  "will_search_prepping",
  "will_search_ready",
  "will_search_sent",
  "notices_in_progress",
  "notices_waiting_21_days",
  "probate_package_prepping",
  "probate_package_ready",
  "probate_filing_ready",
  "probate_filing_in_progress",
  "probate_filed",
  "waiting_for_grant",
  "grant_complete",
  "post_grant_active",
  "estate_closeout",
  "done",
];

export function DevTools() {
  const [emailTo, setEmailTo] = useState("");
  const [emailResult, setEmailResult] = useState<TestResult | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const [smsTo, setSmsTo] = useState("");
  const [smsResult, setSmsResult] = useState<TestResult | null>(null);
  const [smsLoading, setSmsLoading] = useState(false);

  const [cronResult, setCronResult] = useState<TestResult | null>(null);
  const [cronLoading, setCronLoading] = useState(false);

  const [envResult, setEnvResult] = useState<TestResult | null>(null);
  const [envLoading, setEnvLoading] = useState(false);

  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetResult, setResetResult] = useState<TestResult | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const [statusCaseId, setStatusCaseId] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [statusResult, setStatusResult] = useState<TestResult | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [pathCaseId, setPathCaseId] = useState("");
  const [newPathType, setNewPathType] = useState<"probate" | "administration">("administration");
  const [pathResult, setPathResult] = useState<TestResult | null>(null);
  const [pathLoading, setPathLoading] = useState(false);

  const [casesResult, setCasesResult] = useState<TestResult | null>(null);
  const [casesLoading, setCasesLoading] = useState(false);

  const testEmail = async () => {
    if (!emailTo) return;
    setEmailLoading(true);
    setEmailResult(null);
    try {
      const res = await fetch("/api/ops/dev/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: emailTo }),
      });
      const data = await res.json();
      setEmailResult({
        success: res.ok,
        message: data.message || (res.ok ? "Email sent successfully" : "Failed to send email"),
        data: data,
      });
    } catch (err: any) {
      setEmailResult({ success: false, message: err.message || "Request failed" });
    } finally {
      setEmailLoading(false);
    }
  };

  const testSms = async () => {
    if (!smsTo) return;
    setSmsLoading(true);
    setSmsResult(null);
    try {
      const res = await fetch("/api/ops/dev/test-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: smsTo }),
      });
      const data = await res.json();
      setSmsResult({
        success: res.ok,
        message: data.message || (res.ok ? "SMS sent successfully" : "Failed to send SMS"),
        data: data,
      });
    } catch (err: any) {
      setSmsResult({ success: false, message: err.message || "Request failed" });
    } finally {
      setSmsLoading(false);
    }
  };

  const runCron = async () => {
    setCronLoading(true);
    setCronResult(null);
    try {
      const res = await fetch("/api/ops/dev/run-cron", {
        method: "POST",
      });
      const data = await res.json();
      setCronResult({
        success: res.ok,
        message: res.ok ? "Cron job executed" : "Cron job failed",
        data: data,
      });
    } catch (err: any) {
      setCronResult({ success: false, message: err.message || "Request failed" });
    } finally {
      setCronLoading(false);
    }
  };

  const checkEnv = async () => {
    setEnvLoading(true);
    setEnvResult(null);
    try {
      const res = await fetch("/api/ops/dev/check-env");
      const data = await res.json();
      setEnvResult({
        success: res.ok,
        message: "Environment check complete",
        data: data,
      });
    } catch (err: any) {
      setEnvResult({ success: false, message: err.message || "Request failed" });
    } finally {
      setEnvLoading(false);
    }
  };

  const resetUserPassword = async () => {
    if (!resetEmail || !resetPassword) return;
    setResetLoading(true);
    setResetResult(null);
    try {
      const res = await fetch("/api/ops/dev/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, newPassword: resetPassword }),
      });
      const data = await res.json();
      setResetResult({
        success: res.ok,
        message: data.message || (res.ok ? "Password reset successfully" : "Failed to reset password"),
        data: data,
      });
    } catch (err: any) {
      setResetResult({ success: false, message: err.message || "Request failed" });
    } finally {
      setResetLoading(false);
    }
  };

  const updatePortalStatus = async () => {
    if (!statusCaseId || !newStatus) return;
    setStatusLoading(true);
    setStatusResult(null);
    try {
      const res = await fetch("/api/ops/dev/set-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matterId: statusCaseId, status: newStatus }),
      });
      const data = await res.json();
      setStatusResult({
        success: res.ok,
        message: data.message || (res.ok ? "Status updated" : "Failed to update status"),
        data: data,
      });
    } catch (err: any) {
      setStatusResult({ success: false, message: err.message || "Request failed" });
    } finally {
      setStatusLoading(false);
    }
  };

  const updatePathType = async () => {
    if (!pathCaseId) return;
    setPathLoading(true);
    setPathResult(null);
    try {
      const res = await fetch("/api/ops/dev/set-path-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matterId: pathCaseId, pathType: newPathType }),
      });
      const data = await res.json();
      setPathResult({
        success: res.ok,
        message: data.message || (res.ok ? `Path type set to ${newPathType}` : "Failed to update path type"),
        data: data,
      });
    } catch (err: any) {
      setPathResult({ success: false, message: err.message || "Request failed" });
    } finally {
      setPathLoading(false);
    }
  };

  const listCases = async () => {
    setCasesLoading(true);
    setCasesResult(null);
    try {
      const res = await fetch("/api/ops/dev/list-cases");
      const data = await res.json();
      setCasesResult({
        success: res.ok,
        message: `Found ${data.cases?.length || 0} cases`,
        data: data,
      });
    } catch (err: any) {
      setCasesResult({ success: false, message: err.message || "Request failed" });
    } finally {
      setCasesLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Quick Navigation */}
      <div className="rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50 p-6">
        <h2 className="text-lg font-semibold text-purple-900">Quick Navigation</h2>
        <p className="mt-1 text-sm text-purple-700">Jump to any page in the app</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-purple-300 bg-white px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-100 transition"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Email Test */}
        <TestSection title="Test Email" description="Send a test email via Resend">
          <div className="space-y-3">
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              onClick={testEmail}
              disabled={emailLoading || !emailTo}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {emailLoading ? "Sending..." : "Send Test Email"}
            </button>
            <ResultBox result={emailResult} />
          </div>
        </TestSection>

        {/* SMS Test */}
        <TestSection title="Test SMS" description="Send a test SMS via Twilio">
          <div className="space-y-3">
            <input
              type="tel"
              value={smsTo}
              onChange={(e) => setSmsTo(e.target.value)}
              placeholder="+1234567890"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              onClick={testSms}
              disabled={smsLoading || !smsTo}
              className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {smsLoading ? "Sending..." : "Send Test SMS"}
            </button>
            <ResultBox result={smsResult} />
          </div>
        </TestSection>

        {/* Cron Test */}
        <TestSection title="Run Cron Job" description="Manually trigger the daily cron job">
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              This runs the same job that executes daily: processes reminders, grant check-ins, and cleans up tokens.
            </p>
            <button
              onClick={runCron}
              disabled={cronLoading}
              className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {cronLoading ? "Running..." : "Run Cron Now"}
            </button>
            <ResultBox result={cronResult} />
          </div>
        </TestSection>

        {/* Env Check */}
        <TestSection title="Check Environment" description="Verify all required env vars are configured">
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Checks if RESEND_API_KEY, Twilio credentials, and other required variables are set.
            </p>
            <button
              onClick={checkEnv}
              disabled={envLoading}
              className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {envLoading ? "Checking..." : "Check Environment"}
            </button>
            <ResultBox result={envResult} />
          </div>
        </TestSection>

        {/* Password Reset */}
        <TestSection title="Reset User Password" description="Reset any user's password by email">
          <div className="space-y-3">
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              onClick={resetUserPassword}
              disabled={resetLoading || !resetEmail || !resetPassword}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {resetLoading ? "Resetting..." : "Reset Password"}
            </button>
            <ResultBox result={resetResult} />
          </div>
        </TestSection>

        {/* Set Portal Status */}
        <TestSection title="Set Portal Status" description="Change a case's portal status directly">
          <div className="space-y-3">
            <input
              type="text"
              value={statusCaseId}
              onChange={(e) => setStatusCaseId(e.target.value)}
              placeholder="Case ID (UUID)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
            />
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select status...</option>
              {PORTAL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              onClick={updatePortalStatus}
              disabled={statusLoading || !statusCaseId || !newStatus}
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {statusLoading ? "Updating..." : "Set Status"}
            </button>
            <ResultBox result={statusResult} />
          </div>
        </TestSection>

        {/* Set Path Type (Probate vs Administration) */}
        <TestSection title="Set Path Type" description="Switch between Probate and Administration">
          <div className="space-y-3">
            <input
              type="text"
              value={pathCaseId}
              onChange={(e) => setPathCaseId(e.target.value)}
              placeholder="Case ID (UUID)"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono"
            />
            <div className="flex gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pathType"
                  value="probate"
                  checked={newPathType === "probate"}
                  onChange={() => setNewPathType("probate")}
                  className="text-blue-600"
                />
                <span className="text-sm">Probate (has will)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="pathType"
                  value="administration"
                  checked={newPathType === "administration"}
                  onChange={() => setNewPathType("administration")}
                  className="text-amber-600"
                />
                <span className="text-sm">Administration (no will)</span>
              </label>
            </div>
            <button
              onClick={updatePathType}
              disabled={pathLoading || !pathCaseId}
              className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
            >
              {pathLoading ? "Updating..." : "Set Path Type"}
            </button>
            <ResultBox result={pathResult} />
          </div>
        </TestSection>

        {/* List Cases */}
        <TestSection title="List All Cases" description="Get a list of all cases with IDs">
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Useful for getting case IDs to use with other dev tools.
            </p>
            <button
              onClick={listCases}
              disabled={casesLoading}
              className="rounded-full bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {casesLoading ? "Loading..." : "List Cases"}
            </button>
            <ResultBox result={casesResult} />
          </div>
        </TestSection>
      </div>
    </div>
  );
}

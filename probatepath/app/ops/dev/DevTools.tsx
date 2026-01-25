"use client";

import { useState } from "react";

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

  return (
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
    </div>
  );
}

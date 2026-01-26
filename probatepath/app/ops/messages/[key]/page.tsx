'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Send, Mail, MessageSquare, CheckCircle, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Template {
  key: string;
  name: string;
  description?: string;
  category?: string;
  emailSubject: string;
  emailHtml: string;
  emailPlainText?: string | null;
  smsBody?: string | null;
  smsEnabled: boolean;
  availableVariables?: string[];
  variableDescriptions?: Record<string, string>;
  active?: boolean;
  isCustomized?: boolean;
}

export default function TemplateEditorPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = use(params);
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailHtml, setEmailHtml] = useState('');
  const [smsBody, setSmsBody] = useState('');
  const [smsEnabled, setSmsEnabled] = useState(false);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<{ emailSubject: string; emailHtml: string; smsBody?: string } | null>(
    null
  );

  // Test send state
  const [showTest, setShowTest] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchTemplate();
  }, [key]);

  async function fetchTemplate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/ops/messages/${key}`);
      if (!res.ok) throw new Error('Failed to fetch template');
      const data = await res.json();
      setTemplate(data.template);
      setEmailSubject(data.template.emailSubject);
      setEmailHtml(data.template.emailHtml);
      setSmsBody(data.template.smsBody || '');
      setSmsEnabled(data.template.smsEnabled);

      // Initialize preview variables
      const vars: Record<string, string> = {};
      (data.template.availableVariables || []).forEach((v: string) => {
        vars[v] = getSampleValue(v);
      });
      setPreviewVariables(vars);
    } catch (err) {
      setError('Failed to load template');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function getSampleValue(varName: string): string {
    const samples: Record<string, string> = {
      name: 'John Smith',
      portalLink: 'https://probatedesk.com/portal',
      resumeLink: 'https://probatedesk.com/resume/abc123',
      link: 'https://probatedesk.com/link/xyz789',
      code: '123456',
      url: 'https://probatedesk.com/signin/test',
      paymentUrl: 'https://probatedesk.com/pay?token=test',
      deceasedName: 'Jane Smith',
    };
    return samples[varName] || `{{${varName}}}`;
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/ops/messages/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailSubject,
          emailHtml,
          smsBody: smsBody || null,
          smsEnabled,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSuccess('Template saved successfully');
      fetchTemplate(); // Refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setSaving(false);
    }
  }

  async function handlePreview() {
    try {
      const res = await fetch('/api/ops/messages/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, variables: previewVariables }),
      });
      const data = await res.json();
      setPreview(data.preview);
      setShowPreview(true);
    } catch (err) {
      setError('Failed to generate preview');
    }
  }

  async function handleTestSend() {
    if (!testEmail && !testPhone) {
      setTestResult({ success: false, message: 'Enter an email or phone number' });
      return;
    }

    try {
      const res = await fetch('/api/ops/messages/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          email: testEmail || undefined,
          phone: testPhone || undefined,
          variables: previewVariables,
        }),
      });
      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message || data.error || 'Unknown result',
      });
    } catch (err) {
      setTestResult({ success: false, message: 'Failed to send test' });
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-[color:var(--muted-ink)]">Loading...</div>;
  }

  if (!template) {
    return <div className="py-12 text-center text-red-600">Template not found</div>;
  }

  const smsCharCount = smsBody.length;
  const smsSegments = Math.ceil(smsCharCount / 160) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/ops/messages">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-[color:var(--brand)]">
              {template.name}
            </h1>
            <p className="text-sm text-[color:var(--muted-ink)]">
              {template.key} - {template.description}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="mr-1 h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" onClick={() => setShowTest(!showTest)}>
            <Send className="mr-1 h-4 w-4" />
            Test
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-1 h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          <CheckCircle className="inline h-4 w-4 mr-1" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="col-span-2 space-y-6">
          {/* Email section */}
          <div className="rounded-xl border border-[color:var(--border-muted)] bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-[color:var(--brand)]" />
              <h2 className="font-semibold text-[color:var(--brand)]">Email</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[color:var(--brand)] mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full rounded-lg border border-[color:var(--border-muted)] px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[color:var(--brand)] mb-1">
                  HTML Body
                </label>
                <textarea
                  value={emailHtml}
                  onChange={(e) => setEmailHtml(e.target.value)}
                  rows={15}
                  className="w-full rounded-lg border border-[color:var(--border-muted)] px-3 py-2 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* SMS section */}
          <div className="rounded-xl border border-[color:var(--border-muted)] bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[color:var(--brand)]" />
                <h2 className="font-semibold text-[color:var(--brand)]">SMS</h2>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={smsEnabled}
                  onChange={(e) => setSmsEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-[color:var(--muted-ink)]">Enabled</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-[color:var(--brand)] mb-1">
                Message Body
              </label>
              <textarea
                value={smsBody}
                onChange={(e) => setSmsBody(e.target.value)}
                rows={4}
                disabled={!smsEnabled}
                className={`w-full rounded-lg border border-[color:var(--border-muted)] px-3 py-2 ${
                  !smsEnabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                }`}
                placeholder={smsEnabled ? 'Enter SMS message...' : 'Enable SMS to edit'}
              />
              <p className="mt-1 text-xs text-[color:var(--muted-ink)]">
                {smsCharCount} characters ({smsSegments} SMS segment{smsSegments > 1 ? 's' : ''})
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Variables reference */}
          <div className="rounded-xl border border-[color:var(--border-muted)] bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-[color:var(--brand)]" />
              <h2 className="font-semibold text-[color:var(--brand)]">Variables</h2>
            </div>

            <div className="space-y-2">
              {(template.availableVariables || []).map((v) => (
                <div key={v} className="text-sm">
                  <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-[color:var(--brand)]">
                    {`{{${v}}}`}
                  </code>
                  <p className="text-xs text-[color:var(--muted-ink)] mt-0.5">
                    {template.variableDescriptions?.[v] || v}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Preview variables */}
          <div className="rounded-xl border border-[color:var(--border-muted)] bg-white p-6">
            <h2 className="font-semibold text-[color:var(--brand)] mb-4">Preview Data</h2>

            <div className="space-y-3">
              {(template.availableVariables || []).map((v) => (
                <div key={v}>
                  <label className="block text-xs font-medium text-[color:var(--muted-ink)] mb-1">
                    {v}
                  </label>
                  <input
                    type="text"
                    value={previewVariables[v] || ''}
                    onChange={(e) =>
                      setPreviewVariables((prev) => ({ ...prev, [v]: e.target.value }))
                    }
                    className="w-full rounded-lg border border-[color:var(--border-muted)] px-2 py-1 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Test send */}
          {showTest && (
            <div className="rounded-xl border border-[color:var(--border-muted)] bg-white p-6">
              <h2 className="font-semibold text-[color:var(--brand)] mb-4">Send Test</h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[color:var(--muted-ink)] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                    className="w-full rounded-lg border border-[color:var(--border-muted)] px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[color:var(--muted-ink)] mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="604-555-1234"
                    className="w-full rounded-lg border border-[color:var(--border-muted)] px-2 py-1 text-sm"
                  />
                </div>

                {testResult && (
                  <div
                    className={`rounded-lg p-2 text-xs ${
                      testResult.success
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {testResult.message}
                  </div>
                )}

                <Button size="sm" onClick={handleTestSend} className="w-full">
                  Send Test
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[color:var(--brand)]">Preview</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                Close
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-[color:var(--muted-ink)] mb-1">
                  Email Subject
                </p>
                <p className="font-medium text-[color:var(--brand)]">{preview.emailSubject}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-[color:var(--muted-ink)] mb-1">
                  Email Body
                </p>
                <div
                  className="rounded-lg border border-[color:var(--border-muted)] p-4"
                  dangerouslySetInnerHTML={{ __html: preview.emailHtml }}
                />
              </div>

              {preview.smsBody && (
                <div>
                  <p className="text-xs font-medium text-[color:var(--muted-ink)] mb-1">SMS</p>
                  <div className="rounded-lg bg-green-50 p-4 text-sm">{preview.smsBody}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, CheckCircle, XCircle, Edit, Send, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Template {
  key: string;
  name: string;
  description?: string;
  category?: string;
  emailSubject: string;
  smsBody?: string | null;
  smsEnabled: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  transactional: 'Transactional',
  reminder: 'Reminder',
  recovery: 'Recovery',
  auth: 'Auth',
};

const CATEGORY_COLORS: Record<string, string> = {
  transactional: 'bg-blue-100 text-blue-800',
  reminder: 'bg-green-100 text-green-800',
  recovery: 'bg-orange-100 text-orange-800',
  auth: 'bg-purple-100 text-purple-800',
};

export default function MessagesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [testingTemplate, setTestingTemplate] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const res = await fetch('/api/ops/messages');
      if (!res.ok) throw new Error('Failed to fetch templates');
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (err) {
      setError('Failed to load templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTestSend(key: string) {
    if (!testEmail && !testPhone) {
      setTestResult({ success: false, message: 'Enter an email or phone number' });
      return;
    }

    try {
      const res = await fetch('/api/ops/messages/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, email: testEmail || undefined, phone: testPhone || undefined }),
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

  const filteredTemplates = filter === 'all'
    ? templates
    : templates.filter((t) => t.category === filter);

  const smsEnabledCount = templates.filter((t) => t.smsEnabled).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-[color:var(--brand)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[color:var(--brand)]">
            Message Templates
          </h1>
          <p className="text-sm text-[color:var(--muted-ink)]">
            Manage email and SMS templates
          </p>
        </div>
        <Link href="/ops/messages/logs">
          <Button variant="outline">View Logs</Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4">
          <p className="text-sm text-[color:var(--muted-ink)]">Total Templates</p>
          <p className="text-2xl font-semibold text-[color:var(--brand)]">{templates.length}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4">
          <p className="text-sm text-[color:var(--muted-ink)]">With Email</p>
          <p className="text-2xl font-semibold text-[color:var(--brand)]">{templates.length}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4">
          <p className="text-sm text-[color:var(--muted-ink)]">With SMS</p>
          <p className="text-2xl font-semibold text-[color:var(--brand)]">{smsEnabledCount}</p>
        </div>
        <div className="rounded-xl border border-[color:var(--border-muted)] bg-white p-4">
          <p className="text-sm text-[color:var(--muted-ink)]">SMS Disabled</p>
          <p className="text-2xl font-semibold text-[color:var(--muted-ink)]">
            {templates.length - smsEnabledCount}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'transactional', 'reminder', 'recovery', 'auth'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === cat
                ? 'bg-[color:var(--brand)] text-white'
                : 'bg-[color:var(--bg-muted)] text-[color:var(--muted-ink)] hover:bg-gray-200'
            }`}
          >
            {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Templates table */}
      <div className="overflow-hidden rounded-xl border border-[color:var(--border-muted)] bg-white">
        <table className="w-full">
          <thead className="border-b border-[color:var(--border-muted)] bg-[color:var(--bg-muted)]">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[color:var(--brand)]">
                Template
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[color:var(--brand)]">
                Category
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-[color:var(--brand)]">
                Email
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-[color:var(--brand)]">
                SMS
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[color:var(--brand)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border-muted)]">
            {filteredTemplates.map((template) => (
              <tr key={template.key} className="hover:bg-[color:var(--bg-muted)]/50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-[color:var(--brand)]">{template.name}</p>
                    <p className="text-xs text-[color:var(--muted-ink)]">{template.key}</p>
                    {template.description && (
                      <p className="mt-1 text-xs text-[color:var(--muted-ink)]">
                        {template.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      CATEGORY_COLORS[template.category || 'transactional']
                    }`}
                  >
                    {CATEGORY_LABELS[template.category || 'transactional']}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Mail className="mx-auto h-5 w-5 text-green-600" />
                </td>
                <td className="px-4 py-3 text-center">
                  {template.smsEnabled ? (
                    <MessageSquare className="mx-auto h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="mx-auto h-5 w-5 text-[color:var(--text-tertiary)]" />
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/ops/messages/${template.key}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTestingTemplate(testingTemplate === template.key ? null : template.key);
                        setTestResult(null);
                      }}
                    >
                      <Send className="mr-1 h-4 w-4" />
                      Test
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Test send modal */}
      {testingTemplate && (
        <div className="rounded-xl border border-[color:var(--border-muted)] bg-white p-6">
          <h3 className="font-semibold text-[color:var(--brand)]">
            Test: {templates.find((t) => t.key === testingTemplate)?.name}
          </h3>
          <p className="text-sm text-[color:var(--muted-ink)] mb-4">
            Send a test message to yourself
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[color:var(--brand)] mb-1">
                Email
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full rounded-lg border border-[color:var(--border-muted)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[color:var(--brand)] mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="604-555-1234"
                className="w-full rounded-lg border border-[color:var(--border-muted)] px-3 py-2 text-sm"
              />
            </div>
          </div>

          {testResult && (
            <div
              className={`mb-4 rounded-lg p-3 text-sm ${
                testResult.success
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="inline h-4 w-4 mr-1" />
              ) : (
                <XCircle className="inline h-4 w-4 mr-1" />
              )}
              {testResult.message}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={() => handleTestSend(testingTemplate)}>Send Test</Button>
            <Button variant="ghost" onClick={() => setTestingTemplate(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, CheckCircle, XCircle, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LogEntry {
  id: string;
  type: 'email' | 'sms';
  to: string;
  subject?: string;
  body?: string;
  templateKey?: string;
  status?: string;
  matterId?: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

export default function MessageLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [type, setType] = useState<'all' | 'email' | 'sms'>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [type, page]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type,
        page: page.toString(),
        limit: '50',
      });
      const res = await fetch(`/api/ops/messages/logs?${params}`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data.logs || []);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    return date.toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function exportCSV() {
    const headers = ['Time', 'Type', 'To', 'Template', 'Status', 'Matter ID'];
    const rows = logs.map((log) => [
      new Date(log.createdAt).toISOString(),
      log.type,
      log.to,
      log.templateKey || '',
      log.status || '',
      log.matterId || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

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
              Message Logs
            </h1>
            <p className="text-sm text-[color:var(--muted-ink)]">
              View sent emails and SMS messages
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-1 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex gap-2">
          {(['all', 'email', 'sms'] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setType(t);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                type === t
                  ? 'bg-[color:var(--brand)] text-white'
                  : 'bg-[color:var(--bg-muted)] text-[color:var(--muted-ink)] hover:bg-gray-200'
              }`}
            >
              {t === 'all' ? 'All' : t === 'email' ? 'Email' : 'SMS'}
            </button>
          ))}
        </div>

        {pagination && (
          <p className="text-sm text-[color:var(--muted-ink)]">
            Showing {logs.length} of {pagination.totalCount} messages
          </p>
        )}
      </div>

      {/* Logs table */}
      <div className="overflow-hidden rounded-xl border border-[color:var(--border-muted)] bg-white">
        <table className="w-full">
          <thead className="border-b border-[color:var(--border-muted)] bg-[color:var(--bg-muted)]">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[color:var(--brand)]">
                Time
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-[color:var(--brand)]">
                Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[color:var(--brand)]">
                Recipient
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[color:var(--brand)]">
                Template
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-[color:var(--brand)]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-[color:var(--brand)]">
                Matter
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border-muted)]">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[color:var(--muted-ink)]">
                  No logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={`${log.type}-${log.id}`} className="hover:bg-[color:var(--bg-muted)]/50">
                  <td className="px-4 py-3 text-sm text-[color:var(--muted-ink)]">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {log.type === 'email' ? (
                      <Mail className="mx-auto h-5 w-5 text-blue-600" />
                    ) : (
                      <MessageSquare className="mx-auto h-5 w-5 text-green-600" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-[color:var(--brand)]">{log.to}</p>
                    {log.subject && (
                      <p className="text-xs text-[color:var(--muted-ink)] truncate max-w-[200px]">
                        {log.subject}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {log.templateKey ? (
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
                        {log.templateKey}
                      </code>
                    ) : (
                      <span className="text-xs text-[color:var(--muted-ink)]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {log.status === 'sent' || !log.status || log.status === 'true' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        <CheckCircle className="h-3 w-3" />
                        Sent
                      </span>
                    ) : log.status === 'failed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                        <XCircle className="h-3 w-3" />
                        Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {log.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {log.matterId ? (
                      <Link
                        href={`/ops/cases/${log.matterId}`}
                        className="text-xs text-[color:var(--brand)] hover:underline"
                      >
                        {log.matterId.slice(0, 8)}...
                      </Link>
                    ) : (
                      <span className="text-xs text-[color:var(--muted-ink)]">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[color:var(--muted-ink)]">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasMore}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

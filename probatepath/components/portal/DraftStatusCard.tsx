'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getMatterId } from '@/lib/intake/session';

export function DraftStatusCard() {
  const [draft, setDraft] = useState<{
    status: 'draft' | 'submitted';
    progress: number;
    lastSaved: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const matterId = getMatterId();
    if (!matterId) {
      setLoading(false);
      return;
    }

    const fetchDraft = async () => {
      try {
        const res = await fetch(`/api/intake/${matterId}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        const submitted = !!data.submittedAt;
        const payload = data.payload || {};

        // Calculate progress (rough estimate based on filled sections)
        let filled = 0;
        let total = 4; // 4 main sections
        if (payload.welcome?.email) filled++;
        if (payload.executor?.fullName) filled++;
        if (payload.deceased?.fullName) filled++;
        if (payload.will?.willLocation) filled++;

        setDraft({
          status: submitted ? 'submitted' : 'draft',
          progress: Math.round((filled / total) * 100),
          lastSaved: data.updatedAt ? new Date(data.updatedAt).toLocaleString() : null,
        });
      } catch (err) {
        console.error('Failed to fetch draft status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDraft();
  }, []);

  if (loading || !draft) return null;

  return (
    <div className="portal-card space-y-4 p-6 mb-6 border-2 border-blue-100 bg-blue-50">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-900">
              Intake Status
            </p>
            <Badge
              variant={draft.status === 'submitted' ? 'default' : 'outline'}
              className={draft.status === 'submitted' ? 'bg-green-600 text-white' : 'border-orange-600 text-orange-600'}
            >
              {draft.status === 'submitted' ? 'Submitted' : 'In Progress'}
            </Badge>
          </div>
          <p className="text-sm text-blue-800">
            {draft.status === 'submitted'
              ? 'Your intake has been submitted. Our team will review it shortly.'
              : `${draft.progress}% complete — ${draft.lastSaved ? `last saved ${draft.lastSaved}` : 'never saved'}`}
          </p>
        </div>
        {draft.status === 'draft' && (
          <Button asChild size="sm">
            <Link href="/portal/intake">
              Resume
            </Link>
          </Button>
        )}
      </div>
      {draft.status === 'draft' && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${draft.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

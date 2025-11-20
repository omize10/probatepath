'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIntake } from '@/lib/intake/store';
import { getMatterId } from '@/lib/intake/session';

export default function ConfirmationPage() {
  const { draft } = useIntake();
  const [matterId, setMatterId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = getMatterId();
    setMatterId(id);
  }, []);

  const handleDownloadJSON = () => {
    const data = JSON.stringify(draft, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intake-${matterId || 'draft'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl">Intake Submitted</CardTitle>
          <CardDescription className="mt-2">
            Your probate intake application has been successfully submitted.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {matterId && (
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-gray-600">Matter ID</p>
              <p className="break-all font-mono text-sm font-semibold text-gray-900">{matterId}</p>
              <p className="mt-2 text-xs text-gray-500">
                Save this ID to reference your application.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              We've received your intake information. Our team will review your submission and follow up within 1-2 business days.
            </p>

            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">Next steps:</p>
              <ul className="space-y-1 text-sm text-blue-800 list-disc list-inside">
                <li>We'll send a confirmation email to your address</li>
                <li>Review your submission for any follow-up questions</li>
                <li>Prepare requested documents (will, death certificate, etc.)</li>
                <li>Sign documents electronically when ready</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleDownloadJSON}
              className="w-full"
            >
              Download submission as JSON
            </Button>

            <Link href="/portal" className="block">
              <Button className="w-full">
                Go to dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

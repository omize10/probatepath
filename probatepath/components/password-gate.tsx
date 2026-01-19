'use client';

import { useState, useEffect, type ReactNode } from 'react';

const CORRECT_PASSWORD = '123';
const STORAGE_KEY = 'probate_desk_auth';

export function PasswordGate({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[color:var(--bg-page)]">
      <div className="w-full max-w-md px-6">
        <div className="portal-card overflow-hidden p-12 text-center">
          {/* Logo/Brand */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight" style={{ color: 'var(--brand)' }}>
              Probate Desk
            </h1>
            <p className="text-sm font-medium" style={{ color: 'var(--slate)' }}>
              by Court Line Law
            </p>
          </div>

          {/* Tagline */}
          <div className="mb-8">
            <p className="text-lg italic" style={{ color: 'var(--muted-ink)' }}>
              a better way of probate
            </p>
          </div>

          {/* Beta Badge */}
          <div className="mb-6 flex justify-center">
            <span className="portal-badge">BETA TESTER</span>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium" style={{ color: 'var(--ink)' }}>
                Enter Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className="w-full rounded-xl border px-4 py-3 text-center text-lg transition-all focus:outline-none focus:ring-2"
                style={{
                  borderColor: error ? 'var(--error)' : 'var(--border-muted)',
                  backgroundColor: 'var(--bg-page)',
                  color: 'var(--ink)',
                }}
                placeholder="•••"
                autoFocus
                autoComplete="off"
              />
              {error && (
                <p className="mt-2 text-sm" style={{ color: 'var(--error)' }}>
                  Incorrect password. Please try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl px-6 py-3 font-semibold transition-all hover:opacity-90"
              style={{
                backgroundColor: 'var(--brand)',
                color: 'var(--pp-white)',
              }}
            >
              Access Beta
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Something went wrong</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>An unexpected error occurred.</p>
        <button
          onClick={() => reset()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#111827',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '12px',
          }}
        >
          Try again
        </button>
        <a href="/" style={{ color: '#111827', textDecoration: 'underline' }}>
          Go home
        </a>
      </body>
    </html>
  );
}

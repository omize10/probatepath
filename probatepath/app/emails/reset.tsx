import { createElement } from 'react';

export default function ResetEmail({ url, email }: { url: string; email: string }) {
  return (
    <html>
      <body style={{ fontFamily: "system-ui, Arial, sans-serif", color: "#0f172a" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
          <h2>Reset your ProbatePath password</h2>
          <p>
            A request was made to reset the password for <strong>{email}</strong>. Click the button below to set a new
            password. The link will expire in 30 minutes.
          </p>
          <p>
            <a
              href={url}
              style={{
                display: "inline-block",
                background: "#0f1a2a",
                color: "#ffffff",
                padding: "10px 16px",
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              Reset password
            </a>
          </p>
          <p>If you didn't request a password reset, you can ignore this email.</p>
          <hr />
          <p style={{ fontSize: 12, color: "#6b7280" }}>ProbatePath</p>
        </div>
      </body>
    </html>
  );
}

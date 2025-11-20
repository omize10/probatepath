import { createElement } from 'react';

export default function VerifyEmail({ url, name, email }: { url: string; name?: string; email: string }) {
  return (
    <html>
      <body style={{ fontFamily: "system-ui, Arial, sans-serif", color: "#0f172a" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
          <h2>Confirm your ProbatePath email</h2>
          <p>Hi{name ? ` ${name}` : ""},</p>
          <p>
            Click the button below to confirm your email address for ProbatePath. This link will expire in 30
            minutes.
          </p>
          <p>
            <a
              href={url}
              style={{ display: "inline-block", background: "#ff6a00", color: "white", padding: "10px 16px", borderRadius: 6, textDecoration: "none" }}
            >
              Confirm email
            </a>
          </p>
          <p>If you didn't create an account, you can safely ignore this message.</p>
          <hr />
          <p style={{ fontSize: 12, color: "#6b7280" }}>ProbatePath</p>
        </div>
      </body>
    </html>
  );
}

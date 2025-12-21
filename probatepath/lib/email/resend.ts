const RESEND_API = "https://api.resend.com/emails";

function getFrom() {
	const envFrom = process.env.MAIL_FROM;
	if (envFrom) return envFrom;
	// fallback to onboarding sandbox for Resend
	return "ProbatePath <onboarding@resend.dev>";
}

async function sendRaw(payload: { from: string; to: string; subject: string; html: string }) {
	const key = process.env.RESEND_API_KEY;
	if (!key) {
		// dev fallback — don't throw so local dev/testing doesn't need a key
		// eslint-disable-next-line no-console
		console.log("[email dev-fallback] would send:", payload);
		return { ok: true, simulated: true };
	}

	const res = await fetch(RESEND_API, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${key}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from: payload.from,
			to: payload.to,
			subject: payload.subject,
			html: payload.html,
		}),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`resend send failed: ${res.status} ${res.statusText} ${text}`);
	}

	return res.json().catch(() => ({ ok: true }));
}

export async function sendPasswordResetEmail({ to, token }: { to: string; token: string }) {
	const from = getFrom();
	const resetUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset-password?token=${encodeURIComponent(token)}`;
	const html = renderResetEmailHtml({ url: resetUrl, email: to });
	const subject = "Reset your ProbatePath password";
	return sendRaw({ from, to, subject, html });
}

export async function sendPasswordResetCodeEmail({ to, code }: { to: string; code: string }) {
	const from = getFrom();
	const subject = "Your ProbatePath password reset code";
	const html = renderResetCodeEmailHtml({ code });
	return sendRaw({ from, to, subject, html });
}

export default { sendPasswordResetEmail };

function escapeHtml(input: string) {
	return input
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

function renderResetEmailHtml({ url, email }: { url: string; email: string }) {
	const safeUrl = escapeHtml(url);
	const safeEmail = escapeHtml(email);
	return `<!doctype html>
<html>
  <body style="font-family: system-ui, Arial, sans-serif; color: #0f172a">
    <div style="max-width: 600px; margin: 0 auto; padding: 24px">
      <h2>Reset your ProbatePath password</h2>
      <p>
        A request was made to reset the password for <strong>${safeEmail}</strong>. Click the button below to set a new
        password. The link will expire in 30 minutes.
      </p>
      <p>
        <a
          href="${safeUrl}"
          style="display:inline-block;background:#0f1a2a;color:#ffffff;padding:10px 16px;border-radius:6px;text-decoration:none"
        >
          Reset password
        </a>
      </p>
      <p>If you didn't request a password reset, you can ignore this email.</p>
      <hr />
      <p style="font-size: 12px; color: #6b7280">ProbatePath</p>
    </div>
  </body>
</html>`;
}

function renderResetCodeEmailHtml({ code }: { code: string }) {
	const safeCode = escapeHtml(code);
	return `<!doctype html>
<html>
  <body style="font-family: system-ui, Arial, sans-serif; color: #0f172a">
    <div style="max-width: 600px; margin: 0 auto; padding: 24px">
      <h2>Reset your ProbatePath password</h2>
      <p>Enter this code on the password reset page:</p>
      <p style="font-size: 24px; font-weight: 700; letter-spacing: 0.2em">${safeCode}</p>
      <p>This code expires in 10 minutes. If you didn't request a password reset, you can ignore this email.</p>
      <hr />
      <p style="font-size: 12px; color: #6b7280">ProbatePath</p>
    </div>
  </body>
</html>`;
}

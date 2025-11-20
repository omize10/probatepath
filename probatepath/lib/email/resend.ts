import { renderToStaticMarkup } from "react-dom/server";
import resetTemplate from "@/app/emails/reset";

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
	const html = renderToStaticMarkup(resetTemplate({ url: resetUrl, email: to }));
	const subject = "Reset your ProbatePath password";
	return sendRaw({ from, to, subject, html });
}

export default { sendPasswordResetEmail };


import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions, getServerSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";
import { prisma } from "@/src/server/db/prisma";
import { logEmail } from "@/lib/email";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.RESEND_FROM ?? "notifications@example.com";

async function sendMagicLinkEmail(params: { identifier: string; url: string }) {
  const { identifier, url } = params;
  if (!resend) {
    console.warn("RESEND_API_KEY not configured; logging magic-link email only");
    await logEmail({ to: identifier, subject: "Magic link", template: "magic-link", meta: { url } });
    return;
  }
  await resend.emails.send({
    from: fromEmail,
    to: identifier,
    subject: "Your ProbatePath sign-in link",
    html: `<p>Hello,</p><p>Click <a href="${url}">here</a> to access your ProbatePath portal.</p><p>This link expires in 10 minutes.</p>`,
  });
  await logEmail({ to: identifier, subject: "Magic link", template: "magic-link" });
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  pages: { signIn: "/signin" },
  providers: [
    EmailProvider({
      from: fromEmail,
      maxAge: 10 * 60,
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendMagicLinkEmail({ identifier, url });
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      if (!user?.email) return;
      await prisma.matter.updateMany({
        where: { draft: { email: user.email }, userId: null },
        data: { userId: user.id },
      });
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}

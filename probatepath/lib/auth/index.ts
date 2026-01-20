import "server-only";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextAuthOptions, getServerSession, type Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { logEmail } from "@/lib/email";
import { logAuthEvent } from "@/lib/auth/log-auth-event";
import { logSecurityAudit } from "@/lib/audit";

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
    subject: "Your ProbateDesk sign-in link",
    html: `<p>Hello,</p><p>Click <a href="${url}">here</a> to access your ProbateDesk portal.</p><p>This link expires in 10 minutes.</p>`,
  });
  await logEmail({ to: identifier, subject: "Magic link", template: "magic-link" });
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,        // 1 hour session life
    updateAge: 5 * 60,      // refresh token every 5 min
  },
  jwt: {
    maxAge: 60 * 60,        // 1 hour
  },
  pages: { signIn: "/signin" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || !password) {
          try {
            await logSecurityAudit({
              req: req as unknown as Request | undefined,
              action: "auth.login_failed",
              meta: { email: email ?? null, reason: "missing_credentials" },
            });
          } catch {}
          return null;
        }
        const user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
        });
        if (!user?.passwordHash) {
          try {
            await logSecurityAudit({
              req: req as unknown as Request | undefined,
              action: "auth.login_failed",
              meta: { email, reason: "no_user" },
            });
          } catch {}
          return null;
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          try {
            await logSecurityAudit({
              req: req as unknown as Request | undefined,
              action: "auth.login_failed",
              meta: { email, reason: "invalid_password" },
            });
          } catch {}
          return null;
        }
        await logAuthEvent({
          action: "LOGIN",
          userId: user.id,
          email: user.email ?? undefined,
          req: req as unknown as Request | undefined,
        });
        return { id: user.id, email: user.email, name: user.name ?? undefined, role: user.role };
      },
    }),
    EmailProvider({
      from: fromEmail,
      maxAge: 10 * 60,
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendMagicLinkEmail({ identifier, url });
      },
    }),
  ],
  events: {
    async signIn({ user, account }) {
      if (!user?.email) return;
      await prisma.matter.updateMany({
        where: { draft: { email: user.email }, userId: null },
        data: { userId: user.id },
      });
      if (account?.provider !== "credentials") {
        await logAuthEvent({ action: "LOGIN", userId: user.id, email: user.email });
      }
      try {
        await logSecurityAudit({
          userId: user?.id ?? null,
          action: "auth.sign_in",
          meta: { provider: account?.provider, email: user?.email, userId: user?.id },
        });
      } catch {}
    },
    async signOut({ token }) {
      if (token?.sub) {
        await logAuthEvent({ action: "LOGOUT", userId: token.sub as string });
      }
      try {
        if (token?.sub) {
          await logSecurityAudit({ userId: token.sub as string, action: "auth.sign_out" });
        }
      } catch {}
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const userRole: Role = (user as { role?: Role }).role ?? "USER";
        token.sub = user.id as string;
        token.role = userRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token?.sub) {
          (session.user as { id?: string }).id = token.sub;
        }
        if (token?.role) {
          (session.user as { role?: Role }).role = token.role as Role;
        }
      }
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}

export async function getServerAuth() {
  const session = await getServerSession(authOptions);
  return { session };
}

export async function requirePortalAuth(currentPath: string): Promise<Session> {
  const { session } = await getServerAuth();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  }
  return session as Session;
}

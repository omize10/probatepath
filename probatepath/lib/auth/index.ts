import "server-only";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextAuthOptions, getServerSession, type Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { prisma } from "@/lib/prisma";
import { logAuthEvent } from "@/lib/auth/log-auth-event";
import { logSecurityAudit } from "@/lib/audit";

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
  pages: { signIn: "/login" },
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID ?? "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
      tenantId: process.env.AZURE_AD_TENANT_ID ?? "common",
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
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
    async signIn({ user, account, profile }) {
      // PrismaAdapter automatically creates users for OAuth providers
      // Just validate and allow sign-in
      if (account?.provider === "google" || account?.provider === "azure-ad") {
        if (!user?.email) {
          return false;
        }
        return true;
      }

      // Allow credentials provider (handled by authorize function)
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const userRole: Role = (user as { role?: Role }).role ?? "USER";
        token.sub = user.id as string;
        token.role = userRole;
        token.email = user.email;
        token.name = user.name;
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

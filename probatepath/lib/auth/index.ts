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

// Check OAuth credentials at startup
if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") {
  console.error("[auth] CRITICAL: GOOGLE_CLIENT_ID not set or using placeholder value!");
}
if (!process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET === "YOUR_GOOGLE_CLIENT_SECRET_HERE") {
  console.error("[auth] CRITICAL: GOOGLE_CLIENT_SECRET not set or using placeholder value!");
}

export const authOptions: NextAuthOptions = {
  debug: true,  // Enable debug logging to see OAuth errors
  // NO ADAPTER - testing without database storage
  // adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,        // 1 hour session life
    updateAge: 5 * 60,      // refresh token every 5 min
  },
  jwt: {
    maxAge: 60 * 60,        // 1 hour
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
      }
    },
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

        // Check if this is an email code sign-in (signInToken)
        const isSignInToken = /^[a-f0-9]{64}$/.test(password);
        if (isSignInToken && process.env.ENABLE_EMAIL_CODE_AUTH === 'true') {
          const user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
          });
          if (!user) {
            try {
              await logSecurityAudit({
                req: req as unknown as Request | undefined,
                action: "auth.login_failed",
                meta: { email, reason: "no_user_for_token" },
              });
            } catch {}
            return null;
          }

          // Find recent email log with matching signInToken
          const emailLog = await prisma.emailLog.findFirst({
            where: {
              to: user.email,
              template: "verification-code",
            },
            orderBy: { createdAt: "desc" },
          });

          type EmailLogMeta = {
            signInToken?: string;
            signInTokenExpiresAt?: string;
            signInTokenUsedAt?: string;
          };

          const meta = (emailLog?.meta ?? {}) as EmailLogMeta;
          const signInToken = meta?.signInToken;
          const expiresAt = meta?.signInTokenExpiresAt;
          const usedAt = meta?.signInTokenUsedAt;

          if (!signInToken || signInToken !== password) {
            try {
              await logSecurityAudit({
                req: req as unknown as Request | undefined,
                action: "auth.login_failed",
                meta: { email, reason: "invalid_signin_token" },
              });
            } catch {}
            return null;
          }

          if (usedAt) {
            try {
              await logSecurityAudit({
                req: req as unknown as Request | undefined,
                action: "auth.login_failed",
                meta: { email, reason: "signin_token_already_used" },
              });
            } catch {}
            return null;
          }

          const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
          if (!expiresAtDate || Date.now() > expiresAtDate.getTime()) {
            try {
              await logSecurityAudit({
                req: req as unknown as Request | undefined,
                action: "auth.login_failed",
                meta: { email, reason: "signin_token_expired" },
              });
            } catch {}
            return null;
          }

          // Mark token as used
          await prisma.emailLog.update({
            where: { id: emailLog.id },
            data: {
              meta: {
                ...meta,
                signInTokenUsedAt: new Date().toISOString(),
              } as any,
            },
          });

          await logAuthEvent({
            action: "LOGIN",
            userId: user.id,
            email: user.email ?? undefined,
            req: req as unknown as Request | undefined,
          });

          return { id: user.id, email: user.email, name: user.name ?? undefined, role: user.role };
        }

        // Regular password authentication
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
          scope: "openid email profile",
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
      try {
        console.log("[auth] signIn callback triggered", {
          provider: account?.provider,
          hasUser: !!user,
          hasEmail: !!user?.email,
          userId: user?.id,
        });

        // PrismaAdapter automatically creates users for OAuth providers
        if (account?.provider === "google" || account?.provider === "azure-ad") {
          if (!user?.email) {
            console.error("[auth] OAuth sign-in failed: no email provided", {
              provider: account.provider,
              userId: user?.id,
              user: JSON.stringify(user),
              profile: JSON.stringify(profile),
            });
            return false;
          }
          console.log("[auth] OAuth sign-in successful", {
            provider: account.provider,
            email: user.email,
            userId: user.id,
          });
          return true;
        }

        // Allow credentials provider (handled by authorize function)
        return true;
      } catch (error) {
        console.error("[auth] signIn callback error:", error);
        console.error("[auth] Error details:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        return false;
      }
    },
    async jwt({ token, user, account }) {
      try {
        if (user) {
          const userRole: Role = (user as { role?: Role }).role ?? "USER";
          token.sub = user.id as string;
          token.role = userRole;
          token.email = user.email;
          token.name = user.name;

          if (account?.provider) {
            console.log("[auth] JWT token created for OAuth user", {
              provider: account.provider,
              email: user.email,
              userId: user.id,
            });
          }
        }
        return token;
      } catch (error) {
        console.error("[auth] JWT callback error:", error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          if (token?.sub) {
            (session.user as { id?: string }).id = token.sub;
          }
          if (token?.role) {
            (session.user as { role?: Role }).role = token.role as Role;
          }
        }
        return session;
      } catch (error) {
        console.error("[auth] Session callback error:", error);
        return session;
      }
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

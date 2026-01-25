import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    // Email (Resend)
    RESEND_API_KEY: {
      set: Boolean(process.env.RESEND_API_KEY),
      preview: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.slice(0, 8)}...` : null,
    },
    RESEND_FROM: {
      set: Boolean(process.env.RESEND_FROM),
      value: process.env.RESEND_FROM ?? null,
    },

    // SMS (Twilio)
    TWILIO_ACCOUNT_SID: {
      set: Boolean(process.env.TWILIO_ACCOUNT_SID),
      preview: process.env.TWILIO_ACCOUNT_SID ? `${process.env.TWILIO_ACCOUNT_SID.slice(0, 8)}...` : null,
    },
    TWILIO_AUTH_TOKEN: {
      set: Boolean(process.env.TWILIO_AUTH_TOKEN),
      preview: process.env.TWILIO_AUTH_TOKEN ? "****" : null,
    },
    TWILIO_PHONE_NUMBER: {
      set: Boolean(process.env.TWILIO_PHONE_NUMBER),
      value: process.env.TWILIO_PHONE_NUMBER ?? null,
    },

    // App config
    APP_URL: {
      set: Boolean(process.env.APP_URL),
      value: process.env.APP_URL ?? null,
    },
    CRON_SECRET: {
      set: Boolean(process.env.CRON_SECRET),
      preview: process.env.CRON_SECRET ? `${process.env.CRON_SECRET.slice(0, 8)}...` : null,
      isPlaceholder: process.env.CRON_SECRET?.includes("<generate"),
    },

    // Database
    DATABASE_URL: {
      set: Boolean(process.env.DATABASE_URL),
      preview: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.split("@")[1]?.split("/")[0] ?? "configured"}` : null,
    },

    // Auth
    NEXTAUTH_SECRET: {
      set: Boolean(process.env.NEXTAUTH_SECRET),
      preview: process.env.NEXTAUTH_SECRET ? "****" : null,
    },

    // Dev mode
    NODE_ENV: {
      set: true,
      value: process.env.NODE_ENV ?? "not set",
    },
    NEXT_PUBLIC_DEV_MODE: {
      set: Boolean(process.env.NEXT_PUBLIC_DEV_MODE),
      value: process.env.NEXT_PUBLIC_DEV_MODE ?? null,
    },
  };

  const allRequired = ["RESEND_API_KEY", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER", "APP_URL", "DATABASE_URL", "NEXTAUTH_SECRET"];
  const missing = allRequired.filter((key) => !checks[key as keyof typeof checks].set);

  return NextResponse.json({
    success: missing.length === 0,
    message: missing.length === 0 ? "All required variables are set" : `Missing: ${missing.join(", ")}`,
    checks,
    summary: {
      emailReady: checks.RESEND_API_KEY.set,
      smsReady: checks.TWILIO_ACCOUNT_SID.set && checks.TWILIO_AUTH_TOKEN.set && checks.TWILIO_PHONE_NUMBER.set,
      cronSecretValid: checks.CRON_SECRET.set && !checks.CRON_SECRET.isPlaceholder,
      nodeEnv: process.env.NODE_ENV,
    },
  });
}

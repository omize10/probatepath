-- Add passwordHash column to existing User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

-- Create enum for auth audit types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuthAuditType') THEN
    CREATE TYPE "AuthAuditType" AS ENUM ('REGISTER', 'LOGIN', 'LOGOUT');
  END IF;
END$$;

-- Create auth audit log table
CREATE TABLE IF NOT EXISTS "AuthAuditLog" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "type" "AuthAuditType" NOT NULL,
  "ip" TEXT,
  "userAgent" TEXT,
  "meta" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "AuthAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);

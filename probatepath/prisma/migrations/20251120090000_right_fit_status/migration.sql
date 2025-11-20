CREATE TYPE "RightFitStatus" AS ENUM ('UNKNOWN', 'ELIGIBLE', 'NOT_FIT');

ALTER TABLE "Matter"
  ADD COLUMN "rightFitStatus" "RightFitStatus" NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN "rightFitCompletedAt" TIMESTAMP(3),
  ADD COLUMN "rightFitAnswers" JSONB;

-- CreateEnum
CREATE TYPE "PortalStatus" AS ENUM ('intake_complete', 'docs_in_progress', 'waiting_on_client', 'waiting_on_court', 'finished');

-- AlterTable
ALTER TABLE "Matter" ADD COLUMN     "p1Mailed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "p1MailedAt" TIMESTAMP(3),
ADD COLUMN     "p1NoticesReady" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "portalStatus" "PortalStatus" NOT NULL DEFAULT 'intake_complete',
ADD COLUMN     "standardProbatePackageReady" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "willSearchPackageReady" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reminder_dueAt_sentAt_idx" ON "Reminder"("dueAt", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "Reminder_caseId_type_key" ON "Reminder"("caseId", "type");

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

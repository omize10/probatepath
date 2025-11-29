-- AlterTable
ALTER TABLE "WillSearchRequest" ALTER COLUMN "deceasedDateOfBirth" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "MatterStepProgress" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "stepKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "pageIndex" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatterStepProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatterStepProgress_matterId_stepKey_key" ON "MatterStepProgress"("matterId", "stepKey");

-- AddForeignKey
ALTER TABLE "MatterStepProgress" ADD CONSTRAINT "MatterStepProgress_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

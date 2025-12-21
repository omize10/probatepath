-- CreateEnum
CREATE TYPE "WillFileType" AS ENUM ('pdf', 'image');

-- CreateTable
CREATE TABLE "WillFile" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" "WillFileType" NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "pageIndex" INTEGER,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WillFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WillFile_matterId_idx" ON "WillFile"("matterId");
CREATE INDEX "WillFile_matterId_fileType_idx" ON "WillFile"("matterId", "fileType");

-- AddForeignKey
ALTER TABLE "WillFile" ADD CONSTRAINT "WillFile_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "MatterStatus" AS ENUM ('DRAFT', 'INTAKE', 'REVIEW', 'PACK_READY', 'MAILED', 'DEFECT', 'DONE');

-- CreateEnum
CREATE TYPE "PackStatus" AS ENUM ('DRAFT', 'READY');

-- CreateEnum
CREATE TYPE "WillSearchStatus" AS ENUM ('READY', 'GENERATED', 'SENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matter" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "clientKey" TEXT NOT NULL,
    "status" "MatterStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Matter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeDraft" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "consent" BOOLEAN NOT NULL,
    "exFullName" TEXT NOT NULL,
    "exPhone" TEXT,
    "exCity" TEXT NOT NULL,
    "exRelation" TEXT NOT NULL,
    "decFullName" TEXT NOT NULL,
    "decDateOfDeath" TIMESTAMP(3) NOT NULL,
    "decCityProv" TEXT NOT NULL,
    "hadWill" BOOLEAN NOT NULL,
    "willLocation" TEXT NOT NULL,
    "estateValueRange" TEXT NOT NULL,
    "anyRealProperty" BOOLEAN NOT NULL,
    "multipleBeneficiaries" BOOLEAN NOT NULL,
    "specialCircumstances" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntakeDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WillSearchRequest" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "status" "WillSearchStatus" NOT NULL DEFAULT 'READY',
    "packetUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WillSearchRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedPack" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "status" "PackStatus" NOT NULL DEFAULT 'DRAFT',
    "zipUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "matterId" TEXT,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeToken" (
    "token" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeToken_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Matter_clientKey_key" ON "Matter"("clientKey");

-- CreateIndex
CREATE UNIQUE INDEX "IntakeDraft_matterId_key" ON "IntakeDraft"("matterId");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedPack_matterId_key" ON "GeneratedPack"("matterId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Matter" ADD CONSTRAINT "Matter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntakeDraft" ADD CONSTRAINT "IntakeDraft_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WillSearchRequest" ADD CONSTRAINT "WillSearchRequest_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedPack" ADD CONSTRAINT "GeneratedPack_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeToken" ADD CONSTRAINT "ResumeToken_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


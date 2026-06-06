-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DOCTOR');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('ADMITTED', 'DISCHARGED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CcRecipient" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CcRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientAlias" TEXT NOT NULL,
    "dobMonthYear" TEXT,
    "diagnosis" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'ADMITTED',
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "admissionTime" TEXT,
    "dischargeDate" TIMESTAMP(3),
    "dischargeTime" TEXT,
    "dischargeNotes" TEXT,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventImage" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CcRecipient_doctorId_userId_key" ON "CcRecipient"("doctorId", "userId");

-- CreateIndex
CREATE INDEX "Event_doctorId_idx" ON "Event"("doctorId");

-- CreateIndex
CREATE INDEX "Event_patientAlias_status_idx" ON "Event"("patientAlias", "status");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- AddForeignKey
ALTER TABLE "CcRecipient" ADD CONSTRAINT "CcRecipient_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CcRecipient" ADD CONSTRAINT "CcRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventImage" ADD CONSTRAINT "EventImage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

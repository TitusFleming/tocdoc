-- CreateEnum
CREATE TYPE "public"."EventType" AS ENUM ('ADMISSION', 'DISCHARGE');

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "patientAlias" TEXT NOT NULL,
    "dob" TEXT,
    "diagnosis" TEXT NOT NULL,
    "hospital" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "public"."EventType" NOT NULL,
    "assignedUserId" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "dischargeDate" TIMESTAMP(3),
    "field1" TEXT,
    "field2" TEXT,
    "field3" TEXT,
    "field4" TEXT,
    "field5" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

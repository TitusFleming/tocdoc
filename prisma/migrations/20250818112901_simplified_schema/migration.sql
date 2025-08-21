/*
  Warnings:

  - The values [PHYSICIAN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `admissionDate` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `assignedUserId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `dischargeDate` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `dob` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `field1` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `field2` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `field3` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `field4` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `field5` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `hospital` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `contactHours` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContact` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `facilityTaxId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hipaaTraining` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hipaaTrainingDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hipaaTrainingProvider` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `hospitalAffiliations` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `licenseNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `notificationPrefs` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `npiNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `officeAddress` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `onboardingComplete` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `onboardingStep` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `practice` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `securityClearance` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `specialty` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Patient` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dobMonthYear` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctorId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventDate` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hospitalName` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('DOCTOR', 'ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Patient" DROP CONSTRAINT "Patient_physicianId_fkey";

-- DropIndex
DROP INDEX "public"."createdAt_idx";

-- AlterTable
ALTER TABLE "public"."Event" DROP COLUMN "admissionDate",
DROP COLUMN "assignedUserId",
DROP COLUMN "date",
DROP COLUMN "dischargeDate",
DROP COLUMN "dob",
DROP COLUMN "field1",
DROP COLUMN "field2",
DROP COLUMN "field3",
DROP COLUMN "field4",
DROP COLUMN "field5",
DROP COLUMN "hospital",
DROP COLUMN "updatedAt",
ADD COLUMN     "dobMonthYear" TEXT NOT NULL,
ADD COLUMN     "doctorId" TEXT NOT NULL,
ADD COLUMN     "eventDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "hospitalName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "contactHours",
DROP COLUMN "department",
DROP COLUMN "emergencyContact",
DROP COLUMN "facilityTaxId",
DROP COLUMN "hipaaTraining",
DROP COLUMN "hipaaTrainingDate",
DROP COLUMN "hipaaTrainingProvider",
DROP COLUMN "hospitalAffiliations",
DROP COLUMN "language",
DROP COLUMN "licenseNumber",
DROP COLUMN "notificationPrefs",
DROP COLUMN "npiNumber",
DROP COLUMN "officeAddress",
DROP COLUMN "onboardingComplete",
DROP COLUMN "onboardingStep",
DROP COLUMN "practice",
DROP COLUMN "securityClearance",
DROP COLUMN "specialty",
DROP COLUMN "timezone",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "organizationName" TEXT;

-- DropTable
DROP TABLE "public"."Patient";

-- CreateIndex
CREATE INDEX "Event_doctorId_idx" ON "public"."Event"("doctorId");

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `organizationName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Event" ALTER COLUMN "dobMonthYear" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "address",
DROP COLUMN "organizationName",
DROP COLUMN "phone";

/*
  Patient-centric workflow migration:
  - Transform existing events to patient-centric model
  - Existing ADMISSION events become ADMITTED status
  - Existing DISCHARGE events become DISCHARGED status
  - eventDate becomes admissionDate for ADMISSION, dischargeDate for DISCHARGE
*/

-- CreateEnum
CREATE TYPE "public"."EventStatus" AS ENUM ('ADMITTED', 'DISCHARGED');

-- Add new columns with temporary defaults
ALTER TABLE "public"."Event" 
ADD COLUMN "admissionDate" TIMESTAMP(3),
ADD COLUMN "dischargeDate" TIMESTAMP(3),
ADD COLUMN "status" "public"."EventStatus";

-- Transform existing data
-- For ADMISSION events: set status=ADMITTED, admissionDate=eventDate
UPDATE "public"."Event" 
SET "status" = 'ADMITTED', 
    "admissionDate" = "eventDate"
WHERE "type" = 'ADMISSION';

-- For DISCHARGE events: set status=DISCHARGED, dischargeDate=eventDate, admissionDate=eventDate (fallback)
UPDATE "public"."Event" 
SET "status" = 'DISCHARGED', 
    "admissionDate" = "eventDate", 
    "dischargeDate" = "eventDate"
WHERE "type" = 'DISCHARGE';

-- Make admissionDate required after data transformation
ALTER TABLE "public"."Event" ALTER COLUMN "admissionDate" SET NOT NULL;
ALTER TABLE "public"."Event" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "public"."Event" ALTER COLUMN "status" SET DEFAULT 'ADMITTED';

-- Remove old columns
ALTER TABLE "public"."Event" DROP COLUMN "eventDate";
ALTER TABLE "public"."Event" DROP COLUMN "type";

-- DropEnum
DROP TYPE "public"."EventType";

-- CreateIndex
CREATE INDEX "Event_patientAlias_status_idx" ON "public"."Event"("patientAlias", "status");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "public"."Event"("status");

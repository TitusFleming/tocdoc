-- Move image storage from public blob URLs to private database bytes.
-- No production images exist yet, so clearing the table is safe.
DELETE FROM "EventImage";

ALTER TABLE "EventImage" DROP COLUMN "url";
ALTER TABLE "EventImage" ADD COLUMN "data" BYTEA NOT NULL;

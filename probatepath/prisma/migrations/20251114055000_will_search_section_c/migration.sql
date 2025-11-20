ALTER TABLE "WillSearchRequest"
  ADD COLUMN "deceasedAliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "deceasedDateOfBirth" TIMESTAMPTZ,
  ADD COLUMN "deceasedPlaceOfBirth" TEXT,
  ADD COLUMN "deceasedMarriedSurname" TEXT;

UPDATE "WillSearchRequest"
SET "deceasedAliases" = COALESCE("aliases", ARRAY[]::TEXT[]);

ALTER TABLE "WillSearchRequest" DROP COLUMN "aliases";

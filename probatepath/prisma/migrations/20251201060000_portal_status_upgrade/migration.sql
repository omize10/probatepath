-- AlterEnum
BEGIN;
CREATE TYPE "PortalStatus_new" AS ENUM ('intake_complete', 'will_search_prepping', 'will_search_ready', 'will_search_sent', 'notices_in_progress', 'notices_waiting_21_days', 'probate_package_prepping', 'probate_package_ready', 'done');
ALTER TABLE "public"."Matter" ALTER COLUMN "portalStatus" DROP DEFAULT;
ALTER TABLE "Matter" ALTER COLUMN "portalStatus" TYPE "PortalStatus_new" USING ("portalStatus"::text::"PortalStatus_new");
ALTER TYPE "PortalStatus" RENAME TO "PortalStatus_old";
ALTER TYPE "PortalStatus_new" RENAME TO "PortalStatus";
DROP TYPE "public"."PortalStatus_old";
ALTER TABLE "Matter" ALTER COLUMN "portalStatus" SET DEFAULT 'intake_complete';
COMMIT;

-- AlterTable
ALTER TABLE "Matter" ADD COLUMN     "noticesMailedAt" TIMESTAMP(3),
ADD COLUMN     "noticesPreparedAt" TIMESTAMP(3),
ADD COLUMN     "probateFiledAt" TIMESTAMP(3),
ADD COLUMN     "probatePackagePreparedAt" TIMESTAMP(3),
ADD COLUMN     "willSearchMailedAt" TIMESTAMP(3),
ADD COLUMN     "willSearchPreparedAt" TIMESTAMP(3);


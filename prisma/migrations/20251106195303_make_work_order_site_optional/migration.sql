-- AlterTable: Make siteId optional in work_orders table
-- This allows work orders to be created without a site when EXTERNAL_CLIENT_MANAGEMENT feature is disabled

ALTER TABLE "work_orders" ALTER COLUMN "siteId" DROP NOT NULL;

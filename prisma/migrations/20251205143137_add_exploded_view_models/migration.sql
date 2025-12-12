/*
  Warnings:

  - Made the column `roleId` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `roleId` on table `user_invitations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "isStandalone" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "roleId" SET NOT NULL;

-- AlterTable
ALTER TABLE "user_invitations" ALTER COLUMN "roleId" SET NOT NULL;

-- AlterTable
ALTER TABLE "work_orders" ADD COLUMN     "downtimeCost" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "work_order_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workOrderId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "work_order_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_status_history" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "status" "AssetStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "reason" TEXT,
    "notes" TEXT,
    "changedBy" TEXT NOT NULL,
    "workOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_lines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "siteId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "targetThroughput" INTEGER,
    "taktTime" DOUBLE PRECISION,
    "unitPrice" DOUBLE PRECISION,
    "flowConfiguration" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_line_assets" (
    "id" TEXT NOT NULL,
    "productionLineId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "position" JSONB,
    "cycleTime" DOUBLE PRECISION,
    "capacity" INTEGER,
    "nodeType" TEXT NOT NULL DEFAULT 'machine',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_line_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_exploded_views" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "imageWidth" INTEGER NOT NULL,
    "imageHeight" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assetId" TEXT NOT NULL,

    CONSTRAINT "asset_exploded_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exploded_view_components" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "partNumber" TEXT,
    "description" TEXT,
    "manufacturer" TEXT,
    "specifications" JSONB,
    "manualUrl" TEXT,
    "installationUrl" TEXT,
    "imageUrl" TEXT,
    "inventoryItemId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "companyId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exploded_view_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exploded_view_hotspots" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'polygon',
    "coordinates" JSONB NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "opacity" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "viewId" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,

    CONSTRAINT "exploded_view_hotspots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "work_order_comments_workOrderId_idx" ON "work_order_comments"("workOrderId");

-- CreateIndex
CREATE INDEX "work_order_comments_authorId_idx" ON "work_order_comments"("authorId");

-- CreateIndex
CREATE INDEX "asset_status_history_assetId_startedAt_idx" ON "asset_status_history"("assetId", "startedAt");

-- CreateIndex
CREATE INDEX "asset_status_history_changedBy_idx" ON "asset_status_history"("changedBy");

-- CreateIndex
CREATE INDEX "asset_status_history_workOrderId_idx" ON "asset_status_history"("workOrderId");

-- CreateIndex
CREATE INDEX "asset_status_history_status_idx" ON "asset_status_history"("status");

-- CreateIndex
CREATE INDEX "production_lines_siteId_idx" ON "production_lines"("siteId");

-- CreateIndex
CREATE INDEX "production_lines_companyId_idx" ON "production_lines"("companyId");

-- CreateIndex
CREATE INDEX "production_lines_isActive_idx" ON "production_lines"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "production_lines_code_companyId_key" ON "production_lines"("code", "companyId");

-- CreateIndex
CREATE INDEX "production_line_assets_productionLineId_idx" ON "production_line_assets"("productionLineId");

-- CreateIndex
CREATE INDEX "production_line_assets_assetId_idx" ON "production_line_assets"("assetId");

-- CreateIndex
CREATE INDEX "production_line_assets_sequence_idx" ON "production_line_assets"("sequence");

-- CreateIndex
CREATE UNIQUE INDEX "production_line_assets_productionLineId_assetId_key" ON "production_line_assets"("productionLineId", "assetId");

-- CreateIndex
CREATE INDEX "asset_exploded_views_assetId_idx" ON "asset_exploded_views"("assetId");

-- CreateIndex
CREATE INDEX "asset_exploded_views_isActive_idx" ON "asset_exploded_views"("isActive");

-- CreateIndex
CREATE INDEX "exploded_view_components_companyId_idx" ON "exploded_view_components"("companyId");

-- CreateIndex
CREATE INDEX "exploded_view_components_inventoryItemId_idx" ON "exploded_view_components"("inventoryItemId");

-- CreateIndex
CREATE INDEX "exploded_view_components_isActive_idx" ON "exploded_view_components"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "exploded_view_components_companyId_partNumber_key" ON "exploded_view_components"("companyId", "partNumber");

-- CreateIndex
CREATE INDEX "exploded_view_hotspots_viewId_idx" ON "exploded_view_hotspots"("viewId");

-- CreateIndex
CREATE INDEX "exploded_view_hotspots_componentId_idx" ON "exploded_view_hotspots"("componentId");

-- CreateIndex
CREATE INDEX "exploded_view_hotspots_isActive_idx" ON "exploded_view_hotspots"("isActive");

-- CreateIndex
CREATE INDEX "assets_isStandalone_idx" ON "assets"("isStandalone");

-- AddForeignKey
ALTER TABLE "work_order_comments" ADD CONSTRAINT "work_order_comments_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_comments" ADD CONSTRAINT "work_order_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_status_history" ADD CONSTRAINT "asset_status_history_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_status_history" ADD CONSTRAINT "asset_status_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_status_history" ADD CONSTRAINT "asset_status_history_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_lines" ADD CONSTRAINT "production_lines_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_lines" ADD CONSTRAINT "production_lines_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_line_assets" ADD CONSTRAINT "production_line_assets_productionLineId_fkey" FOREIGN KEY ("productionLineId") REFERENCES "production_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_line_assets" ADD CONSTRAINT "production_line_assets_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_exploded_views" ADD CONSTRAINT "asset_exploded_views_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_exploded_views" ADD CONSTRAINT "asset_exploded_views_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exploded_view_components" ADD CONSTRAINT "exploded_view_components_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exploded_view_components" ADD CONSTRAINT "exploded_view_components_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exploded_view_components" ADD CONSTRAINT "exploded_view_components_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exploded_view_hotspots" ADD CONSTRAINT "exploded_view_hotspots_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "asset_exploded_views"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exploded_view_hotspots" ADD CONSTRAINT "exploded_view_hotspots_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "exploded_view_components"("id") ON DELETE CASCADE ON UPDATE CASCADE;

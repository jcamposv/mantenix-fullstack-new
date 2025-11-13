-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'OPERARIO';

-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "isStandalone" BOOLEAN NOT NULL DEFAULT true;

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
CREATE INDEX "assets_isStandalone_idx" ON "assets"("isStandalone");

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

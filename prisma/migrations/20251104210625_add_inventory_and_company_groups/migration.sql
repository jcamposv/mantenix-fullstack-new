-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('SITE', 'WAREHOUSE', 'VEHICLE');

-- CreateEnum
CREATE TYPE "InventoryRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RequestUrgency" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'WORK_ORDER', 'RETURN', 'DAMAGE', 'COUNT_ADJUSTMENT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'ADMIN_GRUPO';
ALTER TYPE "Role" ADD VALUE 'JEFE_MANTENIMIENTO';

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "companyGroupId" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "companyGroupId" TEXT;

-- CreateTable
CREATE TABLE "company_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "shareInventory" BOOLEAN NOT NULL DEFAULT true,
    "autoApproveTransfers" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "manufacturer" TEXT,
    "model" TEXT,
    "partNumber" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'unidad',
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "maxStock" INTEGER,
    "reorderPoint" INTEGER NOT NULL DEFAULT 0,
    "unitCost" DOUBLE PRECISION,
    "lastPurchasePrice" DOUBLE PRECISION,
    "averageCost" DOUBLE PRECISION,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_stock" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "locationType" "LocationType" NOT NULL,
    "locationName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
    "availableQuantity" INTEGER NOT NULL DEFAULT 0,
    "aisle" TEXT,
    "rack" TEXT,
    "bin" TEXT,
    "lastCountDate" TIMESTAMP(3),
    "lastCountBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_inventory_requests" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "quantityRequested" INTEGER NOT NULL,
    "quantityApproved" INTEGER,
    "quantityDelivered" INTEGER NOT NULL DEFAULT 0,
    "sourceCompanyId" TEXT,
    "sourceLocationId" TEXT,
    "sourceLocationType" "LocationType",
    "destinationLocationId" TEXT,
    "destinationLocationType" "LocationType",
    "status" "InventoryRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "deliveredBy" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "notes" TEXT,
    "urgency" "RequestUrgency" NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_order_inventory_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "fromLocationId" TEXT,
    "fromLocationType" "LocationType",
    "fromCompanyId" TEXT,
    "toLocationId" TEXT,
    "toLocationType" "LocationType",
    "toCompanyId" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitCost" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "workOrderId" TEXT,
    "requestId" TEXT,
    "purchaseOrderId" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "documentNumber" TEXT,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_items_companyId_idx" ON "inventory_items"("companyId");

-- CreateIndex
CREATE INDEX "inventory_items_category_idx" ON "inventory_items"("category");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_companyId_code_key" ON "inventory_items"("companyId", "code");

-- CreateIndex
CREATE INDEX "inventory_stock_inventoryItemId_idx" ON "inventory_stock"("inventoryItemId");

-- CreateIndex
CREATE INDEX "inventory_stock_locationId_locationType_idx" ON "inventory_stock"("locationId", "locationType");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_stock_inventoryItemId_locationId_locationType_key" ON "inventory_stock"("inventoryItemId", "locationId", "locationType");

-- CreateIndex
CREATE INDEX "work_order_inventory_requests_workOrderId_idx" ON "work_order_inventory_requests"("workOrderId");

-- CreateIndex
CREATE INDEX "work_order_inventory_requests_inventoryItemId_idx" ON "work_order_inventory_requests"("inventoryItemId");

-- CreateIndex
CREATE INDEX "work_order_inventory_requests_status_idx" ON "work_order_inventory_requests"("status");

-- CreateIndex
CREATE INDEX "inventory_movements_inventoryItemId_idx" ON "inventory_movements"("inventoryItemId");

-- CreateIndex
CREATE INDEX "inventory_movements_type_idx" ON "inventory_movements"("type");

-- CreateIndex
CREATE INDEX "inventory_movements_createdAt_idx" ON "inventory_movements"("createdAt");

-- CreateIndex
CREATE INDEX "inventory_movements_fromCompanyId_idx" ON "inventory_movements"("fromCompanyId");

-- CreateIndex
CREATE INDEX "inventory_movements_toCompanyId_idx" ON "inventory_movements"("toCompanyId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_companyGroupId_fkey" FOREIGN KEY ("companyGroupId") REFERENCES "company_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_companyGroupId_fkey" FOREIGN KEY ("companyGroupId") REFERENCES "company_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_inventory_requests" ADD CONSTRAINT "work_order_inventory_requests_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_inventory_requests" ADD CONSTRAINT "work_order_inventory_requests_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

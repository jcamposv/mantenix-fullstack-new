-- AlterTable
ALTER TABLE "work_orders" ADD COLUMN     "maintenanceComponentId" TEXT;

-- CreateIndex
CREATE INDEX "work_orders_maintenanceComponentId_idx" ON "work_orders"("maintenanceComponentId");

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_maintenanceComponentId_fkey" FOREIGN KEY ("maintenanceComponentId") REFERENCES "exploded_view_components"("id") ON DELETE SET NULL ON UPDATE CASCADE;

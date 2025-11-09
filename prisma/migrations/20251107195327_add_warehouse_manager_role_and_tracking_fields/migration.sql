-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ENCARGADO_BODEGA';

-- AlterTable
ALTER TABLE "work_order_inventory_requests" ADD COLUMN     "receivedAt" TIMESTAMP(3),
ADD COLUMN     "receivedBy" TEXT,
ADD COLUMN     "warehouseDeliveredAt" TIMESTAMP(3),
ADD COLUMN     "warehouseDeliveredBy" TEXT;

-- AddForeignKey
ALTER TABLE "work_order_inventory_requests" ADD CONSTRAINT "work_order_inventory_requests_warehouseDeliveredBy_fkey" FOREIGN KEY ("warehouseDeliveredBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_inventory_requests" ADD CONSTRAINT "work_order_inventory_requests_receivedBy_fkey" FOREIGN KEY ("receivedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

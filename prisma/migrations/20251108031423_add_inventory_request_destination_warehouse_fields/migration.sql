-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InventoryRequestStatus" ADD VALUE 'RECEIVED_AT_DESTINATION';
ALTER TYPE "InventoryRequestStatus" ADD VALUE 'READY_FOR_PICKUP';

-- AlterTable
ALTER TABLE "work_order_inventory_requests" ADD COLUMN     "destinationWarehouseReceivedAt" TIMESTAMP(3),
ADD COLUMN     "destinationWarehouseReceivedBy" TEXT;

-- AddForeignKey
ALTER TABLE "work_order_inventory_requests" ADD CONSTRAINT "work_order_inventory_requests_destinationWarehouseReceived_fkey" FOREIGN KEY ("destinationWarehouseReceivedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

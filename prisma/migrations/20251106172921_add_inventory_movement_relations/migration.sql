-- Add foreign key constraints and indexes for InventoryMovement relations

-- CreateIndex for workOrderId
CREATE INDEX IF NOT EXISTS "inventory_movements_workOrderId_idx" ON "inventory_movements"("workOrderId");

-- CreateIndex for requestId
CREATE INDEX IF NOT EXISTS "inventory_movements_requestId_idx" ON "inventory_movements"("requestId");

-- CreateIndex for createdBy
CREATE INDEX IF NOT EXISTS "inventory_movements_createdBy_idx" ON "inventory_movements"("createdBy");

-- CreateIndex for approvedBy
CREATE INDEX IF NOT EXISTS "inventory_movements_approvedBy_idx" ON "inventory_movements"("approvedBy");

-- AddForeignKey for fromCompanyId
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_fromCompanyId_fkey" FOREIGN KEY ("fromCompanyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey for toCompanyId
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_toCompanyId_fkey" FOREIGN KEY ("toCompanyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey for workOrderId
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey for requestId
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "work_order_inventory_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey for createdBy
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey for approvedBy
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

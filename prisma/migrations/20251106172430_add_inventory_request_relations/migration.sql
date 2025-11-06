-- Add foreign key constraints and indexes for WorkOrderInventoryRequest relations

-- CreateIndex
CREATE INDEX IF NOT EXISTS "work_order_inventory_requests_sourceCompanyId_idx" ON "work_order_inventory_requests"("sourceCompanyId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "work_order_inventory_requests_requestedBy_idx" ON "work_order_inventory_requests"("requestedBy");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "work_order_inventory_requests_reviewedBy_idx" ON "work_order_inventory_requests"("reviewedBy");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "work_order_inventory_requests_deliveredBy_idx" ON "work_order_inventory_requests"("deliveredBy");

-- AddForeignKey
ALTER TABLE "work_order_inventory_requests" ADD CONSTRAINT "work_order_inventory_requests_sourceCompanyId_fkey" FOREIGN KEY ("sourceCompanyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_inventory_requests" ADD CONSTRAINT "work_order_inventory_requests_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_inventory_requests" ADD CONSTRAINT "work_order_inventory_requests_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_inventory_requests" ADD CONSTRAINT "work_order_inventory_requests_deliveredBy_fkey" FOREIGN KEY ("deliveredBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

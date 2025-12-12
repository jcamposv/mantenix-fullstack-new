-- AlterTable
ALTER TABLE "exploded_view_components" ADD COLUMN     "autoCreateSchedule" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maintenanceStrategy" "MaintenanceType",
ADD COLUMN     "manufacturerMaintenanceInterval" INTEGER,
ADD COLUMN     "manufacturerMaintenanceIntervalUnit" "FrequencyUnit",
ADD COLUMN     "mtbfAlertThreshold" DECIMAL(3,2) DEFAULT 0.8,
ADD COLUMN     "workOrderScheduleId" TEXT,
ADD COLUMN     "workOrderTemplateId" TEXT;

-- CreateIndex
CREATE INDEX "exploded_view_components_workOrderScheduleId_idx" ON "exploded_view_components"("workOrderScheduleId");

-- CreateIndex
CREATE INDEX "exploded_view_components_workOrderTemplateId_idx" ON "exploded_view_components"("workOrderTemplateId");

-- CreateIndex
CREATE INDEX "exploded_view_components_maintenanceStrategy_idx" ON "exploded_view_components"("maintenanceStrategy");

-- CreateIndex
CREATE INDEX "exploded_view_components_autoCreateSchedule_idx" ON "exploded_view_components"("autoCreateSchedule");

-- AddForeignKey
ALTER TABLE "exploded_view_components" ADD CONSTRAINT "exploded_view_components_workOrderScheduleId_fkey" FOREIGN KEY ("workOrderScheduleId") REFERENCES "work_order_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exploded_view_components" ADD CONSTRAINT "exploded_view_components_workOrderTemplateId_fkey" FOREIGN KEY ("workOrderTemplateId") REFERENCES "work_order_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

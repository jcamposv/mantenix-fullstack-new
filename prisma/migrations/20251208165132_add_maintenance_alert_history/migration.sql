-- CreateEnum
CREATE TYPE "MaintenanceAlertSeverity" AS ENUM ('CRITICAL', 'WARNING', 'INFO');

-- CreateEnum
CREATE TYPE "MaintenanceAlertStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'DISMISSED', 'AUTO_CLOSED');

-- CreateTable
CREATE TABLE "maintenance_alert_history" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "assetName" TEXT NOT NULL,
    "partNumber" TEXT,
    "severity" "MaintenanceAlertSeverity" NOT NULL,
    "criticality" TEXT,
    "mtbf" DOUBLE PRECISION NOT NULL,
    "currentOperatingHours" DOUBLE PRECISION NOT NULL,
    "hoursUntilMaintenance" DOUBLE PRECISION NOT NULL,
    "daysUntilMaintenance" DOUBLE PRECISION NOT NULL,
    "mtbfUtilization" DOUBLE PRECISION NOT NULL,
    "stockAvailable" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "status" "MaintenanceAlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "resolvedAt" TIMESTAMP(3),
    "resolvedByUserId" TEXT,
    "resolutionNotes" TEXT,
    "workOrderId" TEXT,
    "dismissedAt" TIMESTAMP(3),
    "dismissedByUserId" TEXT,
    "dismissalReason" TEXT,
    "autoClosedAt" TIMESTAMP(3),
    "autoClosureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_alert_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "maintenance_alert_history_companyId_createdAt_idx" ON "maintenance_alert_history"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "maintenance_alert_history_componentId_idx" ON "maintenance_alert_history"("componentId");

-- CreateIndex
CREATE INDEX "maintenance_alert_history_assetId_idx" ON "maintenance_alert_history"("assetId");

-- CreateIndex
CREATE INDEX "maintenance_alert_history_status_idx" ON "maintenance_alert_history"("status");

-- CreateIndex
CREATE INDEX "maintenance_alert_history_severity_idx" ON "maintenance_alert_history"("severity");

-- CreateIndex
CREATE INDEX "maintenance_alert_history_criticality_idx" ON "maintenance_alert_history"("criticality");

-- CreateIndex
CREATE INDEX "maintenance_alert_history_createdAt_idx" ON "maintenance_alert_history"("createdAt");

-- CreateIndex
CREATE INDEX "maintenance_alert_history_companyId_status_createdAt_idx" ON "maintenance_alert_history"("companyId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "maintenance_alert_history" ADD CONSTRAINT "maintenance_alert_history_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_alert_history" ADD CONSTRAINT "maintenance_alert_history_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "exploded_view_components"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_alert_history" ADD CONSTRAINT "maintenance_alert_history_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_alert_history" ADD CONSTRAINT "maintenance_alert_history_resolvedByUserId_fkey" FOREIGN KEY ("resolvedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_alert_history" ADD CONSTRAINT "maintenance_alert_history_dismissedByUserId_fkey" FOREIGN KEY ("dismissedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_alert_history" ADD CONSTRAINT "maintenance_alert_history_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

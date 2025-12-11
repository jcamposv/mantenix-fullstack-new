-- CreateEnum
CREATE TYPE "ComponentCriticality" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PREVENTIVE', 'PREDICTIVE', 'CORRECTIVE', 'ROUTINE');

-- CreateEnum
CREATE TYPE "FrequencyUnit" AS ENUM ('HOURS', 'DAYS', 'WEEKS', 'MONTHS', 'YEARS');

-- AlterTable
ALTER TABLE "exploded_view_components" ADD COLUMN     "criticality" "ComponentCriticality",
ADD COLUMN     "hierarchyLevel" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "lifeExpectancy" INTEGER,
ADD COLUMN     "mtbf" INTEGER,
ADD COLUMN     "mttr" INTEGER,
ADD COLUMN     "parentComponentId" TEXT;

-- CreateTable
CREATE TABLE "maintenance_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "MaintenanceType" NOT NULL,
    "frequencyValue" INTEGER NOT NULL,
    "frequencyUnit" "FrequencyUnit" NOT NULL,
    "lastPerformedAt" TIMESTAMP(3),
    "nextScheduledAt" TIMESTAMP(3),
    "currentMeterReading" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedDuration" INTEGER,
    "estimatedCost" DOUBLE PRECISION,
    "requiredTools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requiredMaterials" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "safetyNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "componentId" TEXT NOT NULL,
    "totalExecutions" INTEGER NOT NULL DEFAULT 0,
    "totalFailures" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "maintenance_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "estimatedDuration" INTEGER,
    "requiresPhotoBefore" BOOLEAN NOT NULL DEFAULT false,
    "requiresPhotoAfter" BOOLEAN NOT NULL DEFAULT false,
    "requiresMeasurement" BOOLEAN NOT NULL DEFAULT false,
    "measurementUnit" TEXT,
    "acceptanceCriteria" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "planId" TEXT NOT NULL,

    CONSTRAINT "maintenance_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "maintenance_plans_componentId_idx" ON "maintenance_plans"("componentId");

-- CreateIndex
CREATE INDEX "maintenance_plans_type_idx" ON "maintenance_plans"("type");

-- CreateIndex
CREATE INDEX "maintenance_plans_nextScheduledAt_idx" ON "maintenance_plans"("nextScheduledAt");

-- CreateIndex
CREATE INDEX "maintenance_plans_isActive_idx" ON "maintenance_plans"("isActive");

-- CreateIndex
CREATE INDEX "maintenance_tasks_planId_idx" ON "maintenance_tasks"("planId");

-- CreateIndex
CREATE INDEX "maintenance_tasks_order_idx" ON "maintenance_tasks"("order");

-- CreateIndex
CREATE INDEX "maintenance_tasks_isActive_idx" ON "maintenance_tasks"("isActive");

-- CreateIndex
CREATE INDEX "exploded_view_components_parentComponentId_idx" ON "exploded_view_components"("parentComponentId");

-- CreateIndex
CREATE INDEX "exploded_view_components_hierarchyLevel_idx" ON "exploded_view_components"("hierarchyLevel");

-- CreateIndex
CREATE INDEX "exploded_view_components_criticality_idx" ON "exploded_view_components"("criticality");

-- AddForeignKey
ALTER TABLE "exploded_view_components" ADD CONSTRAINT "exploded_view_components_parentComponentId_fkey" FOREIGN KEY ("parentComponentId") REFERENCES "exploded_view_components"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_plans" ADD CONSTRAINT "maintenance_plans_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "exploded_view_components"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_tasks" ADD CONSTRAINT "maintenance_tasks_planId_fkey" FOREIGN KEY ("planId") REFERENCES "maintenance_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

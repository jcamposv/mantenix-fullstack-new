-- CreateEnum
CREATE TYPE "RecurrenceType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'METER_BASED');

-- CreateEnum
CREATE TYPE "RecurrenceEndType" AS ENUM ('NEVER', 'AFTER_OCCURRENCES', 'ON_DATE');

-- CreateEnum
CREATE TYPE "MeterType" AS ENUM ('HOURS_RUN', 'KILOMETERS', 'MILES', 'TEMPERATURE', 'PRESSURE', 'CYCLES', 'VIBRATION', 'CUSTOM');

-- AlterTable
ALTER TABLE "work_orders" ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduleId" TEXT;

-- CreateTable
CREATE TABLE "work_order_schedules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "recurrenceType" "RecurrenceType" NOT NULL,
    "recurrenceInterval" INTEGER NOT NULL DEFAULT 1,
    "recurrenceEndType" "RecurrenceEndType" NOT NULL,
    "recurrenceEndValue" INTEGER,
    "recurrenceEndDate" TIMESTAMP(3),
    "weekDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "meterType" "MeterType",
    "meterThreshold" DOUBLE PRECISION,
    "currentMeterReading" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "templateId" TEXT NOT NULL,
    "assetId" TEXT,
    "siteId" TEXT,
    "assignedUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastGeneratedAt" TIMESTAMP(3),
    "nextGenerationDate" TIMESTAMP(3),
    "totalGenerated" INTEGER NOT NULL DEFAULT 0,
    "totalCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalSkipped" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "companyId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_order_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "work_order_schedules_companyId_idx" ON "work_order_schedules"("companyId");

-- CreateIndex
CREATE INDEX "work_order_schedules_templateId_idx" ON "work_order_schedules"("templateId");

-- CreateIndex
CREATE INDEX "work_order_schedules_assetId_idx" ON "work_order_schedules"("assetId");

-- CreateIndex
CREATE INDEX "work_order_schedules_siteId_idx" ON "work_order_schedules"("siteId");

-- CreateIndex
CREATE INDEX "work_order_schedules_isActive_idx" ON "work_order_schedules"("isActive");

-- CreateIndex
CREATE INDEX "work_order_schedules_nextGenerationDate_idx" ON "work_order_schedules"("nextGenerationDate");

-- CreateIndex
CREATE INDEX "work_order_schedules_recurrenceType_idx" ON "work_order_schedules"("recurrenceType");

-- CreateIndex
CREATE INDEX "work_orders_scheduleId_idx" ON "work_orders"("scheduleId");

-- CreateIndex
CREATE INDEX "work_orders_isRecurring_idx" ON "work_orders"("isRecurring");

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "work_order_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_schedules" ADD CONSTRAINT "work_order_schedules_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "work_order_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_schedules" ADD CONSTRAINT "work_order_schedules_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_schedules" ADD CONSTRAINT "work_order_schedules_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_schedules" ADD CONSTRAINT "work_order_schedules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_schedules" ADD CONSTRAINT "work_order_schedules_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

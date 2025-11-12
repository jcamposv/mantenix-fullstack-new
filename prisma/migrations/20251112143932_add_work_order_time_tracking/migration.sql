-- CreateEnum
CREATE TYPE "TimeLogAction" AS ENUM ('START', 'PAUSE', 'RESUME', 'COMPLETE');

-- CreateEnum
CREATE TYPE "PauseReason" AS ENUM ('WAITING_PARTS', 'WAITING_APPROVAL', 'LUNCH_BREAK', 'OTHER_PRIORITY', 'TECHNICAL_ISSUE', 'TRAVEL', 'OTHER');

-- AlterTable
ALTER TABLE "work_orders" ADD COLUMN     "activeWorkTime" INTEGER,
ADD COLUMN     "diagnosticTime" INTEGER,
ADD COLUMN     "travelTime" INTEGER,
ADD COLUMN     "waitingTime" INTEGER;

-- CreateTable
CREATE TABLE "work_order_time_logs" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "action" "TimeLogAction" NOT NULL,
    "pauseReason" "PauseReason",
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "segmentDurationMinutes" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_order_time_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "work_order_time_logs_workOrderId_timestamp_idx" ON "work_order_time_logs"("workOrderId", "timestamp");

-- CreateIndex
CREATE INDEX "work_order_time_logs_userId_idx" ON "work_order_time_logs"("userId");

-- CreateIndex
CREATE INDEX "work_order_time_logs_action_idx" ON "work_order_time_logs"("action");

-- AddForeignKey
ALTER TABLE "work_order_time_logs" ADD CONSTRAINT "work_order_time_logs_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_time_logs" ADD CONSTRAINT "work_order_time_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

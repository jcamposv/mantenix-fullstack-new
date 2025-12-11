-- CreateTable
CREATE TABLE "safety_briefings" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "confirmedWorkPermits" BOOLEAN NOT NULL DEFAULT false,
    "confirmedLOTO" BOOLEAN NOT NULL DEFAULT false,
    "confirmedJSA" BOOLEAN NOT NULL DEFAULT false,
    "signature" TEXT,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_briefings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "safety_briefings_workOrderId_idx" ON "safety_briefings"("workOrderId");

-- CreateIndex
CREATE INDEX "safety_briefings_userId_idx" ON "safety_briefings"("userId");

-- CreateIndex
CREATE INDEX "safety_briefings_confirmedAt_idx" ON "safety_briefings"("confirmedAt");

-- CreateIndex
CREATE UNIQUE INDEX "safety_briefings_workOrderId_userId_key" ON "safety_briefings"("workOrderId", "userId");

-- AddForeignKey
ALTER TABLE "safety_briefings" ADD CONSTRAINT "safety_briefings_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_briefings" ADD CONSTRAINT "safety_briefings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

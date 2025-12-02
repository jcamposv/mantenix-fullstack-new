-- CreateEnum
CREATE TYPE "AIOperationType" AS ENUM ('INSIGHTS_GENERATION', 'REPORT_GENERATION', 'ANOMALY_DETECTION', 'PREDICTIVE_ANALYSIS', 'RECOMMENDATION');

-- CreateTable
CREATE TABLE "company_ai_configs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "monthlyTokenLimit" INTEGER NOT NULL DEFAULT 100000,
    "alertThresholdPercent" INTEGER NOT NULL DEFAULT 80,
    "currentMonthTokens" INTEGER NOT NULL DEFAULT 0,
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "insightsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reportsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "predictiveEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_ai_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage_logs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "operation" "AIOperationType" NOT NULL,
    "model" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "duration" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_ai_configs_companyId_key" ON "company_ai_configs"("companyId");

-- CreateIndex
CREATE INDEX "company_ai_configs_companyId_idx" ON "company_ai_configs"("companyId");

-- CreateIndex
CREATE INDEX "ai_usage_logs_companyId_idx" ON "ai_usage_logs"("companyId");

-- CreateIndex
CREATE INDEX "ai_usage_logs_userId_idx" ON "ai_usage_logs"("userId");

-- CreateIndex
CREATE INDEX "ai_usage_logs_operation_idx" ON "ai_usage_logs"("operation");

-- CreateIndex
CREATE INDEX "ai_usage_logs_createdAt_idx" ON "ai_usage_logs"("createdAt");

-- CreateIndex
CREATE INDEX "ai_usage_logs_companyId_createdAt_idx" ON "ai_usage_logs"("companyId", "createdAt");

-- AddForeignKey
ALTER TABLE "company_ai_configs" ADD CONSTRAINT "company_ai_configs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

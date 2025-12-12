-- Add new feature modules to enum
ALTER TYPE "FeatureModule" ADD VALUE IF NOT EXISTS 'API_ACCESS';
ALTER TYPE "FeatureModule" ADD VALUE IF NOT EXISTS 'PRIORITY_SUPPORT';
ALTER TYPE "FeatureModule" ADD VALUE IF NOT EXISTS 'DEDICATED_SUPPORT';

-- Create plan_features table
CREATE TABLE "plan_features" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "module" "FeatureModule" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_features_pkey" PRIMARY KEY ("id")
);

-- Create indexes and constraints
CREATE UNIQUE INDEX "plan_features_planId_module_key" ON "plan_features"("planId", "module");
ALTER TABLE "plan_features" ADD CONSTRAINT "plan_features_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Remove old boolean feature fields from subscription_plans
ALTER TABLE "subscription_plans" DROP COLUMN IF EXISTS "hasMetricsDashboard";
ALTER TABLE "subscription_plans" DROP COLUMN IF EXISTS "hasApiAccess";
ALTER TABLE "subscription_plans" DROP COLUMN IF EXISTS "hasMultiCompany";
ALTER TABLE "subscription_plans" DROP COLUMN IF EXISTS "hasPrioritySupport";
ALTER TABLE "subscription_plans" DROP COLUMN IF EXISTS "hasDedicatedSupport";
ALTER TABLE "subscription_plans" DROP COLUMN IF EXISTS "hasCustomBranding";

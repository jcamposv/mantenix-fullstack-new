-- Migration: Combine HR_VACATIONS and HR_PERMISSIONS into HR_TIME_OFF
-- This migration updates the FeatureModule enum to use a single HR_TIME_OFF feature
-- instead of separate HR_VACATIONS and HR_PERMISSIONS features

-- Step 1: Delete HR_PERMISSIONS records to avoid duplicates
-- We keep HR_VACATIONS and convert it to HR_TIME_OFF
DELETE FROM "plan_features" WHERE "module"::text = 'HR_PERMISSIONS';
DELETE FROM "company_features" WHERE "module"::text = 'HR_PERMISSIONS';

-- Step 2: Create the new enum with HR_TIME_OFF
CREATE TYPE "FeatureModule_new" AS ENUM (
  'HR_ATTENDANCE',
  'HR_TIME_OFF',
  'AI_ASSISTANT',
  'ADVANCED_ANALYTICS',
  'EXTERNAL_CLIENT_MANAGEMENT',
  'INTERNAL_CORPORATE_GROUP',
  'API_ACCESS',
  'PRIORITY_SUPPORT',
  'DEDICATED_SUPPORT'
);

-- Step 3: Update plan_features table to use new enum
ALTER TABLE "plan_features"
  ALTER COLUMN "module" TYPE "FeatureModule_new"
  USING (
    CASE
      WHEN "module"::text = 'HR_VACATIONS' THEN 'HR_TIME_OFF'
      ELSE "module"::text
    END::"FeatureModule_new"
  );

-- Step 4: Update company_features table to use new enum
ALTER TABLE "company_features"
  ALTER COLUMN "module" TYPE "FeatureModule_new"
  USING (
    CASE
      WHEN "module"::text = 'HR_VACATIONS' THEN 'HR_TIME_OFF'
      ELSE "module"::text
    END::"FeatureModule_new"
  );

-- Step 5: Drop old enum and rename new one
DROP TYPE "FeatureModule";
ALTER TYPE "FeatureModule_new" RENAME TO "FeatureModule";

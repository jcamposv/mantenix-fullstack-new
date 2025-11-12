-- CreateEnum
CREATE TYPE "FeatureModule" AS ENUM ('HR_ATTENDANCE', 'HR_VACATIONS', 'HR_PERMISSIONS', 'AI_ASSISTANT', 'ADVANCED_ANALYTICS');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('ON_TIME', 'LATE', 'ABSENT', 'JUSTIFIED', 'EARLY_DEPARTURE');

-- CreateTable
CREATE TABLE "company_features" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "module" "FeatureModule" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "enabledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enabledBy" TEXT,
    "disabledAt" TIMESTAMP(3),
    "disabledBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_locations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radiusMeters" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "locationId" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "checkInAt" TIMESTAMP(3) NOT NULL,
    "checkOutAt" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL,
    "notes" TEXT,
    "isManualEntry" BOOLEAN NOT NULL DEFAULT false,
    "manualEntryBy" TEXT,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "workDurationMinutes" INTEGER,
    "lateMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_features_companyId_idx" ON "company_features"("companyId");

-- CreateIndex
CREATE INDEX "company_features_module_idx" ON "company_features"("module");

-- CreateIndex
CREATE INDEX "company_features_isEnabled_idx" ON "company_features"("isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "company_features_companyId_module_key" ON "company_features"("companyId", "module");

-- CreateIndex
CREATE INDEX "company_locations_companyId_idx" ON "company_locations"("companyId");

-- CreateIndex
CREATE INDEX "company_locations_isActive_idx" ON "company_locations"("isActive");

-- CreateIndex
CREATE INDEX "attendance_records_companyId_idx" ON "attendance_records"("companyId");

-- CreateIndex
CREATE INDEX "attendance_records_userId_idx" ON "attendance_records"("userId");

-- CreateIndex
CREATE INDEX "attendance_records_locationId_idx" ON "attendance_records"("locationId");

-- CreateIndex
CREATE INDEX "attendance_records_checkInAt_idx" ON "attendance_records"("checkInAt");

-- CreateIndex
CREATE INDEX "attendance_records_status_idx" ON "attendance_records"("status");

-- CreateIndex
CREATE INDEX "attendance_records_companyId_userId_checkInAt_idx" ON "attendance_records"("companyId", "userId", "checkInAt");

-- AddForeignKey
ALTER TABLE "company_features" ADD CONSTRAINT "company_features_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_features" ADD CONSTRAINT "company_features_enabledBy_fkey" FOREIGN KEY ("enabledBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_locations" ADD CONSTRAINT "company_locations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "company_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

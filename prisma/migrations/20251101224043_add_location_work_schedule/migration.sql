-- AlterTable
ALTER TABLE "company_locations" ADD COLUMN     "lateToleranceMinutes" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'America/Costa_Rica',
ADD COLUMN     "workDays" TEXT[] DEFAULT ARRAY['MON', 'TUE', 'WED', 'THU', 'FRI']::TEXT[],
ADD COLUMN     "workEndTime" TEXT NOT NULL DEFAULT '17:00',
ADD COLUMN     "workStartTime" TEXT NOT NULL DEFAULT '08:00';

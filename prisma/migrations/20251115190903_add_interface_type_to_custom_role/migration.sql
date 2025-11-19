-- CreateEnum
CREATE TYPE "InterfaceType" AS ENUM ('MOBILE', 'DASHBOARD', 'BOTH');

-- AlterTable
ALTER TABLE "custom_roles" ADD COLUMN     "interfaceType" "InterfaceType" NOT NULL DEFAULT 'MOBILE';

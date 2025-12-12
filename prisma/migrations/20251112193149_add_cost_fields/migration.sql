-- AlterTable
ALTER TABLE "user" ADD COLUMN     "hourlyRate" DECIMAL(10,2) DEFAULT 20.00;

-- AlterTable
ALTER TABLE "work_orders" ADD COLUMN     "laborCost" DOUBLE PRECISION,
ADD COLUMN     "otherCosts" DOUBLE PRECISION,
ADD COLUMN     "partsCost" DOUBLE PRECISION;

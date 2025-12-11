-- AlterTable
ALTER TABLE "work_orders" ADD COLUMN     "qaComments" TEXT,
ADD COLUMN     "qaRejectedAt" TIMESTAMP(3),
ADD COLUMN     "qaRejectedBy" TEXT,
ADD COLUMN     "qaSignedOffAt" TIMESTAMP(3),
ADD COLUMN     "qaSignedOffBy" TEXT,
ADD COLUMN     "requiresQA" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_qaSignedOffBy_fkey" FOREIGN KEY ("qaSignedOffBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_qaRejectedBy_fkey" FOREIGN KEY ("qaRejectedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

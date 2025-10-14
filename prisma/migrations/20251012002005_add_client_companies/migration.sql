-- CreateTable
CREATE TABLE "client_companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT,
    "logo" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "contactName" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantCompanyId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "client_companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_companies_tenantCompanyId_idx" ON "client_companies"("tenantCompanyId");

-- CreateIndex
CREATE INDEX "client_companies_isActive_idx" ON "client_companies"("isActive");

-- AddForeignKey
ALTER TABLE "client_companies" ADD CONSTRAINT "client_companies_tenantCompanyId_fkey" FOREIGN KEY ("tenantCompanyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_companies" ADD CONSTRAINT "client_companies_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

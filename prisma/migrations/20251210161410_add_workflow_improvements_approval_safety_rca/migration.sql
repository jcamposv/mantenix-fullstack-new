-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PermitType" AS ENUM ('HOT_WORK', 'CONFINED_SPACE', 'ELECTRICAL', 'HEIGHT_WORK', 'EXCAVATION', 'CHEMICAL', 'RADIATION', 'GENERAL');

-- CreateEnum
CREATE TYPE "PermitStatus" AS ENUM ('DRAFT', 'PENDING_AUTHORIZATION', 'ACTIVE', 'SUSPENDED', 'CLOSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "LOTOStatus" AS ENUM ('PENDING', 'APPLIED', 'VERIFIED', 'REMOVED');

-- CreateEnum
CREATE TYPE "JSAStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RCAType" AS ENUM ('FIVE_WHY', 'FISHBONE', 'FAULT_TREE', 'PARETO');

-- CreateEnum
CREATE TYPE "RCAStatus" AS ENUM ('DRAFT', 'IN_ANALYSIS', 'PENDING_REVIEW', 'APPROVED', 'IMPLEMENTING', 'IMPLEMENTED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CORRECTIVE', 'PREVENTIVE');

-- CreateEnum
CREATE TYPE "CAPStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'IMPLEMENTED', 'VERIFIED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SignatureEntityType" AS ENUM ('WORK_ORDER', 'WORK_ORDER_APPROVAL', 'WORK_PERMIT', 'LOTO_PROCEDURE', 'JSA', 'RCA', 'CAP_ACTION', 'QA_INSPECTION');

-- CreateEnum
CREATE TYPE "SignatureType" AS ENUM ('CREATED', 'REVIEWED', 'APPROVED', 'AUTHORIZED', 'EXECUTED', 'VERIFIED', 'QA_SIGNOFF', 'CLOSED');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('IMAGE', 'PDF', 'VIDEO', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPROVAL_REQUIRED', 'APPROVAL_APPROVED', 'APPROVAL_REJECTED', 'PERMIT_REQUIRED', 'PERMIT_AUTHORIZED', 'LOTO_APPLIED', 'LOTO_VERIFIED', 'JSA_REQUIRED', 'JSA_APPROVED', 'QA_REQUIRED', 'RCA_REQUIRED', 'RCA_REVIEWED', 'CAPA_ASSIGNED', 'CAPA_DUE', 'WORK_ORDER_ASSIGNED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WorkOrderStatus" ADD VALUE 'PENDING_APPROVAL';
ALTER TYPE "WorkOrderStatus" ADD VALUE 'APPROVED';
ALTER TYPE "WorkOrderStatus" ADD VALUE 'REJECTED';
ALTER TYPE "WorkOrderStatus" ADD VALUE 'PENDING_QA';

-- CreateTable
CREATE TABLE "authority_limits" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "roleKey" TEXT NOT NULL,
    "maxDirectAuthorization" DOUBLE PRECISION NOT NULL,
    "canCreateWorkOrders" BOOLEAN NOT NULL DEFAULT true,
    "canAssignDirectly" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authority_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_rules" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "minCost" DOUBLE PRECISION,
    "maxCost" DOUBLE PRECISION,
    "priority" "WorkOrderPriority",
    "type" "WorkOrderType",
    "assetCriticality" "ComponentCriticality",
    "approvalLevels" INTEGER NOT NULL,
    "requiresQA" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_approvals" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "requiredRole" TEXT,
    "approverId" TEXT,
    "approvedBy" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "comments" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_order_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_permits" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "permitType" "PermitType" NOT NULL,
    "issuedBy" TEXT NOT NULL,
    "authorizedBy" TEXT,
    "status" "PermitStatus" NOT NULL DEFAULT 'DRAFT',
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "hazards" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "precautions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ppe" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "emergencyContact" TEXT,
    "issuedAt" TIMESTAMP(3),
    "authorizedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_permits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loto_procedures" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "authorizedBy" TEXT NOT NULL,
    "status" "LOTOStatus" NOT NULL DEFAULT 'PENDING',
    "isolationPoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "energySources" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lockSerialNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tagNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verifiedBy" TEXT,
    "appliedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "removalAuthorizedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loto_procedures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_safety_analyses" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "preparedBy" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "approvedBy" TEXT,
    "status" "JSAStatus" NOT NULL DEFAULT 'DRAFT',
    "jobSteps" JSONB NOT NULL,
    "preparedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_safety_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "root_cause_analyses" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "assetId" TEXT,
    "analysisType" "RCAType" NOT NULL,
    "failureMode" TEXT NOT NULL,
    "immediateSymptom" TEXT NOT NULL,
    "why1" TEXT,
    "why2" TEXT,
    "why3" TEXT,
    "why4" TEXT,
    "why5" TEXT,
    "rootCause" TEXT,
    "fishboneData" JSONB,
    "analyzedBy" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "status" "RCAStatus" NOT NULL DEFAULT 'DRAFT',
    "analyzedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "implementedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "root_cause_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cap_actions" (
    "id" TEXT NOT NULL,
    "rcaId" TEXT NOT NULL,
    "actionType" "ActionType" NOT NULL,
    "description" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "priority" "WorkOrderPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "CAPStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "effectiveness" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cap_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digital_signatures" (
    "id" TEXT NOT NULL,
    "entityType" "SignatureEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "signedBy" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "signatureType" "SignatureType" NOT NULL,
    "comments" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "certificateFingerprint" TEXT,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "digital_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "entityType" "SignatureEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" "AttachmentType" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entityType" "SignatureEntityType",
    "entityId" TEXT,
    "actionUrl" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "authority_limits_companyId_idx" ON "authority_limits"("companyId");

-- CreateIndex
CREATE INDEX "authority_limits_isActive_idx" ON "authority_limits"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "authority_limits_companyId_roleKey_key" ON "authority_limits"("companyId", "roleKey");

-- CreateIndex
CREATE INDEX "approval_rules_companyId_idx" ON "approval_rules"("companyId");

-- CreateIndex
CREATE INDEX "approval_rules_isActive_idx" ON "approval_rules"("isActive");

-- CreateIndex
CREATE INDEX "work_order_approvals_workOrderId_idx" ON "work_order_approvals"("workOrderId");

-- CreateIndex
CREATE INDEX "work_order_approvals_status_idx" ON "work_order_approvals"("status");

-- CreateIndex
CREATE INDEX "work_order_approvals_level_idx" ON "work_order_approvals"("level");

-- CreateIndex
CREATE INDEX "work_permits_workOrderId_idx" ON "work_permits"("workOrderId");

-- CreateIndex
CREATE INDEX "work_permits_status_idx" ON "work_permits"("status");

-- CreateIndex
CREATE INDEX "work_permits_permitType_idx" ON "work_permits"("permitType");

-- CreateIndex
CREATE INDEX "work_permits_validFrom_validUntil_idx" ON "work_permits"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "loto_procedures_workOrderId_idx" ON "loto_procedures"("workOrderId");

-- CreateIndex
CREATE INDEX "loto_procedures_assetId_idx" ON "loto_procedures"("assetId");

-- CreateIndex
CREATE INDEX "loto_procedures_status_idx" ON "loto_procedures"("status");

-- CreateIndex
CREATE INDEX "job_safety_analyses_workOrderId_idx" ON "job_safety_analyses"("workOrderId");

-- CreateIndex
CREATE INDEX "job_safety_analyses_status_idx" ON "job_safety_analyses"("status");

-- CreateIndex
CREATE INDEX "root_cause_analyses_workOrderId_idx" ON "root_cause_analyses"("workOrderId");

-- CreateIndex
CREATE INDEX "root_cause_analyses_assetId_idx" ON "root_cause_analyses"("assetId");

-- CreateIndex
CREATE INDEX "root_cause_analyses_status_idx" ON "root_cause_analyses"("status");

-- CreateIndex
CREATE INDEX "root_cause_analyses_analysisType_idx" ON "root_cause_analyses"("analysisType");

-- CreateIndex
CREATE INDEX "cap_actions_rcaId_idx" ON "cap_actions"("rcaId");

-- CreateIndex
CREATE INDEX "cap_actions_assignedTo_idx" ON "cap_actions"("assignedTo");

-- CreateIndex
CREATE INDEX "cap_actions_status_idx" ON "cap_actions"("status");

-- CreateIndex
CREATE INDEX "cap_actions_dueDate_idx" ON "cap_actions"("dueDate");

-- CreateIndex
CREATE INDEX "digital_signatures_entityType_entityId_idx" ON "digital_signatures"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "digital_signatures_signedBy_idx" ON "digital_signatures"("signedBy");

-- CreateIndex
CREATE INDEX "digital_signatures_signedAt_idx" ON "digital_signatures"("signedAt");

-- CreateIndex
CREATE INDEX "attachments_entityType_entityId_idx" ON "attachments"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "attachments_uploadedBy_idx" ON "attachments"("uploadedBy");

-- CreateIndex
CREATE INDEX "attachments_createdAt_idx" ON "attachments"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_entityType_entityId_idx" ON "notifications"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "authority_limits" ADD CONSTRAINT "authority_limits_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_rules" ADD CONSTRAINT "approval_rules_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_approvals" ADD CONSTRAINT "work_order_approvals_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_approvals" ADD CONSTRAINT "work_order_approvals_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permits" ADD CONSTRAINT "work_permits_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permits" ADD CONSTRAINT "work_permits_issuedBy_fkey" FOREIGN KEY ("issuedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_permits" ADD CONSTRAINT "work_permits_authorizedBy_fkey" FOREIGN KEY ("authorizedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loto_procedures" ADD CONSTRAINT "loto_procedures_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loto_procedures" ADD CONSTRAINT "loto_procedures_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loto_procedures" ADD CONSTRAINT "loto_procedures_authorizedBy_fkey" FOREIGN KEY ("authorizedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loto_procedures" ADD CONSTRAINT "loto_procedures_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loto_procedures" ADD CONSTRAINT "loto_procedures_removalAuthorizedBy_fkey" FOREIGN KEY ("removalAuthorizedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_safety_analyses" ADD CONSTRAINT "job_safety_analyses_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_safety_analyses" ADD CONSTRAINT "job_safety_analyses_preparedBy_fkey" FOREIGN KEY ("preparedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_safety_analyses" ADD CONSTRAINT "job_safety_analyses_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_safety_analyses" ADD CONSTRAINT "job_safety_analyses_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "root_cause_analyses" ADD CONSTRAINT "root_cause_analyses_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "root_cause_analyses" ADD CONSTRAINT "root_cause_analyses_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "root_cause_analyses" ADD CONSTRAINT "root_cause_analyses_analyzedBy_fkey" FOREIGN KEY ("analyzedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "root_cause_analyses" ADD CONSTRAINT "root_cause_analyses_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cap_actions" ADD CONSTRAINT "cap_actions_rcaId_fkey" FOREIGN KEY ("rcaId") REFERENCES "root_cause_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cap_actions" ADD CONSTRAINT "cap_actions_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cap_actions" ADD CONSTRAINT "cap_actions_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_signatures" ADD CONSTRAINT "digital_signatures_signedBy_fkey" FOREIGN KEY ("signedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

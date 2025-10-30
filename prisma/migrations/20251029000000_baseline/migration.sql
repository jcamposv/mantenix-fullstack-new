-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN_EMPRESA', 'SUPERVISOR', 'TECNICO', 'CLIENTE_ADMIN_GENERAL', 'CLIENTE_ADMIN_SEDE', 'CLIENTE_OPERARIO');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('SUCCESS', 'WARNING', 'ERROR');

-- CreateEnum
CREATE TYPE "SecurityEventType" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_CHANGE', 'MFA_ENABLED', 'MFA_DISABLED', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED', 'PERMISSION_DENIED', 'SUSPICIOUS_ACTIVITY');

-- CreateEnum
CREATE TYPE "AlertPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('EQUIPMENT_FAILURE', 'MAINTENANCE_REQUIRED', 'PREVENTIVE_MAINTENANCE', 'SAFETY_ISSUE', 'SUPPLY_SHORTAGE', 'ENVIRONMENTAL_ISSUE', 'OPERATIONAL_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('OPERATIVO', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO');

-- CreateEnum
CREATE TYPE "WorkOrderTemplateStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "WorkOrderType" AS ENUM ('PREVENTIVO', 'CORRECTIVO', 'REPARACION');

-- CreateEnum
CREATE TYPE "WorkOrderPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('DRAFT', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CustomFieldType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'SELECT', 'RADIO', 'CHECKBOX', 'CHECKLIST', 'DATE', 'TIME', 'DATETIME', 'IMAGE_BEFORE', 'IMAGE_AFTER', 'VIDEO_BEFORE', 'VIDEO_AFTER', 'FILE');

-- CreateEnum
CREATE TYPE "EmailTemplateType" AS ENUM ('WELCOME', 'USER_INVITATION', 'WORK_ORDER_CREATED', 'WORK_ORDER_COMPLETED', 'WORK_ORDER_CANCELLED', 'ALERT_CREATED', 'ALERT_ASSIGNED', 'ALERT_RESOLVED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TECNICO',
    "companyId" TEXT,
    "isExternalUser" BOOLEAN NOT NULL DEFAULT false,
    "clientCompanyId" TEXT,
    "siteId" TEXT,
    "avatar" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "preferences" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isMfaVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "logo" TEXT,
    "logoSmall" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#64748b',
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "customFont" TEXT,
    "mfaEnforced" BOOLEAN NOT NULL DEFAULT false,
    "ipWhitelist" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tier" "Tier" NOT NULL DEFAULT 'STARTER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "contactName" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientCompanyId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AssetStatus" NOT NULL DEFAULT 'OPERATIVO',
    "manufacturer" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "estimatedLifespan" INTEGER,
    "category" TEXT,
    "customFields" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "siteId" TEXT NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "status" "AuditStatus" NOT NULL DEFAULT 'SUCCESS',
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_events" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "SecurityEventType" NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "description" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "metadata" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "companyId" TEXT NOT NULL,
    "isExternalUser" BOOLEAN NOT NULL DEFAULT false,
    "clientCompanyId" TEXT,
    "siteId" TEXT,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "priority" "AlertPriority" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
    "location" TEXT,
    "equipmentId" TEXT,
    "images" TEXT[],
    "documents" TEXT[],
    "estimatedResolutionTime" INTEGER,
    "actualResolutionTime" INTEGER,
    "resolutionNotes" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "siteId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "resolvedById" TEXT,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alertId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "alert_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alertId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "alert_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "status" "WorkOrderTemplateStatus" NOT NULL DEFAULT 'ACTIVE',
    "customFields" JSONB,
    "companyId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_order_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_prefixes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "companyId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_order_prefixes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "prefixId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "WorkOrderType" NOT NULL,
    "priority" "WorkOrderPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "siteId" TEXT NOT NULL,
    "assetId" TEXT,
    "templateId" TEXT,
    "customFieldValues" JSONB,
    "scheduledDate" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "estimatedDuration" INTEGER,
    "estimatedCost" DOUBLE PRECISION,
    "actualDuration" INTEGER,
    "actualCost" DOUBLE PRECISION,
    "instructions" TEXT,
    "safetyNotes" TEXT,
    "tools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "materials" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "observations" TEXT,
    "completionNotes" TEXT,
    "companyId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_assignments" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "work_order_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_configurations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "apiToken" TEXT NOT NULL,
    "domainId" TEXT,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "replyToEmail" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" TEXT NOT NULL,
    "emailConfigurationId" TEXT NOT NULL,
    "type" "EmailTemplateType" NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "templateId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_identifier_value_key" ON "verification"("identifier", "value");

-- CreateIndex
CREATE UNIQUE INDEX "companies_subdomain_key" ON "companies"("subdomain");

-- CreateIndex
CREATE INDEX "companies_subdomain_idx" ON "companies"("subdomain");

-- CreateIndex
CREATE INDEX "companies_isActive_idx" ON "companies"("isActive");

-- CreateIndex
CREATE INDEX "client_companies_tenantCompanyId_idx" ON "client_companies"("tenantCompanyId");

-- CreateIndex
CREATE INDEX "client_companies_isActive_idx" ON "client_companies"("isActive");

-- CreateIndex
CREATE INDEX "sites_clientCompanyId_idx" ON "sites"("clientCompanyId");

-- CreateIndex
CREATE INDEX "sites_isActive_idx" ON "sites"("isActive");

-- CreateIndex
CREATE INDEX "assets_siteId_idx" ON "assets"("siteId");

-- CreateIndex
CREATE INDEX "assets_status_idx" ON "assets"("status");

-- CreateIndex
CREATE INDEX "assets_category_idx" ON "assets"("category");

-- CreateIndex
CREATE INDEX "assets_isActive_idx" ON "assets"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "assets_code_siteId_key" ON "assets"("code", "siteId");

-- CreateIndex
CREATE INDEX "audit_logs_companyId_createdAt_idx" ON "audit_logs"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_companyId_idx" ON "audit_logs"("action", "companyId");

-- CreateIndex
CREATE INDEX "security_events_companyId_createdAt_idx" ON "security_events"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "security_events_userId_createdAt_idx" ON "security_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "security_events_type_severity_idx" ON "security_events"("type", "severity");

-- CreateIndex
CREATE INDEX "security_events_resolved_idx" ON "security_events"("resolved");

-- CreateIndex
CREATE UNIQUE INDEX "user_invitations_token_key" ON "user_invitations"("token");

-- CreateIndex
CREATE INDEX "user_invitations_email_idx" ON "user_invitations"("email");

-- CreateIndex
CREATE INDEX "user_invitations_token_idx" ON "user_invitations"("token");

-- CreateIndex
CREATE INDEX "user_invitations_companyId_idx" ON "user_invitations"("companyId");

-- CreateIndex
CREATE INDEX "user_invitations_createdBy_idx" ON "user_invitations"("createdBy");

-- CreateIndex
CREATE INDEX "user_invitations_clientCompanyId_idx" ON "user_invitations"("clientCompanyId");

-- CreateIndex
CREATE INDEX "user_invitations_siteId_idx" ON "user_invitations"("siteId");

-- CreateIndex
CREATE INDEX "alerts_siteId_status_idx" ON "alerts"("siteId", "status");

-- CreateIndex
CREATE INDEX "alerts_priority_status_idx" ON "alerts"("priority", "status");

-- CreateIndex
CREATE INDEX "alerts_reportedById_idx" ON "alerts"("reportedById");

-- CreateIndex
CREATE INDEX "alerts_assignedToId_idx" ON "alerts"("assignedToId");

-- CreateIndex
CREATE INDEX "alerts_type_idx" ON "alerts"("type");

-- CreateIndex
CREATE INDEX "alerts_reportedAt_idx" ON "alerts"("reportedAt");

-- CreateIndex
CREATE INDEX "alert_comments_alertId_idx" ON "alert_comments"("alertId");

-- CreateIndex
CREATE INDEX "alert_comments_authorId_idx" ON "alert_comments"("authorId");

-- CreateIndex
CREATE INDEX "alert_notifications_alertId_idx" ON "alert_notifications"("alertId");

-- CreateIndex
CREATE INDEX "alert_notifications_userId_idx" ON "alert_notifications"("userId");

-- CreateIndex
CREATE INDEX "alert_notifications_status_idx" ON "alert_notifications"("status");

-- CreateIndex
CREATE INDEX "alert_notifications_type_idx" ON "alert_notifications"("type");

-- CreateIndex
CREATE INDEX "work_order_templates_companyId_idx" ON "work_order_templates"("companyId");

-- CreateIndex
CREATE INDEX "work_order_templates_status_idx" ON "work_order_templates"("status");

-- CreateIndex
CREATE INDEX "work_order_templates_category_idx" ON "work_order_templates"("category");

-- CreateIndex
CREATE INDEX "work_order_templates_isActive_idx" ON "work_order_templates"("isActive");

-- CreateIndex
CREATE INDEX "work_order_templates_createdBy_idx" ON "work_order_templates"("createdBy");

-- CreateIndex
CREATE INDEX "work_order_prefixes_companyId_idx" ON "work_order_prefixes"("companyId");

-- CreateIndex
CREATE INDEX "work_order_prefixes_isActive_idx" ON "work_order_prefixes"("isActive");

-- CreateIndex
CREATE INDEX "work_order_prefixes_createdBy_idx" ON "work_order_prefixes"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_prefixes_companyId_code_key" ON "work_order_prefixes"("companyId", "code");

-- CreateIndex
CREATE INDEX "work_orders_companyId_idx" ON "work_orders"("companyId");

-- CreateIndex
CREATE INDEX "work_orders_siteId_idx" ON "work_orders"("siteId");

-- CreateIndex
CREATE INDEX "work_orders_assetId_idx" ON "work_orders"("assetId");

-- CreateIndex
CREATE INDEX "work_orders_templateId_idx" ON "work_orders"("templateId");

-- CreateIndex
CREATE INDEX "work_orders_prefixId_idx" ON "work_orders"("prefixId");

-- CreateIndex
CREATE INDEX "work_orders_status_idx" ON "work_orders"("status");

-- CreateIndex
CREATE INDEX "work_orders_type_idx" ON "work_orders"("type");

-- CreateIndex
CREATE INDEX "work_orders_priority_idx" ON "work_orders"("priority");

-- CreateIndex
CREATE INDEX "work_orders_scheduledDate_idx" ON "work_orders"("scheduledDate");

-- CreateIndex
CREATE INDEX "work_orders_createdBy_idx" ON "work_orders"("createdBy");

-- CreateIndex
CREATE INDEX "work_orders_isActive_idx" ON "work_orders"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_companyId_number_key" ON "work_orders"("companyId", "number");

-- CreateIndex
CREATE INDEX "work_order_assignments_workOrderId_idx" ON "work_order_assignments"("workOrderId");

-- CreateIndex
CREATE INDEX "work_order_assignments_userId_idx" ON "work_order_assignments"("userId");

-- CreateIndex
CREATE INDEX "work_order_assignments_assignedBy_idx" ON "work_order_assignments"("assignedBy");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_assignments_workOrderId_userId_key" ON "work_order_assignments"("workOrderId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "email_configurations_companyId_key" ON "email_configurations"("companyId");

-- CreateIndex
CREATE INDEX "email_configurations_companyId_idx" ON "email_configurations"("companyId");

-- CreateIndex
CREATE INDEX "email_configurations_isActive_idx" ON "email_configurations"("isActive");

-- CreateIndex
CREATE INDEX "email_templates_emailConfigurationId_idx" ON "email_templates"("emailConfigurationId");

-- CreateIndex
CREATE INDEX "email_templates_type_idx" ON "email_templates"("type");

-- CreateIndex
CREATE INDEX "email_templates_isActive_idx" ON "email_templates"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_emailConfigurationId_type_key" ON "email_templates"("emailConfigurationId", "type");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "client_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_companies" ADD CONSTRAINT "client_companies_tenantCompanyId_fkey" FOREIGN KEY ("tenantCompanyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_companies" ADD CONSTRAINT "client_companies_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "client_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "client_companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_comments" ADD CONSTRAINT "alert_comments_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_comments" ADD CONSTRAINT "alert_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_notifications" ADD CONSTRAINT "alert_notifications_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_notifications" ADD CONSTRAINT "alert_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_templates" ADD CONSTRAINT "work_order_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_templates" ADD CONSTRAINT "work_order_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_prefixes" ADD CONSTRAINT "work_order_prefixes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_prefixes" ADD CONSTRAINT "work_order_prefixes_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "work_order_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_prefixId_fkey" FOREIGN KEY ("prefixId") REFERENCES "work_order_prefixes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_assignments" ADD CONSTRAINT "work_order_assignments_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_assignments" ADD CONSTRAINT "work_order_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_assignments" ADD CONSTRAINT "work_order_assignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_configurations" ADD CONSTRAINT "email_configurations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_emailConfigurationId_fkey" FOREIGN KEY ("emailConfigurationId") REFERENCES "email_configurations"("id") ON DELETE CASCADE ON UPDATE CASCADE;


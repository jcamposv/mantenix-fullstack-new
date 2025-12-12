-- CreateEnum
CREATE TYPE "InterfaceType" AS ENUM ('MOBILE', 'DASHBOARD', 'BOTH');

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "interfaceType" "InterfaceType" NOT NULL DEFAULT 'MOBILE',
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "custom_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_role_permissions" (
    "id" TEXT NOT NULL,
    "customRoleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE INDEX "permissions_module_idx" ON "permissions"("module");

-- CreateIndex
CREATE INDEX "permissions_isActive_idx" ON "permissions"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "custom_roles_key_key" ON "custom_roles"("key");

-- CreateIndex
CREATE INDEX "custom_roles_companyId_idx" ON "custom_roles"("companyId");

-- CreateIndex
CREATE INDEX "custom_roles_isActive_idx" ON "custom_roles"("isActive");

-- CreateIndex
CREATE INDEX "custom_roles_isSystemRole_idx" ON "custom_roles"("isSystemRole");

-- CreateIndex
CREATE INDEX "custom_roles_key_idx" ON "custom_roles"("key");

-- CreateIndex
CREATE UNIQUE INDEX "custom_roles_companyId_name_key" ON "custom_roles"("companyId", "name");

-- CreateIndex
CREATE INDEX "custom_role_permissions_customRoleId_idx" ON "custom_role_permissions"("customRoleId");

-- CreateIndex
CREATE INDEX "custom_role_permissions_permissionId_idx" ON "custom_role_permissions"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_role_permissions_customRoleId_permissionId_key" ON "custom_role_permissions"("customRoleId", "permissionId");

-- AlterTable user: Change role from enum to foreign key
ALTER TABLE "user" ADD COLUMN "roleId" TEXT;
ALTER TABLE "user" DROP COLUMN IF EXISTS "role";

-- AlterTable user_invitations: Change role from enum to foreign key
ALTER TABLE "user_invitations" ADD COLUMN "roleId" TEXT;
ALTER TABLE "user_invitations" DROP COLUMN IF EXISTS "role";

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "custom_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "custom_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_roles" ADD CONSTRAINT "custom_roles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_role_permissions" ADD CONSTRAINT "custom_role_permissions_customRoleId_fkey" FOREIGN KEY ("customRoleId") REFERENCES "custom_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_role_permissions" ADD CONSTRAINT "custom_role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop old Role enum (after all references are removed)
DROP TYPE IF EXISTS "Role";

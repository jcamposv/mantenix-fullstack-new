# RBAC (Role-Based Access Control) System

## Overview

This is a **centralized, type-safe RBAC system** that follows SOLID principles and eliminates code duplication.

## 🎯 Problem Solved

**Before**: Adding a new role required updating **9+ files**:
- `permission.helper.ts` (ROLES enum)
- `permission.helper.ts` (ROLE_PERMISSIONS)
- `auth.types.ts` (UserRole type)
- `user-schemas.ts` (API schema)
- `user-form-schema.ts` (Frontend schema)
- `user-form-constants.ts` (ROLES array)
- `user-form-utils.ts` (getRoleBadgeVariant)
- `user-form.tsx` (allowedRoles logic)
- `user-role-field.tsx` (filter logic)

**After**: Adding a new role requires **1 simple change**:
1. Add role to Prisma schema enum
2. Add definition in `role-definitions.ts`
3. Done! Everything else is automatic

## 📁 File Structure

```
src/lib/rbac/
├── role-definitions.ts   # Single source of truth
├── role-schemas.ts       # Dynamic Zod schemas
└── README.md            # This file
```

## 🚀 How to Add a New Role

### Step 1: Add to Prisma Schema

```prisma
// prisma/schema.prisma
enum Role {
  SUPER_ADMIN
  ADMIN_GRUPO
  ADMIN_EMPRESA
  NEW_ROLE  // ← Add here
  // ...
}
```

### Step 2: Add Definition

```typescript
// src/lib/rbac/role-definitions.ts
export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  // ... existing roles ...

  NEW_ROLE: {
    value: 'NEW_ROLE',
    label: 'New Role',
    description: 'Description of what this role does',
    badgeVariant: 'secondary', // 'default' | 'destructive' | 'secondary' | 'outline'
    permissions: [], // Will be populated from PermissionHelper
    needsCompany: true,
    canBeCreatedBy: ['SUPER_ADMIN', 'ADMIN_GRUPO', 'ADMIN_EMPRESA'],
    mobileOnly: false,
    webAccessRestricted: false
  }
};
```

### Step 3: Done!

That's it. No need to update schemas, forms, utilities, or middleware.

## 🔧 Usage

### In Components

```typescript
import { ALL_ROLES, getRolesCreatableBy } from '@/lib/rbac/role-definitions';

// Get all roles
const roles = ALL_ROLES;

// Get roles a user can create
const creatableRoles = getRolesCreatableBy('ADMIN_EMPRESA');
```

### In Forms

```typescript
import { roleSchema } from '@/lib/rbac/role-schemas';

const mySchema = z.object({
  role: roleSchema, // Automatically includes all roles
});
```

### In Middleware

```typescript
import { getMobileOnlyRoles } from '@/lib/rbac/role-definitions';

const mobileOnlyRoles = getMobileOnlyRoles(); // ['TECNICO', 'SUPERVISOR', ...]
```

## 📚 Available Utilities

### From `role-definitions.ts`

```typescript
// Get all roles as array
ALL_ROLES: RoleDefinition[]

// Get all role values
ROLE_VALUES: Role[]

// Get roles creatable by a specific role
getRolesCreatableBy(creatorRole: Role): RoleDefinition[]

// Get mobile-only roles
getMobileOnlyRoles(): Role[]

// Get web-restricted roles
getWebRestrictedRoles(): Role[]

// Check if role needs company
roleNeedsCompany(role: Role): boolean

// Get badge variant
getRoleBadgeVariant(role: Role): BadgeVariant

// Get full definition
getRoleDefinition(role: Role): RoleDefinition | undefined
```

### From `role-schemas.ts`

```typescript
// Zod schema for all roles
roleSchema: z.ZodEnum<[Role, ...Role[]]>

// Create schema for specific creator
createRoleSchemaFor(creatorRole: Role): z.ZodEnum<[Role, ...Role[]]>
```

## 🏗️ Architecture Benefits

### 1. Single Source of Truth
All role configuration in one place (`role-definitions.ts`)

### 2. Type Safety
Uses Prisma-generated `Role` enum, ensuring perfect sync with database

### 3. No Code Duplication
Schemas, constants, and utilities generated dynamically

### 4. SOLID Principles
- **Single Responsibility**: Each utility has one purpose
- **Open/Closed**: Easy to extend without modifying existing code
- **Dependency Inversion**: Components depend on abstractions

### 5. Easy Maintenance
Add a role = add one object. Everything else updates automatically.

## 🔐 Permission Integration

The RBAC system works alongside the existing `PermissionHelper`:

```typescript
// Roles are defined in role-definitions.ts
// Permissions are defined in permission.helper.ts
// They work together seamlessly
```

When adding a new role:
1. Define the role in `role-definitions.ts`
2. Define its permissions in `permission.helper.ts` ROLE_PERMISSIONS

## 🎨 Badge Variants

```typescript
badgeVariant: 'default'      // Blue - Admin roles
badgeVariant: 'destructive'  // Red - Super Admin
badgeVariant: 'secondary'    // Gray - Operational roles
badgeVariant: 'outline'      // White - External client roles
```

## 📝 Example: Complete Role Definition

```typescript
JEFE_MANTENIMIENTO: {
  value: 'JEFE_MANTENIMIENTO',
  label: 'Maintenance Chief',
  description: 'Manage work orders and approve requests',
  badgeVariant: 'secondary',
  permissions: [], // Populated from PermissionHelper
  needsCompany: true, // Requires company assignment
  canBeCreatedBy: ['SUPER_ADMIN', 'ADMIN_GRUPO', 'ADMIN_EMPRESA'],
  mobileOnly: false, // Has web access
  webAccessRestricted: false // Not restricted to mobile
}
```

## 🧪 Testing

When testing new roles:

```typescript
import { getRoleDefinition, roleNeedsCompany } from '@/lib/rbac/role-definitions';

// Test role definition
const roleDef = getRoleDefinition('NEW_ROLE');
expect(roleDef).toBeDefined();

// Test company requirement
expect(roleNeedsCompany('NEW_ROLE')).toBe(true);
```

## 🚦 Migration Notes

All existing code has been migrated to use this system:
- ✅ API schemas
- ✅ Frontend schemas
- ✅ Form components
- ✅ Utilities
- ✅ Middleware
- ✅ Type definitions

No breaking changes. Everything is backward compatible.

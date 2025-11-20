# API Response Standardization Guide

This document describes the standardization of paginated API responses across the entire application.

## Objective

Unify all paginated API responses to use a consistent structure: `{ items, total, page, limit, totalPages }`

## Current State Analysis

**Total files requiring changes: 59**
- **21 repositories** in `src/server/repositories/`
- **20 services** in `src/server/services/`
- **18 API routes** in `src/app/api/`

### Old Patterns (Inconsistent)

```typescript
// Pattern 1: Resource-specific property names
{
  workOrders: [...],
  total: 100,
  page: 1,
  limit: 20,
  totalPages: 5
}

// Pattern 2: Different resource names
{
  alerts: [...],
  total: 50,
  page: 1,
  limit: 20,
  totalPages: 3
}

// Pattern 3: Nested pagination
{
  workOrders: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5
  }
}
```

### New Standard (Consistent)

```typescript
{
  items: [...],  // Always "items" regardless of resource type
  total: 100,
  page: 1,
  limit: 20,
  totalPages: 5
}
```

## Type System Updates

### ✅ COMPLETED: Type Definitions

All paginated response types have been standardized:

```typescript
// src/types/common.types.ts
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// All resource-specific types now use this generic
export type PaginatedWorkOrdersResponse = PaginatedResponse<WorkOrderWithRelations>
export type PaginatedAlertsResponse = PaginatedResponse<AlertWithRelations>
export type PaginatedUsersResponse = PaginatedResponse<UserWithRelations>
// ... and 17 more
```

### ✅ COMPLETED: Pagination Utilities

Created comprehensive utilities in `src/lib/pagination-utils.ts`:

- `normalizePagination()` - Validates and normalizes page/limit params
- `createPaginatedResponse()` - Creates standardized response objects
- `toPaginatedResponse()` - Converts query results to paginated responses
- `getPaginationFromRequest()` - Extracts pagination from Request objects
- `calculateTotalPages()` - Calculates total pages
- Helper functions for UI: `hasNextPage()`, `hasPreviousPage()`, `getPageRange()`

## Migration Steps

### Step 1: Repository Layer

Update all 21 repositories to return `items` instead of resource-specific property names.

**Before:**
```typescript
// work-order.repository.ts
return {
  workOrders: serializedWorkOrders,
  total
}
```

**After:**
```typescript
// work-order.repository.ts
return {
  items: serializedWorkOrders,
  total
}
```

**Files to Update:**
1. `work-order.repository.ts` - `workOrders` → `items`
2. `alert.repository.ts` - `alerts` → `items`
3. `user.repository.ts` - `users` → `items`
4. `asset.repository.ts` - `assets` → `items`
5. `site.repository.ts` - `sites` → `items`
6. `client-company.repository.ts` - `clientCompanies` → `items`
7. `company.repository.ts` - `companies` → `items`
8. `company-group.repository.ts` - `companyGroups` → `items`
9. `inventory-item.repository.ts` - Already uses `items` ✅
10. `inventory-movement.repository.ts` - `movements` → `items`
11. `work-order-template.repository.ts` - `templates` → `items`
12. `work-order-schedule.repository.ts` - `schedules` → `items`
13. `email-template.repository.ts` - `templates` → `items`
14. `email-configuration.repository.ts` - `configurations` → `items`
15. `location.repository.ts` - `locations` → `items`
16. `feature.repository.ts` - `features` → `items`
17. `alert-notification.repository.ts` - `notifications` → `items`
18. `attendance.repository.ts` - `records` → `items`
19. `production-line.repository.ts` - `productionLines` → `items`
20. `subscription.repository.ts` - `subscriptions` → `items`
21. `invoice.repository.ts` - `invoices` → `items`

### Step 2: Service Layer

Update all 20 services to use the new pagination utilities and `items` property.

**Before:**
```typescript
// work-order.service.ts
static async list(filters: WorkOrderFilters, page: number, limit: number) {
  const { workOrders, total } = await WorkOrderRepository.findMany(...)

  return {
    workOrders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
}
```

**After:**
```typescript
// work-order.service.ts
import { createPaginatedResponse } from "@/lib/pagination-utils"

static async list(filters: WorkOrderFilters, page: number, limit: number) {
  const { items, total } = await WorkOrderRepository.findMany(...)

  return createPaginatedResponse(items, total, page, limit)
}
```

**Files to Update:**
1. `work-order.service.ts`
2. `client-work-order.service.ts`
3. `alert.service.ts`
4. `asset.service.ts`
5. `site.service.ts`
6. `client-company.service.ts`
7. `company.service.ts`
8. `company-group.service.ts`
9. `user.service.ts`
10. `inventory.service.ts` (3 methods: items, requests, movements)
11. `work-order-template.service.ts`
12. `work-order-schedule.service.ts`
13. `email-template.service.ts`
14. `email-configuration.service.ts`
15. `location.service.ts`
16. `feature.service.ts`
17. `attendance.service.ts`
18. `production-line.service.ts`
19. `subscription.service.ts`
20. `invoice.service.ts`

### Step 3: API Route Layer

Update all 18 API routes to use the standardized response.

**Before:**
```typescript
// /api/work-orders/route.ts
const result = await WorkOrderService.list(filters, page, limit)

return NextResponse.json({
  workOrders: result.workOrders,
  pagination: {
    page,
    limit,
    total: result.total,
    totalPages
  }
})
```

**After:**
```typescript
// /api/work-orders/route.ts
import { getPaginationFromRequest } from "@/lib/pagination-utils"

const { page, limit, skip } = getPaginationFromRequest(request)
const result = await WorkOrderService.list(filters, page, limit)

// Service already returns standardized format
return NextResponse.json(result)
```

**Files to Update:**
1. `app/api/work-orders/route.ts`
2. `app/api/work-orders/my/route.ts`
3. `app/api/client/work-orders/route.ts`
4. `app/api/alerts-notifications/alerts/route.ts`
5. `app/api/production-lines/route.ts`
6. `app/api/super-admin/subscriptions/route.ts`
7. `app/api/work-order-schedules/route.ts`
8. `app/api/admin/assets/route.ts`
9. `app/api/admin/sites/route.ts`
10. `app/api/admin/client-companies/route.ts`
11. `app/api/admin/company-groups/route.ts`
12. `app/api/admin/users/route.ts`
13. `app/api/admin/inventory/items/route.ts`
14. `app/api/admin/inventory/movements/route.ts`
15. `app/api/admin/inventory/requests/route.ts`
16. `app/api/admin/email-templates/route.ts`
17. `app/api/admin/email-configurations/route.ts`
18. `app/api/attendance/route.ts`

### Step 4: Frontend Updates

⚠️ **BREAKING CHANGE**: All frontend code consuming these APIs must be updated.

**Before:**
```typescript
// Frontend component
const { workOrders, total } = await fetch('/api/work-orders').then(r => r.json())

workOrders.map(wo => ...)
```

**After:**
```typescript
// Frontend component
const { items, total } = await fetch('/api/work-orders').then(r => r.json())

items.map(wo => ...)
```

**Search patterns to find frontend usages:**
```bash
# Find all usages of old property names
grep -r "\.workOrders" src/app/
grep -r "\.alerts" src/app/
grep -r "\.users" src/app/
# ... etc for each resource type
```

## Implementation Strategy

### Option 1: Big Bang (Recommended for this project)

Update all layers at once:
1. Update all 21 repositories
2. Update all 20 services
3. Update all 18 API routes
4. Update all frontend code
5. Test thoroughly
6. Deploy

**Pros:**
- Clean cutover
- No intermediate states
- Easier to reason about

**Cons:**
- Large changeset
- Requires comprehensive testing
- All-or-nothing deployment

### Option 2: Gradual Migration (Not recommended)

Implement dual-format support temporarily:

```typescript
// Service returns both formats
return {
  items: [...],              // New format
  workOrders: [...],         // Old format (deprecated)
  total,
  page,
  limit,
  totalPages
}
```

**Pros:**
- Non-breaking initially
- Can migrate frontend gradually

**Cons:**
- Code duplication
- Confusion about which to use
- Two deprecation cycles needed
- More complex

## Testing Checklist

After implementing changes:

- [ ] All repository tests pass
- [ ] All service tests pass
- [ ] All API route tests pass
- [ ] Frontend components render correctly
- [ ] Pagination controls work (next/prev buttons)
- [ ] Page size selectors work
- [ ] Search + pagination works together
- [ ] Filters + pagination works together
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] API responses match OpenAPI spec (if applicable)

## Benefits of Standardization

1. **Consistency**: All paginated endpoints return the same structure
2. **Type Safety**: Generic `PaginatedResponse<T>` works everywhere
3. **Reusability**: Pagination utilities can be shared
4. **Maintainability**: Changes to pagination logic happen in one place
5. **Developer Experience**: Easier to learn, one pattern to remember
6. **Client Libraries**: Can create generic pagination hooks/utilities

## Example: Complete Flow

### Repository
```typescript
// src/server/repositories/work-order.repository.ts
static async findMany(
  where: Prisma.WorkOrderWhereInput,
  page: number,
  limit: number
): Promise<{ items: WorkOrderWithRelations[]; total: number }> {
  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    prisma.workOrder.findMany({
      where,
      skip,
      take: limit,
      include: { ... }
    }),
    prisma.workOrder.count({ where })
  ])

  return { items, total }
}
```

### Service
```typescript
// src/server/services/work-order.service.ts
import { createPaginatedResponse, normalizePagination } from "@/lib/pagination-utils"
import type { PaginatedWorkOrdersResponse } from "@/types/work-order.types"

static async list(
  filters: WorkOrderFilters,
  page?: number,
  limit?: number
): Promise<PaginatedWorkOrdersResponse> {
  const { page: validPage, limit: validLimit } = normalizePagination(page, limit)

  const whereClause = this.buildWhereClause(filters)
  const { items, total } = await WorkOrderRepository.findMany(
    whereClause,
    validPage,
    validLimit
  )

  return createPaginatedResponse(items, total, validPage, validLimit)
}
```

### API Route
```typescript
// src/app/api/work-orders/route.ts
import { getPaginationFromRequest } from "@/lib/pagination-utils"
import { WorkOrderService } from "@/server/services/work-order.service"

export async function GET(request: Request) {
  const { page, limit } = getPaginationFromRequest(request)
  const { searchParams } = new URL(request.url)

  const filters: WorkOrderFilters = {
    status: searchParams.get('status') as WorkOrderStatus | undefined,
    priority: searchParams.get('priority') as WorkOrderPriority | undefined,
    // ... other filters
  }

  const result = await WorkOrderService.list(filters, page, limit)

  return NextResponse.json(result)
}
```

### Frontend
```typescript
// src/app/(dashboard)/work-orders/page.tsx
"use client"

import { useState, useEffect } from "react"
import type { PaginatedWorkOrdersResponse } from "@/types/work-order.types"

export default function WorkOrdersPage() {
  const [data, setData] = useState<PaginatedWorkOrdersResponse | null>(null)

  useEffect(() => {
    fetch('/api/work-orders?page=1&limit=20')
      .then(r => r.json())
      .then(setData)
  }, [])

  if (!data) return <div>Loading...</div>

  return (
    <div>
      <h1>Work Orders ({data.total})</h1>
      <ul>
        {data.items.map(wo => (
          <li key={wo.id}>{wo.title}</li>
        ))}
      </ul>
      <Pagination
        currentPage={data.page}
        totalPages={data.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
```

## Status

- ✅ Type definitions standardized
- ✅ Pagination utilities created
- ⏳ Repositories update (0/21 completed)
- ⏳ Services update (0/20 completed)
- ⏳ API routes update (0/18 completed)
- ⏳ Frontend update (not started)

## Next Steps

1. Update repositories layer (21 files)
2. Update services layer (20 files)
3. Update API routes layer (18 files)
4. Update frontend components
5. Test comprehensively
6. Document in API documentation

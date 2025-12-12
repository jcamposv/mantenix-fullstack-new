# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- **Development**: `npm run dev` (uses Turbopack for fast builds)
- **Build**: `npm run build` (generates Prisma Client, runs migrations, builds with Turbopack)
- **Start**: `npm run start` (production server)
- **Lint**: `npm run lint` (ESLint)
- **Database**:
  - `npm run db:push` - Push schema changes without migrations
  - `npm run db:migrate` - Create and apply new migration
  - `npm run db:seed` - Seed database with demo data
  - `npm run db:studio` - Open Prisma Studio
  - `npm run db:reset` - Reset database completely

## Architecture Overview

This is a **multi-tenant SaaS platform** for work order and maintenance management with enterprise-grade security features. Built with Next.js 15 App Router.

### Multi-Tenancy Model

**Subdomain-based isolation**: Each company has its own subdomain (e.g., `acme.mantenix.com`, `techservices.mantenix.com`)

- All data is scoped by `companyId` at the database level
- Middleware (`middleware.ts`) handles subdomain detection and company context
- Company context is set via `getCurrentCompanyId()` helper and accessed throughout the app
- **Never query across companies** - always filter by `companyId`

**Key architectural patterns:**
```typescript
// ❌ Wrong - No company filter
const users = await prisma.user.findMany()

// ✅ Correct - Always scope by company
const users = await prisma.user.findMany({
  where: { companyId }
})
```

### Layered Architecture (Next.js Expert Standards)

**Repository → Service → API Route → Page/Component**

1. **Repositories** (`/src/server/repositories/*.repository.ts`)
   - Direct Prisma queries
   - Data access layer only
   - No business logic
   - Always filter by `companyId`
   - Return Prisma types

2. **Services** (`/src/server/services/*.service.ts`)
   - Business logic layer
   - Orchestrate multiple repositories
   - Export static methods (stateless)
   - Type-safe operations
   - Follow SOLID principles

3. **API Routes** (`/src/app/api/**/*.ts`)
   - Thin controllers
   - Authentication/authorization checks
   - Input validation with Zod
   - Delegate to services
   - Use `NextRequest`/`NextResponse`

4. **Pages/Components** (`/src/app/**/*.tsx`, `/src/components/**/*.tsx`)
   - Client components use `'use client'` directive
   - Server components for data fetching
   - SWR for client-side data fetching
   - React Hook Form + Zod for forms

**Example flow:**
```typescript
// 1. Repository
export class UserRepository {
  static async findByCompany(companyId: string) {
    return prisma.user.findMany({ where: { companyId } })
  }
}

// 2. Service
export class UserService {
  static async getActiveUsers(companyId: string) {
    return UserRepository.findByCompany(companyId)
      .then(users => users.filter(u => u.isActive))
  }
}

// 3. API Route
export async function GET(request: NextRequest) {
  const session = await AuthService.getAuthenticatedSession()
  const companyId = await getCurrentCompanyId(session)
  const users = await UserService.getActiveUsers(companyId)
  return NextResponse.json({ users })
}

// 4. Component (Client)
'use client'
export function UserList() {
  const { data } = useSWR('/api/users', fetcher)
  return <DataTable data={data?.users} />
}
```

### Authentication & Authorization

**Better Auth** handles sessions, MFA, and middleware:
- Configuration: `/src/lib/auth.ts`
- Client hooks: `/src/lib/auth-client.ts`
- Session middleware in `middleware.ts`

**Role-based permissions:**
- Custom role system (no hardcoded enum)
- Roles stored in `CustomRole` table with `interfaceType` field
- Hierarchy: SUPER_ADMIN > ADMIN_EMPRESA > SUPERVISOR > TECNICO > CLIENTE_ADMIN > CLIENTE_OPERATIVO
- Permission checks via `PermissionService.checkUserPermission()`

**Common patterns:**
```typescript
// In API routes
const session = await AuthService.getAuthenticatedSession()
if (session instanceof NextResponse) return session // Auth error

// Check specific permission
const hasPermission = await PermissionService.checkUserPermission(
  userId,
  'work_orders.create'
)

// Get company context
const companyId = await getCurrentCompanyId(session)
```

### Database Schema & Multi-Tenancy

**Prisma ORM** with PostgreSQL:
- Schema: `/prisma/schema.prisma`
- All tenant data has `companyId` foreign key
- Cascade deletes on company removal
- Unique constraints include `companyId` where applicable

**Key models:**
- `Company` - Tenant root (subdomain, branding, settings)
- `User` - Scoped to company, links to `CustomRole`
- `CustomRole` - Dynamic role system with permissions JSON
- `WorkOrder` - Core business entity
- `Asset` - Equipment/machinery management
- `Alert` - Issue tracking
- `ExplodedViewComponent` - Component hierarchy for maintenance
- `InventoryItem` - Stock management
- `MaintenanceAlertHistory` - Predictive maintenance alerts

**Important enums:**
- `ComponentCriticality` (A/B/C) - ISO 14224 standard
- `MaintenanceType` - PREVENTIVE, PREDICTIVE, CORRECTIVE, ROUTINE
- `AlertStatus` - OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED
- `AssetStatus` - OPERATIVO, MANTENIMIENTO, FUERA_DE_SERVICIO

### Feature Flags System

Companies can enable/disable premium modules via `CompanyFeature` table:

**Available modules** (`FeatureModule` enum):
- `PREDICTIVE_MAINTENANCE` - MTBF-based maintenance alerts
- `EXTERNAL_CLIENT_MANAGEMENT` - Client company management
- `ATTENDANCE_TRACKING` - Employee attendance
- `TIME_OFF_MANAGEMENT` - Vacation/PTO tracking
- `INTERNAL_CORPORATE_GROUP` - Corporate group structure
- `AI_ANALYTICS` - OpenAI-powered insights
- `INVENTORY_MANAGEMENT` - Stock tracking
- `PRODUCTION_LINE_MANAGEMENT` - Production line monitoring

**Check features:**
```typescript
const hasFeature = await FeatureService.isModuleEnabled(
  companyId,
  'PREDICTIVE_MAINTENANCE'
)
```

### Predictive Maintenance System

**MTBF-based alerts** following ISO 14224 standards:

1. **Component Hierarchy** (`ExplodedViewComponent`)
   - Tree structure with parent-child relationships
   - MTBF (Mean Time Between Failures) in hours
   - Links to inventory items
   - Criticality rating (A/B/C)

2. **Alert Generation** (`MaintenanceAlertService`)
   - Calculates alerts based on operating hours vs MTBF
   - Considers current stock levels
   - Generates recommendations
   - Auto-syncs to `MaintenanceAlertHistory` table

3. **Alert Management**
   - Status: ACTIVE, RESOLVED, DISMISSED, AUTO_CLOSED
   - Filter by status, severity, date range
   - Create work orders directly from alerts
   - Track resolution history

4. **Cron Job** (`/api/cron/sync-maintenance-alerts`)
   - Runs hourly to sync alerts for all companies
   - Protected with `CRON_SECRET`
   - Configure in `vercel.json` or external cron service

### UI Components (shadcn/ui)

**Component library**: `/src/components/ui/` (New York style, Radix UI primitives)

**Common patterns:**
- `DataTable` - Server-side pagination, filtering, sorting
- `FilterButton` - Reusable filter popover with ScrollArea
- `Form` components - React Hook Form + Zod integration
- `Dialog`/`Sheet` - Modal patterns
- `Select`, `DateRangePicker`, `Calendar` - Form inputs

**DataTable usage:**
```typescript
<DataTable
  columns={columns}
  data={data}
  searchKey="name"
  loading={isLoading}
  manualPagination={true}
  pageCount={totalPages}
  pageIndex={page - 1}
  onPageChange={setPage}
/>
```

### Work Order System

Core business workflow:

1. **Templates** (`WorkOrderTemplate`)
   - Define reusable work order structures
   - Include checklist items, default assignments
   - Custom fields support

2. **Creation**
   - From templates or manual
   - Can be created from alerts
   - Prefix-based numbering system

3. **Lifecycle**
   - Status: PENDING, IN_PROGRESS, COMPLETED, CANCELLED
   - Assignment to technicians
   - Time tracking
   - Photo/document attachments
   - Comment threads

4. **Scheduling** (`WorkOrderSchedule`)
   - FullCalendar integration
   - Resource allocation
   - Conflict detection

### Client-Side Data Fetching

**SWR** for all client-side API calls:
```typescript
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function MyComponent() {
  const { data, error, isLoading, mutate } = useSWR('/api/data', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  })

  // mutate() to manually revalidate
}
```

**Key hooks:**
- `useTableData` - Server-side pagination wrapper (legacy, prefer direct SWR)
- `useMaintenanceAlertsManagement` - Maintenance alerts with filters
- React Hook Form hooks - Form state management

### API Route Patterns

**Standard structure:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/server/services/auth.service'
import { z } from 'zod'

const Schema = z.object({
  name: z.string().min(1),
})

export async function GET(request: NextRequest) {
  try {
    // 1. Auth check
    const session = await AuthService.getAuthenticatedSession()
    if (session instanceof NextResponse) return session

    // 2. Get company context
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      return NextResponse.json({ error: 'Company not found' }, { status: 400 })
    }

    // 3. Parse/validate input
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)

    // 4. Call service
    const data = await MyService.getData(companyId, page)

    // 5. Return response
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await AuthService.getAuthenticatedSession()
    if (session instanceof NextResponse) return session

    // Parse body
    const body = await request.json()
    const validated = Schema.parse(body)

    // ... rest of logic
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    // ... handle other errors
  }
}
```

### TypeScript Standards

**Strict mode enabled** - No `any` types:
- Use Prisma-generated types
- Define interfaces in `/src/types/*.types.ts`
- Use Zod for runtime validation
- `satisfies` operator for type narrowing

**Common type patterns:**
```typescript
import type { Prisma } from '@prisma/client'

// Include relations
type UserWithCompany = Prisma.UserGetPayload<{
  include: { company: true }
}>

// Custom types
export interface MaintenanceAlert {
  id: string
  type: AlertType
  severity: AlertSeverity
  // ... rest
}
```

### Environment Variables

**Required variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Session encryption key
- `BETTER_AUTH_URL` - Base URL for auth callbacks
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` - AWS credentials
- `AWS_REGION` - AWS region (default: us-east-1)
- `COGNITO_USER_POOL_ID` / `COGNITO_CLIENT_ID` - AWS Cognito config
- `ENCRYPTION_MASTER_KEY` - For data encryption
- `CRON_SECRET` - For cron job authentication
- `NEXT_PUBLIC_APP_URL` - Public app URL

### File Organization

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, MFA, reset)
│   ├── (dashboard)/              # Main app pages
│   ├── (field)/                  # Mobile field tech pages
│   ├── api/                      # API routes
│   │   ├── auth/[...all]/        # Better Auth handler
│   │   ├── cron/                 # Cron job endpoints
│   │   └── [feature]/            # Feature-specific APIs
│   └── layout.tsx                # Root layout
├── components/
│   ├── ui/                       # shadcn/ui base components
│   ├── common/                   # Shared components
│   └── [feature]/                # Feature-specific components
├── server/
│   ├── repositories/             # Data access layer (42 repositories)
│   └── services/                 # Business logic layer (43 services)
├── lib/
│   ├── auth.ts                   # Better Auth config
│   ├── auth-client.ts            # Client auth hooks
│   ├── prisma.ts                 # Prisma client singleton
│   ├── company-context.ts        # Company context helpers
│   └── [feature]/                # Feature-specific utilities
├── types/                        # TypeScript type definitions
├── hooks/                        # Custom React hooks
└── schemas/                      # Zod validation schemas

prisma/
├── schema.prisma                 # Database schema
├── migrations/                   # Migration history
└── seed.ts                       # Seed data
```

### Development Workflow

**Local development with subdomains:**

1. Add to `/etc/hosts`:
```
127.0.0.1 acme.localhost
127.0.0.1 techservices.localhost
```

2. Run dev server: `npm run dev`

3. Access companies:
   - `http://acme.localhost:3000`
   - `http://techservices.localhost:3000`

**Database workflow:**
```bash
# 1. Modify schema.prisma
# 2. Create migration
npm run db:migrate
# 3. Name it descriptively (e.g., "add_maintenance_alert_status")
# 4. Commit both schema.prisma and migration files
```

**Git workflow:**
- Feature branches: `feature/nueva-funcionalidad`
- Bugfix branches: `bugfix/correccion-bug`
- Commit convention: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`

### Testing & Building

**Pre-deploy checklist:**
```bash
npm run lint          # No ESLint errors
npm run build         # Successful build
# Manual testing in browser
```

**Turbopack** is enabled for both dev and build for faster performance.

### Common Gotchas

1. **Always scope by companyId** - Forgetting this causes data leakage
2. **Check feature flags** - Use `FeatureService.isModuleEnabled()` before showing premium features
3. **DataTable pagination** - UI is 0-indexed, APIs are usually 1-indexed
4. **React Hook Form** - Wrap in `useCallback` to prevent re-renders
5. **ScrollArea** - Requires explicit height (`h-[400px]` or similar)
6. **Prisma types** - Use `Prisma.UserGetPayload<{...}>` for complex includes
7. **SWR keys** - Must be stable strings, changes trigger refetch
8. **Better Auth sessions** - Check `if (session instanceof NextResponse)` for auth errors
9. **Middleware** - Runs on every request, keep it fast
10. **ISO 14224** - Maintenance standards use specific terminology (MTBF, criticality A/B/C)

### Deployment

**Production build process:**
1. `prisma generate --no-engine` - Generate client
2. `prisma migrate deploy` - Run pending migrations
3. `next build --turbopack` - Build app

**Environment-specific:**
- Dev: Local PostgreSQL, `localhost` subdomains
- Prod: Managed PostgreSQL (SSL required), Vercel deployment, real subdomains

**Cron jobs** (configure in `vercel.json`):
```json
{
  "crons": [{
    "path": "/api/cron/sync-maintenance-alerts",
    "schedule": "0 * * * *"
  }]
}
```

### Security Notes

- **HIPAA/SOC2 compliance** features (audit logs, encryption)
- **Rate limiting** on auth endpoints
- **MFA** required for admin roles
- **IP whitelisting** optional per company
- **Audit logs** with 7-year retention
- **Encryption** for sensitive data using AES-256
- Never log passwords or tokens
- All API routes require authentication unless explicitly public

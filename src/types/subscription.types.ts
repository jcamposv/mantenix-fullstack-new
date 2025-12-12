/**
 * Subscription and billing types
 */

import type {
  SubscriptionStatus,
  BillingInterval,
  PlanTier,
  SubscriptionPlan,
  Subscription,
  UsageMetrics,
  Invoice,
} from "@prisma/client"

// Re-export Prisma enums
export type { SubscriptionStatus, BillingInterval, PlanTier }

// ============================================================================
// Plan Types
// ============================================================================

export interface SubscriptionPlanWithDetails extends SubscriptionPlan {
  _count?: {
    subscriptions: number
  }
  features?: Array<{
    id: string
    module: string
  }>
}

export interface CreatePlanInput {
  name: string
  tier: PlanTier
  monthlyPrice: number
  annualPrice: number

  // Limits
  maxUsers: number
  maxCompanies: number
  maxWarehouses: number
  maxWorkOrdersPerMonth: number
  maxInventoryItems: number
  maxStorageGB: number

  // Features
  hasMetricsDashboard: boolean
  hasApiAccess: boolean
  hasMultiCompany: boolean
  hasPrioritySupport: boolean
  hasDedicatedAccount: boolean
  hasCustomIntegrations: boolean

  // Overage pricing
  overageUserPrice: number
  overageStoragePrice: number
  overageWorkOrderPrice: number

  description?: string
  isActive?: boolean
}

export interface UpdatePlanInput extends Partial<CreatePlanInput> {
  id: string
}

// ============================================================================
// Subscription Types
// ============================================================================

export interface SubscriptionWithRelations extends Subscription {
  plan: SubscriptionPlan
  company: {
    id: string
    name: string
  }
  usageMetrics?: UsageMetrics
  invoices?: Invoice[]
}

export interface CreateSubscriptionInput {
  companyId: string
  planId: string
  billingInterval: BillingInterval
  startDate?: Date

  // Stripe data (optional for initial creation)
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePaymentMethodId?: string
}

export interface UpdateSubscriptionInput {
  id: string
  planId?: string
  billingInterval?: BillingInterval
  status?: SubscriptionStatus
  cancelAtPeriodEnd?: boolean
  canceledAt?: Date
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePaymentMethodId?: string
}

// ============================================================================
// Usage Metrics Types
// ============================================================================

export interface UsageMetricsWithSubscription extends UsageMetrics {
  subscription: SubscriptionWithRelations
}

export interface UsageCheckResult {
  allowed: boolean
  currentUsage: number
  limit: number
  remaining: number
  wouldExceedLimit: boolean
  overageCount?: number
  overagePrice?: number
}

export interface UsageSummary {
  users: UsageCheckResult
  companies: UsageCheckResult
  warehouses: UsageCheckResult
  workOrders: UsageCheckResult
  inventoryItems: UsageCheckResult
  storage: UsageCheckResult
  totalOverageAmount: number
}

export interface IncrementUsageInput {
  subscriptionId: string
  field: 'users' | 'companies' | 'warehouses' | 'workOrders' | 'inventoryItems' | 'storage'
  amount?: number // For storage, default 1 for others
}

export interface DecrementUsageInput {
  subscriptionId: string
  field: 'users' | 'companies' | 'warehouses' | 'inventoryItems' | 'storage'
  amount?: number // For storage, default 1 for others
}

// ============================================================================
// Invoice Types
// ============================================================================

export interface InvoiceWithRelations extends Invoice {
  subscription: {
    id: string
    company: {
      id: string
      name: string
    }
    plan: {
      name: string
    }
  }
}

export interface CreateInvoiceInput {
  subscriptionId: string
  invoiceNumber: string
  billingPeriodStart: Date
  billingPeriodEnd: Date

  subtotal: number
  tax: number
  total: number
  planAmount: number
  overageAmount: number

  // Overage details
  overageUsers?: number
  overageUsersAmount?: number
  overageStorage?: number
  overageStorageAmount?: number
  overageWorkOrders?: number
  overageWorkOrdersAmount?: number

  dueDate: Date
  stripeInvoiceId?: string
}

export interface InvoiceFilters {
  subscriptionId?: string
  companyId?: string
  status?: 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE'
  dateFrom?: Date
  dateTo?: Date
  isPaid?: boolean
}

// ============================================================================
// Dashboard & Analytics Types
// ============================================================================

export interface SubscriptionDashboardMetrics {
  overview: {
    totalActiveSubscriptions: number
    totalMonthlyRecurringRevenue: number
    totalAnnualRecurringRevenue: number
    averageRevenuePerUser: number
    churnRate: number
  }

  byPlan: Array<{
    planName: string
    tier: PlanTier
    activeSubscriptions: number
    monthlyRevenue: number
    annualRevenue: number
  }>

  usageOverview: {
    averageUserUtilization: number
    averageStorageUtilization: number
    averageWorkOrderUtilization: number
    companiesWithOverages: number
  }

  recentSubscriptions: SubscriptionWithRelations[]
  upcomingRenewals: SubscriptionWithRelations[]
  pendingInvoices: InvoiceWithRelations[]
}

// ============================================================================
// Limit Validation Types
// ============================================================================

export interface LimitValidationResult {
  canProceed: boolean
  reason?: string
  currentUsage?: number
  limit?: number
  requiresOveragePayment?: boolean
  overagePrice?: number
}

export type LimitType =
  | 'users'
  | 'companies'
  | 'warehouses'
  | 'workOrders'
  | 'inventoryItems'
  | 'storage'

// ============================================================================
// Error Types
// ============================================================================

export class SubscriptionError extends Error {
  constructor(
    message: string,
    public code:
      | 'LIMIT_EXCEEDED'
      | 'NO_SUBSCRIPTION'
      | 'SUBSCRIPTION_INACTIVE'
      | 'SUBSCRIPTION_PAST_DUE'
      | 'PLAN_NOT_FOUND'
      | 'INVALID_BILLING_INTERVAL'
      | 'STRIPE_ERROR'
      | 'USAGE_TRACKING_ERROR',
    public details?: unknown
  ) {
    super(message)
    this.name = 'SubscriptionError'
  }
}

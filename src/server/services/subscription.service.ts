/**
 * Subscription Service
 * Handles subscription management, usage tracking, and limit validation
 */

import { SubscriptionRepository } from "@/server/repositories/subscription.repository"
import { SubscriptionPlanRepository } from "@/server/repositories/subscription-plan.repository"
import { UsageMetricsRepository } from "@/server/repositories/usage-metrics.repository"
import { Prisma, SubscriptionStatus, BillingInterval, UsageMetrics, SubscriptionPlan } from "@prisma/client"
import type {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  UsageCheckResult,
  UsageSummary,
  IncrementUsageInput,
  DecrementUsageInput,
  LimitValidationResult,
  LimitType,
  SubscriptionWithRelations,
} from "@/types/subscription.types"

export class SubscriptionService {
  // ============================================================================
  // Subscription Management
  // ============================================================================

  /**
   * Get company's active subscription with usage metrics
   */
  static async getCompanySubscription(
    companyId: string
  ): Promise<SubscriptionWithRelations | null> {
    return await SubscriptionRepository.findByCompanyId(companyId)
  }

  /**
   * Create a new subscription for a company
   */
  static async createSubscription(
    input: CreateSubscriptionInput
  ): Promise<SubscriptionWithRelations> {
    const { companyId, planId, billingInterval, startDate, ...stripeData } = input

    // Verify plan exists and is active
    const plan = await SubscriptionPlanRepository.findById(planId)
    if (!plan || !plan.isActive) {
      throw new Error("Plan de subscripción no encontrado o inactivo")
    }

    // Check if company already has a subscription
    const existing = await SubscriptionRepository.findByCompanyId(companyId)
    if (existing) {
      throw new Error("La compañía ya tiene una subscripción activa")
    }

    const start = startDate ?? new Date()
    const currentPeriodEnd = this.calculatePeriodEnd(start, billingInterval)

    // Create subscription with initial usage metrics
    const subscription = await SubscriptionRepository.create({
      company: { connect: { id: companyId } },
      plan: { connect: { id: planId } },
      billingInterval,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: start,
      currentPeriodEnd,
      currentPrice: billingInterval === 'MONTHLY' ? plan.monthlyPrice : plan.annualPrice,
      ...stripeData,
      usageMetrics: {
        create: {
          currentUsers: 0,
          currentCompanies: 0,
          currentWarehouses: 0,
          currentWorkOrdersThisMonth: 0,
          currentInventoryItems: 0,
          currentStorageGB: 0,
          peakUsers: 0,
          peakStorageGB: 0,
          overageUsers: 0,
          overageStorageGB: 0,
          overageWorkOrders: 0,
          lastResetAt: start,
        },
      },
    })

    // Auto-activar features del plan en la compañía
    await this.activatePlanFeatures(companyId, planId)

    return subscription
  }

  /**
   * Update subscription (e.g., change plan, update Stripe data)
   */
  static async updateSubscription(
    input: UpdateSubscriptionInput
  ): Promise<SubscriptionWithRelations> {
    const { id, ...updateData } = input
    return await SubscriptionRepository.update(id, updateData)
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<SubscriptionWithRelations> {
    const updateData: Prisma.SubscriptionUpdateInput = {
      cancelAtPeriodEnd,
      canceledAt: new Date(),
    }

    if (!cancelAtPeriodEnd) {
      updateData.status = SubscriptionStatus.CANCELED
    }

    return await SubscriptionRepository.update(subscriptionId, updateData)
  }

  // ============================================================================
  // Usage Tracking
  // ============================================================================

  /**
   * Get current usage summary for a subscription
   */
  static async getUsageSummary(subscriptionId: string): Promise<UsageSummary> {
    const subscription = await SubscriptionRepository.findById(subscriptionId)

    if (!subscription) {
      throw new Error("Subscripción no encontrada")
    }

    const { plan, usageMetrics } = subscription

    if (!usageMetrics) {
      throw new Error("Métricas de uso no encontradas")
    }

    const users = this.calculateUsageCheck(
      usageMetrics.currentUsers,
      plan.maxUsers,
      usageMetrics.overageUsers,
      plan.overageUserPrice
    )

    const companies = this.calculateUsageCheck(
      usageMetrics.currentCompanies,
      plan.maxCompanies,
      0,
      0
    )

    const warehouses = this.calculateUsageCheck(
      usageMetrics.currentWarehouses,
      plan.maxWarehouses,
      0,
      0
    )

    const workOrders = this.calculateUsageCheck(
      usageMetrics.currentWorkOrdersThisMonth,
      plan.maxWorkOrdersPerMonth,
      usageMetrics.overageWorkOrders,
      plan.overageWorkOrderPrice
    )

    const inventoryItems = this.calculateUsageCheck(
      usageMetrics.currentInventoryItems,
      plan.maxInventoryItems,
      0,
      0
    )

    const storage = this.calculateUsageCheck(
      usageMetrics.currentStorageGB,
      plan.maxStorageGB,
      usageMetrics.overageStorageGB,
      plan.overageStoragePrice
    )

    const totalOverageAmount =
      (users.overagePrice ?? 0) +
      (workOrders.overagePrice ?? 0) +
      (storage.overagePrice ?? 0)

    return {
      users,
      companies,
      warehouses,
      workOrders,
      inventoryItems,
      storage,
      totalOverageAmount,
    }
  }

  /**
   * Check if a specific action is allowed based on limits
   */
  static async validateLimit(
    companyId: string,
    limitType: LimitType,
    incrementAmount: number = 1
  ): Promise<LimitValidationResult> {
    const subscription = await this.getCompanySubscription(companyId)

    if (!subscription) {
      return {
        canProceed: false,
        reason: "No hay subscripción activa para esta compañía",
      }
    }

    if (
      subscription.status !== SubscriptionStatus.ACTIVE &&
      subscription.status !== SubscriptionStatus.TRIALING
    ) {
      return {
        canProceed: false,
        reason: `Subscripción ${subscription.status.toLowerCase()}. Por favor, actualice su método de pago.`,
      }
    }

    const { plan, usageMetrics } = subscription

    if (!usageMetrics) {
      return {
        canProceed: false,
        reason: "Error al obtener métricas de uso",
      }
    }

    // Map limit type to usage field and plan limit
    const limitConfig = this.getLimitConfig(limitType, usageMetrics, plan)

    const newUsage = limitConfig.currentUsage + incrementAmount

    // Check if within base limit
    if (newUsage <= limitConfig.limit) {
      return {
        canProceed: true,
        currentUsage: limitConfig.currentUsage,
        limit: limitConfig.limit,
      }
    }

    // Check if overage is allowed for this limit type
    if (limitConfig.allowsOverage && limitConfig.overagePrice) {
      const overageCount = newUsage - limitConfig.limit
      const overageAmount = overageCount * limitConfig.overagePrice

      return {
        canProceed: true,
        currentUsage: limitConfig.currentUsage,
        limit: limitConfig.limit,
        requiresOveragePayment: true,
        overagePrice: overageAmount,
      }
    }

    // Hard limit exceeded
    return {
      canProceed: false,
      reason: `Límite de ${limitConfig.name} alcanzado (${limitConfig.limit}). Por favor, actualice su plan.`,
      currentUsage: limitConfig.currentUsage,
      limit: limitConfig.limit,
    }
  }

  /**
   * Increment usage counter
   */
  static async incrementUsage(input: IncrementUsageInput): Promise<void> {
    const { subscriptionId, field, amount = 1 } = input

    const fieldMap = {
      users: "currentUsers",
      companies: "currentCompanies",
      warehouses: "currentWarehouses",
      workOrders: "currentWorkOrdersThisMonth",
      inventoryItems: "currentInventoryItems",
      storage: "currentStorageGB",
    } as const

    const peakFieldMap = {
      users: "peakUsers",
      companies: "peakCompanies",
      warehouses: "peakWarehouses",
      workOrders: "peakWorkOrders",
      inventoryItems: "peakInventoryItems",
      storage: "peakStorageGB",
    } as const

    const currentField = fieldMap[field]
    const peakField = peakFieldMap[field]

    // Get current values
    const usageMetrics = await UsageMetricsRepository.findBySubscriptionId(subscriptionId)

    if (!usageMetrics) {
      throw new Error("Métricas de uso no encontradas")
    }

    const currentValue = (usageMetrics as unknown as Record<string, unknown>)[currentField] as number
    const newValue = currentValue + amount
    const peakValue = Math.max(newValue, (usageMetrics as unknown as Record<string, unknown>)[peakField] as number)

    // Calculate overage if applicable
    const plan = usageMetrics.subscription.plan
    const updateData: Record<string, number> = {
      [currentField]: newValue,
      [peakField]: peakValue,
    }

    // Calculate overages for supported fields
    if (field === "users") {
      const overage = Math.max(0, newValue - plan.maxUsers)
      updateData.overageUsers = overage
    } else if (field === "workOrders") {
      const overage = Math.max(0, newValue - plan.maxWorkOrdersPerMonth)
      updateData.overageWorkOrders = overage
    } else if (field === "storage") {
      const overage = Math.max(0, newValue - plan.maxStorageGB)
      updateData.overageStorageGB = overage
    }

    await UsageMetricsRepository.update(subscriptionId, updateData)
  }

  /**
   * Decrement usage counter
   */
  static async decrementUsage(input: DecrementUsageInput): Promise<void> {
    const { subscriptionId, field, amount = 1 } = input

    const fieldMap = {
      users: "currentUsers",
      companies: "currentCompanies",
      warehouses: "currentWarehouses",
      inventoryItems: "currentInventoryItems",
      storage: "currentStorageGB",
    } as const

    const currentField = fieldMap[field]

    // Get current value
    const usageMetrics = await UsageMetricsRepository.findBySubscriptionId(subscriptionId)

    if (!usageMetrics) {
      throw new Error("Métricas de uso no encontradas")
    }

    const currentValue = usageMetrics[currentField] as number
    const newValue = Math.max(0, currentValue - amount)

    // Recalculate overage if applicable
    const plan = usageMetrics.subscription.plan
    const updateData: Record<string, number> = {
      [currentField]: newValue,
    }

    if (field === "users") {
      const overage = Math.max(0, newValue - plan.maxUsers)
      updateData.overageUsers = overage
    } else if (field === "storage") {
      const overage = Math.max(0, newValue - plan.maxStorageGB)
      updateData.overageStorageGB = overage
    }

    await UsageMetricsRepository.update(subscriptionId, updateData)
  }

  /**
   * Reset monthly usage counters (call at billing period start)
   */
  static async resetMonthlyUsage(subscriptionId: string): Promise<void> {
    await UsageMetricsRepository.resetMonthlyCounters(subscriptionId)
  }

  // ============================================================================
  // Feature Management
  // ============================================================================

  /**
   * Activate plan features for a company
   * Called automatically when creating/updating a subscription
   */
  static async activatePlanFeatures(
    companyId: string,
    planId: string
  ): Promise<void> {
    const { prisma } = await import('@/lib/prisma')

    // Get plan features
    const planFeatures = await prisma.planFeature.findMany({
      where: { planId },
      select: { module: true },
    })

    // Activate each feature for the company
    for (const planFeature of planFeatures) {
      await prisma.companyFeature.upsert({
        where: {
          companyId_module: {
            companyId,
            module: planFeature.module,
          },
        },
        create: {
          companyId,
          module: planFeature.module,
          isEnabled: true,
          enabledAt: new Date(),
        },
        update: {
          isEnabled: true,
          enabledAt: new Date(),
        },
      })
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private static calculateUsageCheck(
    current: number,
    limit: number,
    overage: number,
    overagePrice: number
  ): UsageCheckResult {
    const remaining = Math.max(0, limit - current)
    const wouldExceedLimit = current >= limit

    return {
      allowed: true, // We allow overages
      currentUsage: current,
      limit,
      remaining,
      wouldExceedLimit,
      overageCount: overage,
      overagePrice: overage > 0 ? overage * overagePrice : undefined,
    }
  }

  private static getLimitConfig(
    limitType: LimitType,
    usageMetrics: UsageMetrics,
    plan: SubscriptionPlan
  ) {
    const configs = {
      users: {
        name: "usuarios",
        currentUsage: usageMetrics.currentUsers,
        limit: plan.maxUsers,
        allowsOverage: true,
        overagePrice: plan.overageUserPrice,
      },
      companies: {
        name: "compañías",
        currentUsage: usageMetrics.currentCompanies,
        limit: plan.maxCompanies,
        allowsOverage: false,
        overagePrice: 0,
      },
      warehouses: {
        name: "bodegas",
        currentUsage: usageMetrics.currentWarehouses,
        limit: plan.maxWarehouses,
        allowsOverage: false,
        overagePrice: 0,
      },
      workOrders: {
        name: "órdenes de trabajo",
        currentUsage: usageMetrics.currentWorkOrdersThisMonth,
        limit: plan.maxWorkOrdersPerMonth,
        allowsOverage: true,
        overagePrice: plan.overageWorkOrderPrice,
      },
      inventoryItems: {
        name: "items de inventario",
        currentUsage: usageMetrics.currentInventoryItems,
        limit: plan.maxInventoryItems,
        allowsOverage: false,
        overagePrice: 0,
      },
      storage: {
        name: "almacenamiento (GB)",
        currentUsage: usageMetrics.currentStorageGB,
        limit: plan.maxStorageGB,
        allowsOverage: true,
        overagePrice: plan.overageStoragePrice,
      },
    }

    return configs[limitType]
  }

  private static calculatePeriodEnd(
    start: Date,
    interval: BillingInterval
  ): Date {
    const end = new Date(start)
    if (interval === BillingInterval.MONTHLY) {
      end.setMonth(end.getMonth() + 1)
    } else {
      end.setFullYear(end.getFullYear() + 1)
    }
    return end
  }
}

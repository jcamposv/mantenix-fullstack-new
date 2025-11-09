import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { UsageMetricsWithSubscription } from "@/types/subscription.types"

/**
 * Repository para el acceso a datos de métricas de uso
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class UsageMetricsRepository {

  private static readonly includeRelations = {
    subscription: {
      include: {
        plan: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  }

  static async findBySubscriptionId(
    subscriptionId: string
  ): Promise<UsageMetricsWithSubscription | null> {
    return await prisma.usageMetrics.findUnique({
      where: { subscriptionId },
      include: this.includeRelations,
    })
  }

  static async update(
    subscriptionId: string,
    data: Prisma.UsageMetricsUpdateInput
  ): Promise<UsageMetricsWithSubscription> {
    return await prisma.usageMetrics.update({
      where: { subscriptionId },
      data,
      include: this.includeRelations,
    })
  }

  static async increment(
    subscriptionId: string,
    field: string,
    amount: number = 1
  ): Promise<UsageMetricsWithSubscription> {
    return await prisma.usageMetrics.update({
      where: { subscriptionId },
      data: {
        [field]: {
          increment: amount,
        },
      },
      include: this.includeRelations,
    })
  }

  static async decrement(
    subscriptionId: string,
    field: string,
    amount: number = 1
  ): Promise<UsageMetricsWithSubscription> {
    return await prisma.usageMetrics.update({
      where: { subscriptionId },
      data: {
        [field]: {
          decrement: amount,
        },
      },
      include: this.includeRelations,
    })
  }

  static async resetMonthlyCounters(
    subscriptionId: string
  ): Promise<UsageMetricsWithSubscription> {
    return await prisma.usageMetrics.update({
      where: { subscriptionId },
      data: {
        currentWorkOrdersThisMonth: 0,
        overageWorkOrders: 0,
        lastResetAt: new Date(),
      },
      include: this.includeRelations,
    })
  }
}

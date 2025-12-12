import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { SubscriptionPlanWithDetails } from "@/types/subscription.types"

/**
 * Repository para el acceso a datos de planes de subscripción
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class SubscriptionPlanRepository {

  private static readonly includeRelations = {
    _count: {
      select: {
        subscriptions: true,
      },
    },
    features: {
      select: {
        id: true,
        module: true,
      },
    },
  }

  static async findById(id: string): Promise<SubscriptionPlanWithDetails | null> {
    return await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: this.includeRelations,
    })
  }

  static async findMany(
    whereClause: Prisma.SubscriptionPlanWhereInput
  ): Promise<SubscriptionPlanWithDetails[]> {
    return await prisma.subscriptionPlan.findMany({
      where: whereClause,
      include: this.includeRelations,
      orderBy: { monthlyPrice: 'asc' },
    })
  }

  static async findActive(): Promise<SubscriptionPlanWithDetails[]> {
    return await this.findMany({ isActive: true })
  }

  static async create(
    data: Prisma.SubscriptionPlanCreateInput
  ): Promise<SubscriptionPlanWithDetails> {
    return await prisma.subscriptionPlan.create({
      data,
      include: this.includeRelations,
    })
  }

  static async update(
    id: string,
    data: Prisma.SubscriptionPlanUpdateInput
  ): Promise<SubscriptionPlanWithDetails> {
    return await prisma.subscriptionPlan.update({
      where: { id },
      data,
      include: this.includeRelations,
    })
  }

  static async delete(id: string): Promise<SubscriptionPlanWithDetails> {
    return await prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false },
      include: this.includeRelations,
    })
  }
}

import { Prisma, SubscriptionStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { SubscriptionWithRelations } from "@/types/subscription.types"

/**
 * Repository para el acceso a datos de subscripciones
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class SubscriptionRepository {

  private static readonly includeRelations = {
    plan: true,
    company: {
      select: {
        id: true,
        name: true,
      },
    },
    usageMetrics: true,
    invoices: {
      orderBy: { createdAt: 'desc' as const },
      take: 5,
    },
  }

  static async findById(id: string): Promise<SubscriptionWithRelations | null> {
    return await prisma.subscription.findUnique({
      where: { id },
      include: this.includeRelations,
    }) as SubscriptionWithRelations | null
  }

  static async findByCompanyId(companyId: string): Promise<SubscriptionWithRelations | null> {
    return await prisma.subscription.findUnique({
      where: { companyId },
      include: this.includeRelations,
    }) as SubscriptionWithRelations | null
  }

  static async findMany(
    whereClause: Prisma.SubscriptionWhereInput,
    page?: number,
    limit?: number
  ): Promise<{ subscriptions: SubscriptionWithRelations[]; total: number }> {
    const offset = page && limit ? (page - 1) * limit : 0

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where: whereClause,
        include: this.includeRelations,
        orderBy: { createdAt: 'desc' },
        skip: page && limit ? offset : undefined,
        take: limit,
      }) as Promise<SubscriptionWithRelations[]>,
      prisma.subscription.count({ where: whereClause }),
    ])

    return { subscriptions, total }
  }

  static async create(data: Prisma.SubscriptionCreateInput): Promise<SubscriptionWithRelations> {
    return await prisma.subscription.create({
      data,
      include: this.includeRelations,
    }) as SubscriptionWithRelations
  }

  static async update(
    id: string,
    data: Prisma.SubscriptionUpdateInput
  ): Promise<SubscriptionWithRelations> {
    return await prisma.subscription.update({
      where: { id },
      data,
      include: this.includeRelations,
    }) as SubscriptionWithRelations
  }

  static async delete(id: string): Promise<SubscriptionWithRelations> {
    return await prisma.subscription.delete({
      where: { id },
      include: this.includeRelations,
    }) as SubscriptionWithRelations
  }

  // Consultas específicas de subscripciones
  static async findActiveSubscriptions(): Promise<SubscriptionWithRelations[]> {
    return await prisma.subscription.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'TRIALING'],
        },
      },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    }) as SubscriptionWithRelations[]
  }

  static async findUpcomingRenewals(daysAhead: number = 30): Promise<SubscriptionWithRelations[]> {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    return await prisma.subscription.findMany({
      where: {
        currentPeriodEnd: {
          lte: futureDate,
          gte: new Date(),
        },
        status: 'ACTIVE',
      },
      include: this.includeRelations,
      orderBy: { currentPeriodEnd: 'asc' },
    }) as SubscriptionWithRelations[]
  }

  static async countByStatus(status: string): Promise<number> {
    return await prisma.subscription.count({
      where: { status: status as SubscriptionStatus },
    })
  }
}

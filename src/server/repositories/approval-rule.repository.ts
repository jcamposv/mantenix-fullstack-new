/**
 * Approval Rule Repository
 * Data access layer for approval rules
 */

import { Prisma, WorkOrderPriority, WorkOrderType, ComponentCriticality } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { ApprovalRuleWithRelations } from "@/types/approval-rule.types"

export class ApprovalRuleRepository {
  /**
   * Define include relations for queries
   */
  static getIncludeRelations(): Prisma.ApprovalRuleInclude {
    return {
      company: {
        select: {
          id: true,
          name: true,
          subdomain: true
        }
      }
    }
  }

  /**
   * Find by ID with relations
   */
  static async findById(id: string): Promise<ApprovalRuleWithRelations | null> {
    return await prisma.approvalRule.findUnique({
      where: { id },
      include: this.getIncludeRelations()
    }) as unknown as ApprovalRuleWithRelations | null
  }

  /**
   * Find first matching criteria
   */
  static async findFirst(
    whereClause: Prisma.ApprovalRuleWhereInput
  ): Promise<ApprovalRuleWithRelations | null> {
    return await prisma.approvalRule.findFirst({
      where: whereClause,
      include: this.getIncludeRelations()
    }) as unknown as ApprovalRuleWithRelations | null
  }

  /**
   * Find many with pagination
   */
  static async findMany(
    whereClause: Prisma.ApprovalRuleWhereInput,
    page: number,
    limit: number
  ): Promise<{ items: ApprovalRuleWithRelations[]; total: number }> {
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      prisma.approvalRule.findMany({
        where: whereClause,
        include: this.getIncludeRelations(),
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.approvalRule.count({ where: whereClause })
    ])

    return {
      items: items as unknown as ApprovalRuleWithRelations[],
      total
    }
  }

  /**
   * Create new record
   */
  static async create(
    data: Prisma.ApprovalRuleCreateInput
  ): Promise<ApprovalRuleWithRelations> {
    return await prisma.approvalRule.create({
      data,
      include: this.getIncludeRelations()
    }) as unknown as ApprovalRuleWithRelations
  }

  /**
   * Update record
   */
  static async update(
    id: string,
    data: Prisma.ApprovalRuleUpdateInput
  ): Promise<ApprovalRuleWithRelations> {
    return await prisma.approvalRule.update({
      where: { id },
      data,
      include: this.getIncludeRelations()
    }) as unknown as ApprovalRuleWithRelations
  }

  /**
   * Soft delete (set isActive to false)
   */
  static async softDelete(id: string): Promise<ApprovalRuleWithRelations> {
    return await prisma.approvalRule.update({
      where: { id },
      data: { isActive: false },
      include: this.getIncludeRelations()
    }) as unknown as ApprovalRuleWithRelations
  }

  /**
   * Hard delete (permanently remove)
   */
  static async hardDelete(id: string): Promise<void> {
    await prisma.approvalRule.delete({
      where: { id }
    })
  }

  /**
   * Check if name exists in company
   */
  static async checkExists(
    name: string,
    companyId: string,
    excludeId?: string
  ): Promise<boolean> {
    const whereClause: Prisma.ApprovalRuleWhereInput = {
      name,
      companyId,
      isActive: true
    }

    if (excludeId) {
      whereClause.id = { not: excludeId }
    }

    const count = await prisma.approvalRule.count({ where: whereClause })
    return count > 0
  }

  /**
   * Get all active rules for a company sorted by approval levels
   */
  static async getActiveByCompany(
    companyId: string
  ): Promise<ApprovalRuleWithRelations[]> {
    return await prisma.approvalRule.findMany({
      where: {
        companyId,
        isActive: true
      },
      include: this.getIncludeRelations(),
      orderBy: { approvalLevels: 'asc' }
    }) as unknown as ApprovalRuleWithRelations[]
  }

  /**
   * Get rules that match the given work order criteria
   */
  static async getMatchingRules(
    companyId: string,
    cost: number,
    priority?: string,
    type?: string,
    assetCriticality?: string
  ): Promise<ApprovalRuleWithRelations[]> {
    const whereClause: Prisma.ApprovalRuleWhereInput = {
      companyId,
      isActive: true,
      OR: [
        { AND: [{ minCost: { lte: cost } }, { maxCost: { gte: cost } }] },
        { AND: [{ minCost: { lte: cost } }, { maxCost: null }] },
        { AND: [{ minCost: null }, { maxCost: { gte: cost } }] }
      ]
    }

    if (priority) whereClause.priority = priority as WorkOrderPriority
    if (type) whereClause.type = type as WorkOrderType
    if (assetCriticality) whereClause.assetCriticality = assetCriticality as ComponentCriticality

    return await prisma.approvalRule.findMany({
      where: whereClause,
      include: this.getIncludeRelations(),
      orderBy: { approvalLevels: 'desc' }
    }) as unknown as ApprovalRuleWithRelations[]
  }
}

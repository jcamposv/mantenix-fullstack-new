/**
 * Root Cause Analysis Repository
 * Data access layer for RCA records
 */

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { RootCauseAnalysisWithRelations } from "@/types/root-cause-analysis.types"

export class RootCauseAnalysisRepository {
  /**
   * Define include relations for queries
   */
  static getIncludeRelations(): Prisma.RootCauseAnalysisInclude {
    return {
      workOrder: {
        select: {
          id: true,
          number: true,
          title: true,
          status: true
        }
      },
      asset: {
        select: {
          id: true,
          name: true,
          code: true
        }
      },
      analyzer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      reviewer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      actions: {
        select: {
          id: true,
          actionType: true,
          description: true,
          status: true
        }
      }
    }
  }

  /**
   * Find by ID with relations
   */
  static async findById(id: string): Promise<RootCauseAnalysisWithRelations | null> {
    return await prisma.rootCauseAnalysis.findUnique({
      where: { id },
      include: this.getIncludeRelations()
    }) as unknown as RootCauseAnalysisWithRelations | null
  }

  /**
   * Find first matching criteria
   */
  static async findFirst(
    whereClause: Prisma.RootCauseAnalysisWhereInput
  ): Promise<RootCauseAnalysisWithRelations | null> {
    return await prisma.rootCauseAnalysis.findFirst({
      where: whereClause,
      include: this.getIncludeRelations()
    }) as unknown as RootCauseAnalysisWithRelations | null
  }

  /**
   * Find many with pagination
   */
  static async findMany(
    whereClause: Prisma.RootCauseAnalysisWhereInput,
    page: number,
    limit: number
  ): Promise<{ items: RootCauseAnalysisWithRelations[]; total: number }> {
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      prisma.rootCauseAnalysis.findMany({
        where: whereClause,
        include: this.getIncludeRelations(),
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.rootCauseAnalysis.count({ where: whereClause })
    ])

    return {
      items: items as unknown as RootCauseAnalysisWithRelations[],
      total
    }
  }

  /**
   * Create new record
   */
  static async create(
    data: Prisma.RootCauseAnalysisCreateInput
  ): Promise<RootCauseAnalysisWithRelations> {
    return await prisma.rootCauseAnalysis.create({
      data,
      include: this.getIncludeRelations()
    }) as unknown as RootCauseAnalysisWithRelations
  }

  /**
   * Update record
   */
  static async update(
    id: string,
    data: Prisma.RootCauseAnalysisUpdateInput
  ): Promise<RootCauseAnalysisWithRelations> {
    return await prisma.rootCauseAnalysis.update({
      where: { id },
      data,
      include: this.getIncludeRelations()
    }) as unknown as RootCauseAnalysisWithRelations
  }

  /**
   * Get RCA for a work order
   */
  static async getByWorkOrder(
    workOrderId: string
  ): Promise<RootCauseAnalysisWithRelations | null> {
    return await prisma.rootCauseAnalysis.findFirst({
      where: { workOrderId },
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'desc' }
    }) as unknown as RootCauseAnalysisWithRelations | null
  }

  /**
   * Get all RCAs for an asset
   */
  static async getByAsset(
    assetId: string
  ): Promise<RootCauseAnalysisWithRelations[]> {
    return await prisma.rootCauseAnalysis.findMany({
      where: { assetId },
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'desc' }
    }) as unknown as RootCauseAnalysisWithRelations[]
  }

  /**
   * Get RCAs pending review for a company
   */
  static async getPendingReview(
    companyId: string
  ): Promise<RootCauseAnalysisWithRelations[]> {
    return await prisma.rootCauseAnalysis.findMany({
      where: {
        workOrder: {
          companyId
        },
        status: 'PENDING_REVIEW'
      },
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'asc' }
    }) as unknown as RootCauseAnalysisWithRelations[]
  }

  /**
   * Hard delete (permanently remove)
   */
  static async hardDelete(id: string): Promise<void> {
    await prisma.rootCauseAnalysis.delete({
      where: { id }
    })
  }
}

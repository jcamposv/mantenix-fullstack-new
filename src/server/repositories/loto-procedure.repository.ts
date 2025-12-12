/**
 * LOTO Procedure Repository
 * Data access layer for Lock-Out/Tag-Out procedures
 */

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { LOTOProcedureWithRelations } from "@/types/loto-procedure.types"

export class LOTOProcedureRepository {
  /**
   * Define include relations for queries
   */
  static getIncludeRelations(): Prisma.LOTOProcedureInclude {
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
      authorized: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      verifier: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      removalAuthorizer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  }

  /**
   * Find by ID with relations
   */
  static async findById(id: string): Promise<LOTOProcedureWithRelations | null> {
    return await prisma.lOTOProcedure.findUnique({
      where: { id },
      include: this.getIncludeRelations()
    }) as unknown as LOTOProcedureWithRelations | null
  }

  /**
   * Find first matching criteria
   */
  static async findFirst(
    whereClause: Prisma.LOTOProcedureWhereInput
  ): Promise<LOTOProcedureWithRelations | null> {
    return await prisma.lOTOProcedure.findFirst({
      where: whereClause,
      include: this.getIncludeRelations()
    }) as unknown as LOTOProcedureWithRelations | null
  }

  /**
   * Find many with pagination
   */
  static async findMany(
    whereClause: Prisma.LOTOProcedureWhereInput,
    page: number,
    limit: number
  ): Promise<{ items: LOTOProcedureWithRelations[]; total: number }> {
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      prisma.lOTOProcedure.findMany({
        where: whereClause,
        include: this.getIncludeRelations(),
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.lOTOProcedure.count({ where: whereClause })
    ])

    return {
      items: items as unknown as LOTOProcedureWithRelations[],
      total
    }
  }

  /**
   * Create new record
   */
  static async create(
    data: Prisma.LOTOProcedureCreateInput
  ): Promise<LOTOProcedureWithRelations> {
    return await prisma.lOTOProcedure.create({
      data,
      include: this.getIncludeRelations()
    }) as unknown as LOTOProcedureWithRelations
  }

  /**
   * Update record
   */
  static async update(
    id: string,
    data: Prisma.LOTOProcedureUpdateInput
  ): Promise<LOTOProcedureWithRelations> {
    return await prisma.lOTOProcedure.update({
      where: { id },
      data,
      include: this.getIncludeRelations()
    }) as unknown as LOTOProcedureWithRelations
  }

  /**
   * Get all LOTO procedures for a work order
   */
  static async getByWorkOrder(
    workOrderId: string
  ): Promise<LOTOProcedureWithRelations[]> {
    return await prisma.lOTOProcedure.findMany({
      where: { workOrderId },
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'desc' }
    }) as unknown as LOTOProcedureWithRelations[]
  }

  /**
   * Get all LOTO procedures for an asset
   */
  static async getByAsset(
    assetId: string
  ): Promise<LOTOProcedureWithRelations[]> {
    return await prisma.lOTOProcedure.findMany({
      where: { assetId },
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'desc' }
    }) as unknown as LOTOProcedureWithRelations[]
  }

  /**
   * Get active LOTO procedures for an asset
   */
  static async getActiveByAsset(
    assetId: string
  ): Promise<LOTOProcedureWithRelations[]> {
    return await prisma.lOTOProcedure.findMany({
      where: {
        assetId,
        status: {
          in: ['APPLIED', 'VERIFIED']
        }
      },
      include: this.getIncludeRelations(),
      orderBy: { appliedAt: 'desc' }
    }) as unknown as LOTOProcedureWithRelations[]
  }

  /**
   * Hard delete (permanently remove)
   */
  static async hardDelete(id: string): Promise<void> {
    await prisma.lOTOProcedure.delete({
      where: { id }
    })
  }
}

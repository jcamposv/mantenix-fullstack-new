/**
 * Work Permit Repository
 * Data access layer for work permits
 */

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { WorkPermitWithRelations } from "@/types/work-permit.types"

export class WorkPermitRepository {
  /**
   * Define include relations for queries
   */
  static getIncludeRelations(): Prisma.WorkPermitInclude {
    return {
      workOrder: {
        select: {
          id: true,
          number: true,
          title: true,
          status: true
        }
      },
      issuer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      authorizer: {
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
  static async findById(id: string): Promise<WorkPermitWithRelations | null> {
    return await prisma.workPermit.findUnique({
      where: { id },
      include: this.getIncludeRelations()
    }) as unknown as WorkPermitWithRelations | null
  }

  /**
   * Find first matching criteria
   */
  static async findFirst(
    whereClause: Prisma.WorkPermitWhereInput
  ): Promise<WorkPermitWithRelations | null> {
    return await prisma.workPermit.findFirst({
      where: whereClause,
      include: this.getIncludeRelations()
    }) as unknown as WorkPermitWithRelations | null
  }

  /**
   * Find many with pagination
   */
  static async findMany(
    whereClause: Prisma.WorkPermitWhereInput,
    page: number,
    limit: number
  ): Promise<{ items: WorkPermitWithRelations[]; total: number }> {
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      prisma.workPermit.findMany({
        where: whereClause,
        include: this.getIncludeRelations(),
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.workPermit.count({ where: whereClause })
    ])

    return {
      items: items as unknown as WorkPermitWithRelations[],
      total
    }
  }

  /**
   * Create new record
   */
  static async create(
    data: Prisma.WorkPermitCreateInput
  ): Promise<WorkPermitWithRelations> {
    return await prisma.workPermit.create({
      data,
      include: this.getIncludeRelations()
    }) as unknown as WorkPermitWithRelations
  }

  /**
   * Update record
   */
  static async update(
    id: string,
    data: Prisma.WorkPermitUpdateInput
  ): Promise<WorkPermitWithRelations> {
    return await prisma.workPermit.update({
      where: { id },
      data,
      include: this.getIncludeRelations()
    }) as unknown as WorkPermitWithRelations
  }

  /**
   * Get all permits for a work order
   */
  static async getByWorkOrder(
    workOrderId: string
  ): Promise<WorkPermitWithRelations[]> {
    return await prisma.workPermit.findMany({
      where: { workOrderId },
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'desc' }
    }) as unknown as WorkPermitWithRelations[]
  }

  /**
   * Get all active permits for a company
   */
  static async getActivePermits(
    companyId: string
  ): Promise<WorkPermitWithRelations[]> {
    return await prisma.workPermit.findMany({
      where: {
        workOrder: {
          companyId
        },
        status: 'ACTIVE'
      },
      include: this.getIncludeRelations(),
      orderBy: { validFrom: 'desc' }
    }) as unknown as WorkPermitWithRelations[]
  }

  /**
   * Get expired permits for a company
   */
  static async getExpiredPermits(
    companyId: string
  ): Promise<WorkPermitWithRelations[]> {
    return await prisma.workPermit.findMany({
      where: {
        workOrder: {
          companyId
        },
        status: 'ACTIVE',
        validUntil: {
          lt: new Date()
        }
      },
      include: this.getIncludeRelations(),
      orderBy: { validUntil: 'asc' }
    }) as unknown as WorkPermitWithRelations[]
  }

  /**
   * Hard delete (permanently remove)
   */
  static async hardDelete(id: string): Promise<void> {
    await prisma.workPermit.delete({
      where: { id }
    })
  }
}

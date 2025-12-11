/**
 * CAP Action Repository
 * Data access layer for Corrective and Preventive Actions
 */

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { CAPActionWithRelations } from "@/types/cap-action.types"

export class CAPActionRepository {
  /**
   * Define include relations for queries
   */
  static getIncludeRelations(): Prisma.CAPActionInclude {
    return {
      rca: {
        include: {
          workOrder: {
            select: {
              id: true,
              number: true,
              title: true
            }
          }
        },
        select: {
          id: true,
          failureMode: true,
          rootCause: true,
          workOrder: true
        }
      },
      assigned: {
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
      }
    }
  }

  /**
   * Find by ID with relations
   */
  static async findById(id: string): Promise<CAPActionWithRelations | null> {
    return await prisma.cAPAction.findUnique({
      where: { id },
      include: this.getIncludeRelations()
    }) as unknown as CAPActionWithRelations | null
  }

  /**
   * Find first matching criteria
   */
  static async findFirst(
    whereClause: Prisma.CAPActionWhereInput
  ): Promise<CAPActionWithRelations | null> {
    return await prisma.cAPAction.findFirst({
      where: whereClause,
      include: this.getIncludeRelations()
    }) as unknown as CAPActionWithRelations | null
  }

  /**
   * Find many with pagination
   */
  static async findMany(
    whereClause: Prisma.CAPActionWhereInput,
    page: number,
    limit: number
  ): Promise<{ items: CAPActionWithRelations[]; total: number }> {
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      prisma.cAPAction.findMany({
        where: whereClause,
        include: this.getIncludeRelations(),
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.cAPAction.count({ where: whereClause })
    ])

    return {
      items: items as unknown as CAPActionWithRelations[],
      total
    }
  }

  /**
   * Create new record
   */
  static async create(
    data: Prisma.CAPActionCreateInput
  ): Promise<CAPActionWithRelations> {
    return await prisma.cAPAction.create({
      data,
      include: this.getIncludeRelations()
    }) as unknown as CAPActionWithRelations
  }

  /**
   * Update record
   */
  static async update(
    id: string,
    data: Prisma.CAPActionUpdateInput
  ): Promise<CAPActionWithRelations> {
    return await prisma.cAPAction.update({
      where: { id },
      data,
      include: this.getIncludeRelations()
    }) as unknown as CAPActionWithRelations
  }

  /**
   * Get all CAP actions for an RCA
   */
  static async getByRCA(
    rcaId: string
  ): Promise<CAPActionWithRelations[]> {
    return await prisma.cAPAction.findMany({
      where: { rcaId },
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'desc' }
    }) as unknown as CAPActionWithRelations[]
  }

  /**
   * Get all CAP actions assigned to a user
   */
  static async getByAssignedUser(
    userId: string
  ): Promise<CAPActionWithRelations[]> {
    return await prisma.cAPAction.findMany({
      where: { assignedTo: userId },
      include: this.getIncludeRelations(),
      orderBy: { dueDate: 'asc' }
    }) as unknown as CAPActionWithRelations[]
  }

  /**
   * Get overdue CAP actions for a company
   */
  static async getOverdue(companyId: string): Promise<CAPActionWithRelations[]> {
    return await prisma.cAPAction.findMany({
      where: {
        rca: { workOrder: { companyId } },
        dueDate: { lt: new Date() },
        status: { notIn: ['VERIFIED', 'CLOSED'] }
      },
      include: this.getIncludeRelations(),
      orderBy: { dueDate: 'asc' }
    }) as unknown as CAPActionWithRelations[]
  }

  /**
   * Get CAP actions due soon for a company
   */
  static async getDueSoon(companyId: string, days: number = 7): Promise<CAPActionWithRelations[]> {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    return await prisma.cAPAction.findMany({
      where: {
        rca: { workOrder: { companyId } },
        dueDate: { gte: new Date(), lte: futureDate },
        status: { notIn: ['VERIFIED', 'CLOSED'] }
      },
      include: this.getIncludeRelations(),
      orderBy: { dueDate: 'asc' }
    }) as unknown as CAPActionWithRelations[]
  }

  /**
   * Hard delete (permanently remove)
   */
  static async hardDelete(id: string): Promise<void> {
    await prisma.cAPAction.delete({
      where: { id }
    })
  }
}

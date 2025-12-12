/**
 * Safety Briefing Repository
 * Data access layer for safety briefings
 */

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { SafetyBriefingWithRelations } from "@/types/safety-briefing.types"

export class SafetyBriefingRepository {
  /**
   * Define include relations for queries
   */
  static getIncludeRelations(): Prisma.SafetyBriefingInclude {
    return {
      workOrder: {
        select: {
          id: true,
          number: true,
          title: true,
          status: true
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  }

  /**
   * Find by ID with relations
   */
  static async findById(id: string): Promise<SafetyBriefingWithRelations | null> {
    return await prisma.safetyBriefing.findUnique({
      where: { id },
      include: this.getIncludeRelations()
    }) as unknown as SafetyBriefingWithRelations | null
  }

  /**
   * Find briefing by workOrderId and userId
   */
  static async findByWorkOrderAndUser(
    workOrderId: string,
    userId: string
  ): Promise<SafetyBriefingWithRelations | null> {
    return await prisma.safetyBriefing.findUnique({
      where: {
        workOrderId_userId: {
          workOrderId,
          userId
        }
      },
      include: this.getIncludeRelations()
    }) as unknown as SafetyBriefingWithRelations | null
  }

  /**
   * Find all briefings for a work order
   */
  static async findByWorkOrder(
    workOrderId: string
  ): Promise<SafetyBriefingWithRelations[]> {
    return await prisma.safetyBriefing.findMany({
      where: { workOrderId },
      include: this.getIncludeRelations(),
      orderBy: { confirmedAt: 'desc' }
    }) as unknown as SafetyBriefingWithRelations[]
  }

  /**
   * Find all briefings by a user
   */
  static async findByUser(
    userId: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<SafetyBriefingWithRelations[]> {
    const where: Prisma.SafetyBriefingWhereInput = {
      userId,
      ...(fromDate && {
        confirmedAt: {
          gte: fromDate,
          ...(toDate && { lte: toDate })
        }
      })
    }

    return await prisma.safetyBriefing.findMany({
      where,
      include: this.getIncludeRelations(),
      orderBy: { confirmedAt: 'desc' }
    }) as unknown as SafetyBriefingWithRelations[]
  }

  /**
   * Create new safety briefing
   */
  static async create(
    data: Prisma.SafetyBriefingCreateInput
  ): Promise<SafetyBriefingWithRelations> {
    return await prisma.safetyBriefing.create({
      data,
      include: this.getIncludeRelations()
    }) as unknown as SafetyBriefingWithRelations
  }

  /**
   * Update existing briefing
   */
  static async update(
    id: string,
    data: Prisma.SafetyBriefingUpdateInput
  ): Promise<SafetyBriefingWithRelations> {
    return await prisma.safetyBriefing.update({
      where: { id },
      data,
      include: this.getIncludeRelations()
    }) as unknown as SafetyBriefingWithRelations
  }

  /**
   * Delete briefing
   */
  static async delete(id: string): Promise<void> {
    await prisma.safetyBriefing.delete({
      where: { id }
    })
  }

  /**
   * Check if user has confirmed safety documents for a work order
   */
  static async hasUserConfirmed(
    workOrderId: string,
    userId: string
  ): Promise<boolean> {
    const briefing = await prisma.safetyBriefing.findUnique({
      where: {
        workOrderId_userId: {
          workOrderId,
          userId
        }
      },
      select: { id: true }
    })

    return briefing !== null
  }
}

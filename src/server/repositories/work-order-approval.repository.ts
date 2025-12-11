/**
 * Work Order Approval Repository
 * Data access layer for work order approvals
 */

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { WorkOrderApprovalWithRelations } from "@/types/work-order-approval.types"

export class WorkOrderApprovalRepository {
  /**
   * Define include relations for queries
   */
  static getIncludeRelations(): Prisma.WorkOrderApprovalInclude {
    return {
      workOrder: {
        select: {
          id: true,
          number: true,
          title: true,
          status: true
        }
      },
      approvedByUser: {
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
  static async findById(id: string): Promise<WorkOrderApprovalWithRelations | null> {
    return await prisma.workOrderApproval.findUnique({
      where: { id },
      include: this.getIncludeRelations()
    }) as unknown as WorkOrderApprovalWithRelations | null
  }

  /**
   * Find first matching criteria
   */
  static async findFirst(
    whereClause: Prisma.WorkOrderApprovalWhereInput
  ): Promise<WorkOrderApprovalWithRelations | null> {
    return await prisma.workOrderApproval.findFirst({
      where: whereClause,
      include: this.getIncludeRelations()
    }) as unknown as WorkOrderApprovalWithRelations | null
  }

  /**
   * Find many with pagination
   */
  static async findMany(
    whereClause: Prisma.WorkOrderApprovalWhereInput,
    page: number,
    limit: number
  ): Promise<{ items: WorkOrderApprovalWithRelations[]; total: number }> {
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      prisma.workOrderApproval.findMany({
        where: whereClause,
        include: this.getIncludeRelations(),
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.workOrderApproval.count({ where: whereClause })
    ])

    return {
      items: items as unknown as WorkOrderApprovalWithRelations[],
      total
    }
  }

  /**
   * Create new record
   */
  static async create(
    data: Prisma.WorkOrderApprovalCreateInput
  ): Promise<WorkOrderApprovalWithRelations> {
    return await prisma.workOrderApproval.create({
      data,
      include: this.getIncludeRelations()
    }) as unknown as WorkOrderApprovalWithRelations
  }

  /**
   * Update record
   */
  static async update(
    id: string,
    data: Prisma.WorkOrderApprovalUpdateInput
  ): Promise<WorkOrderApprovalWithRelations> {
    return await prisma.workOrderApproval.update({
      where: { id },
      data,
      include: this.getIncludeRelations()
    }) as unknown as WorkOrderApprovalWithRelations
  }

  /**
   * Get all approvals for a work order
   */
  static async getByWorkOrder(
    workOrderId: string
  ): Promise<WorkOrderApprovalWithRelations[]> {
    return await prisma.workOrderApproval.findMany({
      where: { workOrderId },
      include: this.getIncludeRelations(),
      orderBy: { level: 'asc' }
    }) as unknown as WorkOrderApprovalWithRelations[]
  }

  /**
   * Get pending approvals for a specific approver
   */
  static async getPendingForApprover(
    approverId: string
  ): Promise<WorkOrderApprovalWithRelations[]> {
    return await prisma.workOrderApproval.findMany({
      where: {
        approverId,
        status: 'PENDING'
      },
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'asc' }
    }) as unknown as WorkOrderApprovalWithRelations[]
  }

  /**
   * Get current pending approval level for a work order
   */
  static async getCurrentLevelApproval(
    workOrderId: string
  ): Promise<WorkOrderApprovalWithRelations | null> {
    return await prisma.workOrderApproval.findFirst({
      where: {
        workOrderId,
        status: 'PENDING'
      },
      include: this.getIncludeRelations(),
      orderBy: { level: 'asc' }
    }) as unknown as WorkOrderApprovalWithRelations | null
  }
}

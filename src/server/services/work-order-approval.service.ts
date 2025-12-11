/**
 * Work Order Approval Service
 * Approval processing for work orders
 */

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { WorkOrderApprovalRepository } from "../repositories/work-order-approval.repository"
import { PermissionGuard } from "../helpers/permission-guard"
import { getCurrentCompanyId } from "@/lib/company-context"
import type { AuthenticatedSession } from "@/types/auth.types"
import type {
  WorkOrderApprovalFilters,
  WorkOrderApprovalWithRelations,
  PaginatedWorkOrderApprovalsResponse,
  ApproveWorkOrderData,
  RejectWorkOrderData,
  CreateWorkOrderApprovalData
} from "@/types/work-order-approval.types"

export class WorkOrderApprovalService {
  /**
   * Build WHERE clause for approvals
   */
  static async buildWhereClause(
    session: AuthenticatedSession,
    filters?: WorkOrderApprovalFilters
  ): Promise<Prisma.WorkOrderApprovalWhereInput> {
    const whereClause: Prisma.WorkOrderApprovalWhereInput = {}

    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    whereClause.workOrder = {
      site: {
        clientCompany: {
          tenantCompanyId: companyId
        }
      }
    }

    if (filters?.workOrderId) {
      whereClause.workOrderId = filters.workOrderId
    }
    if (filters?.approverId) {
      whereClause.approverId = filters.approverId
    }
    if (filters?.status) {
      whereClause.status = filters.status
    }
    if (filters?.level !== undefined) {
      whereClause.level = filters.level
    }
    if (filters?.createdAtFrom || filters?.createdAtTo) {
      whereClause.createdAt = {}
      if (filters?.createdAtFrom) whereClause.createdAt.gte = filters.createdAtFrom
      if (filters?.createdAtTo) whereClause.createdAt.lte = filters.createdAtTo
    }

    return whereClause
  }

  /**
   * Get list of approvals
   */
  static async getList(
    session: AuthenticatedSession,
    filters: WorkOrderApprovalFilters,
    page: number,
    limit: number
  ): Promise<PaginatedWorkOrderApprovalsResponse> {
    await PermissionGuard.require(session, 'work_orders.view')
    const whereClause = await this.buildWhereClause(session, filters)
    const { items, total } = await WorkOrderApprovalRepository.findMany(whereClause, page, limit)

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Get pending approvals for current user
   */
  static async getPendingApprovals(
    session: AuthenticatedSession
  ): Promise<WorkOrderApprovalWithRelations[]> {
    await PermissionGuard.require(session, 'work_orders.view')
    return await WorkOrderApprovalRepository.getPendingForApprover(session.user.id)
  }

  /**
   * Get approval by ID
   */
  static async getById(id: string, session: AuthenticatedSession): Promise<WorkOrderApprovalWithRelations | null> {
    await PermissionGuard.require(session, 'work_orders.view')
    return await WorkOrderApprovalRepository.findById(id)
  }

  /**
   * Create new approval
   */
  static async create(
    data: CreateWorkOrderApprovalData,
    session: AuthenticatedSession
  ): Promise<WorkOrderApprovalWithRelations> {
    await PermissionGuard.require(session, 'work_orders.create')
    const createData: Prisma.WorkOrderApprovalCreateInput = {
      workOrder: { connect: { id: data.workOrderId } },
      level: data.level,
      approverId: data.approverId || null,
      status: "PENDING"
    }
    return await WorkOrderApprovalRepository.create(createData)
  }

  /**
   * Approve work order
   */
  static async approve(
    approvalId: string,
    data: ApproveWorkOrderData,
    session: AuthenticatedSession
  ): Promise<WorkOrderApprovalWithRelations | null> {
    const approval = await WorkOrderApprovalRepository.findById(approvalId)
    if (!approval) return null

    const hasOverride = await PermissionGuard.check(session, 'approval.override')
    const isApprover = approval.approverId === session.user.id

    if (!hasOverride && !isApprover) {
      throw new Error("No tiene permisos para aprobar esta orden")
    }

    const updateData: Prisma.WorkOrderApprovalUpdateInput = {
      status: "APPROVED",
      approvedByUser: { connect: { id: session.user.id } },
      approvedAt: new Date(),
      comments: data.comments || null
    }

    const updated = await WorkOrderApprovalRepository.update(approvalId, updateData)

    const nextLevel = await WorkOrderApprovalRepository.getCurrentLevelApproval(
      approval.workOrderId
    )

    if (!nextLevel) {
      await prisma.workOrder.update({
        where: { id: approval.workOrderId },
        data: { status: "APPROVED" }
      })
    }

    return updated
  }

  /**
   * Reject work order
   */
  static async reject(
    approvalId: string,
    data: RejectWorkOrderData,
    session: AuthenticatedSession
  ): Promise<WorkOrderApprovalWithRelations | null> {
    const approval = await WorkOrderApprovalRepository.findById(approvalId)
    if (!approval) return null

    const hasOverride = await PermissionGuard.check(session, 'approval.override')
    const isApprover = approval.approverId === session.user.id

    if (!hasOverride && !isApprover) {
      throw new Error("No tiene permisos para rechazar esta orden")
    }

    const updateData: Prisma.WorkOrderApprovalUpdateInput = {
      status: "REJECTED",
      approvedByUser: { connect: { id: session.user.id } },
      rejectedAt: new Date(),
      comments: data.comments
    }

    const updated = await WorkOrderApprovalRepository.update(approvalId, updateData)

    await prisma.workOrder.update({
      where: { id: approval.workOrderId },
      data: { status: "REJECTED" }
    })

    return updated
  }
}

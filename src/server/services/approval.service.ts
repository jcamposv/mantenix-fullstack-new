/**
 * Approval Service
 * Business logic for approval workflow evaluation and processing
 */

import { Prisma } from "@prisma/client"
import { AuthorityLimitRepository } from "../repositories/authority-limit.repository"
import { ApprovalRuleRepository } from "../repositories/approval-rule.repository"
import { WorkOrderApprovalRepository } from "../repositories/work-order-approval.repository"
import { PermissionGuard } from "../helpers/permission-guard"
import { getCurrentCompanyId } from "@/lib/company-context"
import type { AuthenticatedSession } from "@/types/auth.types"
import type {
  CreateAuthorityLimitData,
  UpdateAuthorityLimitData,
  AuthorityLimitFilters,
  AuthorityLimitWithRelations,
  PaginatedAuthorityLimitsResponse
} from "@/types/authority-limit.types"
import type { ApprovalRuleWithRelations } from "@/types/approval-rule.types"

export class ApprovalService {
  // ============================================================================
  // AUTHORITY LIMIT METHODS
  // ============================================================================

  /**
   * Build WHERE clause for authority limits
   */
  static async buildAuthorityLimitWhereClause(
    session: AuthenticatedSession,
    filters?: AuthorityLimitFilters
  ): Promise<Prisma.AuthorityLimitWhereInput> {
    const whereClause: Prisma.AuthorityLimitWhereInput = {}

    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    whereClause.companyId = companyId

    if (filters?.search) {
      whereClause.roleKey = { contains: filters.search, mode: 'insensitive' }
    }
    if (filters?.roleKey) {
      whereClause.roleKey = filters.roleKey
    }
    if (filters?.isActive !== undefined) {
      whereClause.isActive = filters.isActive
    }

    return whereClause
  }

  static async getAuthorityLimitById(
    id: string,
    session: AuthenticatedSession
  ): Promise<AuthorityLimitWithRelations | null> {
    await PermissionGuard.require(session, 'approval.manage_authority_limits')

    const authorityLimit = await AuthorityLimitRepository.findById(id)
    if (!authorityLimit) return null

    const companyId = await getCurrentCompanyId(session)
    if (authorityLimit.companyId !== companyId) {
      throw new Error("No tiene acceso a este registro")
    }

    return authorityLimit
  }

  static async getAuthorityLimits(
    session: AuthenticatedSession,
    filters: AuthorityLimitFilters,
    page: number,
    limit: number
  ): Promise<PaginatedAuthorityLimitsResponse> {
    await PermissionGuard.require(session, 'approval.manage_authority_limits')
    const whereClause = await this.buildAuthorityLimitWhereClause(session, filters)
    const { items, total } = await AuthorityLimitRepository.findMany(whereClause, page, limit)

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  static async createAuthorityLimit(
    data: CreateAuthorityLimitData,
    session: AuthenticatedSession
  ): Promise<AuthorityLimitWithRelations> {
    await PermissionGuard.require(session, 'approval.manage_authority_limits')

    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    const exists = await AuthorityLimitRepository.checkExists(data.roleKey, companyId)
    if (exists) {
      throw new Error("Ya existe un límite de autoridad para este rol")
    }

    const createData: Prisma.AuthorityLimitCreateInput = {
      roleKey: data.roleKey,
      maxDirectAuthorization: data.maxDirectAuthorization,
      canCreateWorkOrders: data.canCreateWorkOrders ?? true,
      canAssignDirectly: data.canAssignDirectly ?? true,
      isActive: data.isActive ?? true,
      company: { connect: { id: companyId } }
    }

    return await AuthorityLimitRepository.create(createData)
  }

  static async updateAuthorityLimit(
    id: string,
    data: UpdateAuthorityLimitData,
    session: AuthenticatedSession
  ): Promise<AuthorityLimitWithRelations | null> {
    await PermissionGuard.require(session, 'approval.manage_authority_limits')

    const existing = await AuthorityLimitRepository.findById(id)
    if (!existing) return null

    // Verify company access
    const companyId = await getCurrentCompanyId(session)
    if (existing.companyId !== companyId) {
      throw new Error("No tiene acceso a este registro")
    }

    if (data.roleKey && data.roleKey !== existing.roleKey) {
      const exists = await AuthorityLimitRepository.checkExists(data.roleKey, companyId, id)
      if (exists) {
        throw new Error("Ya existe un límite de autoridad para este rol")
      }
    }

    const updateData: Prisma.AuthorityLimitUpdateInput = {
      ...data,
      updatedAt: new Date()
    }

    return await AuthorityLimitRepository.update(id, updateData)
  }

  static async deleteAuthorityLimit(
    id: string,
    session: AuthenticatedSession
  ): Promise<AuthorityLimitWithRelations | null> {
    await PermissionGuard.require(session, 'approval.manage_authority_limits')

    const existing = await AuthorityLimitRepository.findById(id)
    if (!existing) return null

    const companyId = await getCurrentCompanyId(session)
    if (existing.companyId !== companyId) {
      throw new Error("No tiene acceso a este registro")
    }

    return await AuthorityLimitRepository.softDelete(id)
  }

  // ============================================================================
  // WORK ORDER APPROVAL EVALUATION
  // ============================================================================

  /**
   * Evaluate if work order needs approval based on rules
   */
  static async evaluateWorkOrderForApproval(
    workOrderData: {
      estimatedCost?: number
      priority?: string
      type?: string
      assetCriticality?: string
    },
    companyId: string
  ): Promise<{ needsApproval: boolean; approvalLevels: number; requiresQA: boolean }> {
    const rules: ApprovalRuleWithRelations[] = await ApprovalRuleRepository.getActiveByCompany(companyId)
    let maxApprovalLevels = 0
    let requiresQA = false

    for (const rule of rules) {
      let matches = true

      // Check cost range
      if (rule.minCost !== null && (workOrderData.estimatedCost ?? 0) < rule.minCost) {
        matches = false
      }
      if (rule.maxCost !== null && (workOrderData.estimatedCost ?? 0) > rule.maxCost) {
        matches = false
      }

      // Check priority
      if (rule.priority && rule.priority !== workOrderData.priority) {
        matches = false
      }

      // Check type
      if (rule.type && rule.type !== workOrderData.type) {
        matches = false
      }

      // Check asset criticality
      if (rule.assetCriticality && rule.assetCriticality !== workOrderData.assetCriticality) {
        matches = false
      }

      if (matches) {
        if (rule.approvalLevels > maxApprovalLevels) {
          maxApprovalLevels = rule.approvalLevels
        }
        if (rule.requiresQA) {
          requiresQA = true
        }
      }
    }

    return {
      needsApproval: maxApprovalLevels > 0,
      approvalLevels: maxApprovalLevels,
      requiresQA
    }
  }

  /**
   * Create approval records for a work order
   */
  static async createApprovalsForWorkOrder(
    workOrderId: string,
    approvalLevels: number
  ): Promise<void> {
    for (let level = 1; level <= approvalLevels; level++) {
      await WorkOrderApprovalRepository.create({
        workOrder: { connect: { id: workOrderId } },
        level,
        status: 'PENDING'
      })
    }
  }
}

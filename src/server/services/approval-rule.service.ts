/**
 * Approval Rule Service
 * Business logic for approval rule management
 */

import { Prisma, WorkOrderType as PrismaWorkOrderType, ComponentCriticality as PrismaComponentCriticality } from "@prisma/client"
import { ApprovalRuleRepository } from "../repositories/approval-rule.repository"
import { PermissionGuard } from "../helpers/permission-guard"
import { getCurrentCompanyId } from "@/lib/company-context"
import type { AuthenticatedSession } from "@/types/auth.types"
import type {
  CreateApprovalRuleData,
  UpdateApprovalRuleData,
  ApprovalRuleFilters,
  ApprovalRuleWithRelations,
  PaginatedApprovalRulesResponse,
  WorkOrderType,
  ComponentCriticality
} from "@/types/approval-rule.types"

// Map TypeScript WorkOrderType to Prisma WorkOrderType enum
const mapWorkOrderTypeToPrisma = (type: WorkOrderType): PrismaWorkOrderType | null => {
  const mapping: Record<WorkOrderType, PrismaWorkOrderType> = {
    PREVENTIVE: "PREVENTIVO",
    CORRECTIVE: "CORRECTIVO",
    PREDICTIVE: "REPARACION", // Map PREDICTIVE to REPARACION as closest match
    INSPECTION: "PREVENTIVO", // Map INSPECTION to PREVENTIVO as closest match
    MODIFICATION: "CORRECTIVO" // Map MODIFICATION to CORRECTIVO as closest match
  }
  return mapping[type] || null
}

// Map TypeScript ComponentCriticality to Prisma ComponentCriticality enum
const mapComponentCriticalityToPrisma = (criticality: ComponentCriticality): PrismaComponentCriticality | null => {
  const mapping: Record<ComponentCriticality, PrismaComponentCriticality> = {
    LOW: "C",
    MEDIUM: "B",
    HIGH: "B",
    CRITICAL: "A"
  }
  return mapping[criticality] || null
}

export class ApprovalRuleService {
  /**
   * Build WHERE clause for approval rules
   */
  static async buildWhereClause(
    session: AuthenticatedSession,
    filters?: ApprovalRuleFilters
  ): Promise<Prisma.ApprovalRuleWhereInput> {
    const whereClause: Prisma.ApprovalRuleWhereInput = {}

    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    whereClause.companyId = companyId

    if (filters?.search) {
      whereClause.name = { contains: filters.search, mode: 'insensitive' }
    }
    if (filters?.priority) {
      whereClause.priority = filters.priority
    }
    if (filters?.type) {
      const prismaType = mapWorkOrderTypeToPrisma(filters.type)
      if (prismaType) {
        whereClause.type = prismaType
      }
    }
    if (filters?.isActive !== undefined) {
      whereClause.isActive = filters.isActive
    }
    if (filters?.minCostFrom !== undefined) {
      whereClause.minCost = { gte: filters.minCostFrom }
    }
    if (filters?.minCostTo !== undefined) {
      whereClause.minCost = { lte: filters.minCostTo }
    }

    return whereClause
  }

  /**
   * Get list of approval rules
   */
  static async getList(
    session: AuthenticatedSession,
    filters: ApprovalRuleFilters,
    page: number,
    limit: number
  ): Promise<PaginatedApprovalRulesResponse> {
    await PermissionGuard.require(session, 'approval.manage_rules')
    const whereClause = await this.buildWhereClause(session, filters)
    const { items, total } = await ApprovalRuleRepository.findMany(whereClause, page, limit)

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Get approval rule by ID
   */
  static async getById(
    id: string,
    session: AuthenticatedSession
  ): Promise<ApprovalRuleWithRelations | null> {
    await PermissionGuard.require(session, 'approval.manage_rules')

    const rule = await ApprovalRuleRepository.findById(id)
    if (!rule) return null

    const companyId = await getCurrentCompanyId(session)
    if (rule.companyId !== companyId) {
      throw new Error("No tiene acceso a este registro")
    }

    return rule
  }

  /**
   * Create new approval rule
   */
  static async create(
    data: CreateApprovalRuleData,
    session: AuthenticatedSession
  ): Promise<ApprovalRuleWithRelations> {
    await PermissionGuard.require(session, 'approval.manage_rules')

    const companyId = await getCurrentCompanyId(session)
    if (!companyId) {
      throw new Error("No se pudo determinar la empresa")
    }

    const exists = await ApprovalRuleRepository.checkExists(data.name, companyId)
    if (exists) {
      throw new Error("Ya existe una regla con este nombre")
    }

    const createData: Prisma.ApprovalRuleCreateInput = {
      name: data.name,
      description: data.description || null,
      minCost: data.minCost || null,
      maxCost: data.maxCost || null,
      priority: data.priority || null,
      type: data.type ? mapWorkOrderTypeToPrisma(data.type) : null,
      assetCriticality: data.assetCriticality ? mapComponentCriticalityToPrisma(data.assetCriticality) : null,
      approvalLevels: data.approvalLevels,
      isActive: data.isActive ?? true,
      company: { connect: { id: companyId } }
    }

    return await ApprovalRuleRepository.create(createData)
  }

  /**
   * Update approval rule
   */
  static async update(
    id: string,
    data: UpdateApprovalRuleData,
    session: AuthenticatedSession
  ): Promise<ApprovalRuleWithRelations | null> {
    await PermissionGuard.require(session, 'approval.manage_rules')

    const existing = await ApprovalRuleRepository.findById(id)
    if (!existing) return null

    const companyId = await getCurrentCompanyId(session)
    if (existing.companyId !== companyId) {
      throw new Error("No tiene acceso a este registro")
    }

    if (data.name && data.name !== existing.name) {
      const exists = await ApprovalRuleRepository.checkExists(data.name, companyId, id)
      if (exists) {
        throw new Error("Ya existe una regla con este nombre")
      }
    }

    const updateData: Prisma.ApprovalRuleUpdateInput = {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.minCost !== undefined && { minCost: data.minCost }),
      ...(data.maxCost !== undefined && { maxCost: data.maxCost }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.type !== undefined && { type: data.type ? mapWorkOrderTypeToPrisma(data.type) : null }),
      ...(data.assetCriticality !== undefined && { assetCriticality: data.assetCriticality ? mapComponentCriticalityToPrisma(data.assetCriticality) : null }),
      ...(data.approvalLevels !== undefined && { approvalLevels: data.approvalLevels }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updatedAt: new Date()
    }

    return await ApprovalRuleRepository.update(id, updateData)
  }

  /**
   * Delete approval rule (soft delete)
   */
  static async delete(
    id: string,
    session: AuthenticatedSession
  ): Promise<ApprovalRuleWithRelations | null> {
    await PermissionGuard.require(session, 'approval.manage_rules')

    const existing = await ApprovalRuleRepository.findById(id)
    if (!existing) return null

    const companyId = await getCurrentCompanyId(session)
    if (existing.companyId !== companyId) {
      throw new Error("No tiene acceso a este registro")
    }

    return await ApprovalRuleRepository.softDelete(id)
  }
}

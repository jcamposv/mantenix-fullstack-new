/**
 * CAP Action Service
 * Business logic for Corrective and Preventive Actions
 */

import { Prisma } from "@prisma/client"
import { CAPActionRepository } from "../repositories/cap-action.repository"
import { PermissionGuard } from "../helpers/permission-guard"
import { getCurrentCompanyId } from "@/lib/company-context"
import type { AuthenticatedSession } from "@/types/auth.types"
import type {
  CreateCAPActionData,
  UpdateCAPActionData,
  CAPActionFilters,
  CAPActionWithRelations,
  PaginatedCAPActionsResponse,
  CompleteCAPActionData,
  VerifyCAPActionData
} from "@/types/cap-action.types"

export class CAPActionService {
  static async buildWhereClause(session: AuthenticatedSession, filters?: CAPActionFilters): Promise<Prisma.CAPActionWhereInput> {
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) throw new Error("No se pudo determinar la empresa")

    const whereClause: Prisma.CAPActionWhereInput = {
      rca: { workOrder: { site: { clientCompany: { tenantCompanyId: companyId } } } }
    }

    if (filters?.search) whereClause.description = { contains: filters.search, mode: 'insensitive' }
    if (filters?.rcaId) whereClause.rcaId = filters.rcaId
    if (filters?.actionType) whereClause.actionType = filters.actionType
    if (filters?.status) whereClause.status = filters.status
    if (filters?.assignedTo) whereClause.assignedTo = filters.assignedTo
    if (filters?.priority) whereClause.priority = filters.priority
    if (filters?.dueDateFrom || filters?.dueDateTo) {
      whereClause.dueDate = {}
      if (filters?.dueDateFrom) whereClause.dueDate.gte = filters.dueDateFrom
      if (filters?.dueDateTo) whereClause.dueDate.lte = filters.dueDateTo
    }
    if (filters?.createdAtFrom || filters?.createdAtTo) {
      whereClause.createdAt = {}
      if (filters?.createdAtFrom) whereClause.createdAt.gte = filters.createdAtFrom
      if (filters?.createdAtTo) whereClause.createdAt.lte = filters.createdAtTo
    }

    return whereClause
  }

  static async getList(session: AuthenticatedSession, filters: CAPActionFilters, page: number, limit: number): Promise<PaginatedCAPActionsResponse> {
    await PermissionGuard.require(session, 'capa.view')
    const whereClause = await this.buildWhereClause(session, filters)
    const { items, total } = await CAPActionRepository.findMany(whereClause, page, limit)
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  static async getById(id: string, session: AuthenticatedSession): Promise<CAPActionWithRelations | null> {
    await PermissionGuard.require(session, 'capa.view')
    return await CAPActionRepository.findById(id)
  }

  static async create(data: CreateCAPActionData, session: AuthenticatedSession): Promise<CAPActionWithRelations> {
    await PermissionGuard.require(session, 'capa.create')
    const createData: Prisma.CAPActionCreateInput = {
      rca: { connect: { id: data.rcaId } },
      actionType: data.actionType,
      description: data.description,
      assigned: { connect: { id: data.assignedTo } },
      priority: data.priority,
      status: "PENDING",
      dueDate: data.dueDate || null,
      notes: data.notes || null
    }
    return await CAPActionRepository.create(createData)
  }

  static async update(id: string, data: UpdateCAPActionData, session: AuthenticatedSession): Promise<CAPActionWithRelations | null> {
    await PermissionGuard.require(session, 'capa.create')
    const existing = await CAPActionRepository.findById(id)
    if (!existing) return null
    const updateData: Prisma.CAPActionUpdateInput = {
      actionType: data.actionType,
      description: data.description,
      assigned: data.assignedTo ? { connect: { id: data.assignedTo } } : undefined,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate !== undefined ? data.dueDate : undefined,
      completedAt: data.completedAt !== undefined ? data.completedAt : undefined,
      verifiedAt: data.verifiedAt !== undefined ? data.verifiedAt : undefined,
      verifier: data.verifiedBy ? { connect: { id: data.verifiedBy } } : undefined,
      effectiveness: data.effectiveness,
      notes: data.notes !== undefined ? data.notes : undefined,
      updatedAt: new Date()
    }
    return await CAPActionRepository.update(id, updateData)
  }

  static async delete(id: string, session: AuthenticatedSession): Promise<void> {
    await PermissionGuard.require(session, 'capa.create')
    const existing = await CAPActionRepository.findById(id)
    if (!existing) throw new Error("Acción CAP no encontrada")
    await CAPActionRepository.hardDelete(id)
  }

  static async getOverdue(session: AuthenticatedSession): Promise<CAPActionWithRelations[]> {
    await PermissionGuard.require(session, 'capa.view')
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) throw new Error("No se pudo determinar la empresa")
    return await CAPActionRepository.getOverdue(companyId)
  }

  static async getDueSoon(session: AuthenticatedSession, days: number = 7): Promise<CAPActionWithRelations[]> {
    await PermissionGuard.require(session, 'capa.view')
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) throw new Error("No se pudo determinar la empresa")
    return await CAPActionRepository.getDueSoon(companyId, days)
  }

  static async complete(actionId: string, data: CompleteCAPActionData, session: AuthenticatedSession): Promise<CAPActionWithRelations | null> {
    const action = await CAPActionRepository.findById(actionId)
    if (!action) return null
    const isAssigned = action.assignedTo === session.user.id
    const canAssign = await PermissionGuard.check(session, 'capa.assign')
    if (!isAssigned && !canAssign) throw new Error("No tiene permisos para completar esta acción")
    return await CAPActionRepository.update(actionId, {
      status: "IMPLEMENTED",
      completedAt: new Date(),
      notes: data.notes || action.notes
    })
  }

  static async verify(actionId: string, data: VerifyCAPActionData, session: AuthenticatedSession): Promise<CAPActionWithRelations | null> {
    await PermissionGuard.require(session, 'capa.verify')
    const action = await CAPActionRepository.findById(actionId)
    if (!action) return null
    if (action.status !== "IMPLEMENTED") throw new Error("La acción debe estar implementada para verificarse")
    return await CAPActionRepository.update(actionId, {
      status: "VERIFIED",
      verifier: { connect: { id: session.user.id } },
      verifiedAt: new Date(),
      effectiveness: data.effectiveness,
      notes: data.notes || action.notes
    })
  }
}

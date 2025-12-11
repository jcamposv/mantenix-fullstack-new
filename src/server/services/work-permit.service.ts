/**
 * Work Permit Service
 * Business logic for work permit management
 */

import { Prisma } from "@prisma/client"
import { WorkPermitRepository } from "../repositories/work-permit.repository"
import { PermissionGuard } from "../helpers/permission-guard"
import { getCurrentCompanyId } from "@/lib/company-context"
import type { AuthenticatedSession } from "@/types/auth.types"
import type {
  CreateWorkPermitData,
  UpdateWorkPermitData,
  WorkPermitFilters,
  WorkPermitWithRelations,
  PaginatedWorkPermitsResponse,
  AuthorizePermitData,
  ClosePermitData
} from "@/types/work-permit.types"

export class WorkPermitService {
  static async buildWhereClause(
    session: AuthenticatedSession,
    filters?: WorkPermitFilters
  ): Promise<Prisma.WorkPermitWhereInput> {
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) throw new Error("No se pudo determinar la empresa")

    const whereClause: Prisma.WorkPermitWhereInput = {
      workOrder: { site: { clientCompany: { tenantCompanyId: companyId } } }
    }

    if (filters?.workOrderId) whereClause.workOrderId = filters.workOrderId
    if (filters?.permitType) whereClause.permitType = filters.permitType
    if (filters?.status) whereClause.status = filters.status
    if (filters?.issuedBy) whereClause.issuedBy = filters.issuedBy
    if (filters?.location) whereClause.location = { contains: filters.location, mode: 'insensitive' }
    if (filters?.validFromStart || filters?.validFromEnd) {
      whereClause.validFrom = {}
      if (filters?.validFromStart) whereClause.validFrom.gte = filters.validFromStart
      if (filters?.validFromEnd) whereClause.validFrom.lte = filters.validFromEnd
    }

    return whereClause
  }

  static async getList(
    session: AuthenticatedSession,
    filters: WorkPermitFilters,
    page: number,
    limit: number
  ): Promise<PaginatedWorkPermitsResponse> {
    await PermissionGuard.require(session, 'safety.view_permits')
    const whereClause = await this.buildWhereClause(session, filters)
    const { items, total } = await WorkPermitRepository.findMany(whereClause, page, limit)
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  static async getById(id: string, session: AuthenticatedSession): Promise<WorkPermitWithRelations | null> {
    await PermissionGuard.require(session, 'safety.view_permits')
    return await WorkPermitRepository.findById(id)
  }

  static async create(data: CreateWorkPermitData, session: AuthenticatedSession): Promise<WorkPermitWithRelations> {
    await PermissionGuard.require(session, 'safety.manage_permits')
    const createData: Prisma.WorkPermitCreateInput = {
      workOrder: { connect: { id: data.workOrderId } },
      permitType: data.permitType,
      issuer: { connect: { id: session.user.id } },
      status: "DRAFT",
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      location: data.location,
      hazards: data.hazards,
      precautions: data.precautions,
      ppe: data.ppe,
      emergencyContact: data.emergencyContact || null
    }
    return await WorkPermitRepository.create(createData)
  }

  static async update(id: string, data: UpdateWorkPermitData, session: AuthenticatedSession): Promise<WorkPermitWithRelations | null> {
    await PermissionGuard.require(session, 'safety.manage_permits')
    const existing = await WorkPermitRepository.findById(id)
    if (!existing) return null
    return await WorkPermitRepository.update(id, { ...data, updatedAt: new Date() })
  }

  static async delete(id: string, session: AuthenticatedSession): Promise<void> {
    await PermissionGuard.require(session, 'safety.manage_permits')
    const existing = await WorkPermitRepository.findById(id)
    if (!existing) throw new Error("Permiso de trabajo no encontrado")
    await WorkPermitRepository.hardDelete(id)
  }

  static async authorize(permitId: string, data: AuthorizePermitData, session: AuthenticatedSession): Promise<WorkPermitWithRelations | null> {
    await PermissionGuard.require(session, 'safety.authorize_permits')
    const permit = await WorkPermitRepository.findById(permitId)
    if (!permit) return null
    if (permit.status !== "PENDING_AUTHORIZATION") throw new Error("El permiso no está pendiente de autorización")
    return await WorkPermitRepository.update(permitId, {
      status: "ACTIVE",
      authorizer: { connect: { id: session.user.id } },
      authorizedAt: new Date()
    })
  }

  static async close(permitId: string, data: ClosePermitData, session: AuthenticatedSession): Promise<WorkPermitWithRelations | null> {
    await PermissionGuard.require(session, 'safety.manage_permits')
    const permit = await WorkPermitRepository.findById(permitId)
    if (!permit) return null
    return await WorkPermitRepository.update(permitId, { status: "CLOSED", closedAt: new Date() })
  }

  static async getExpired(session: AuthenticatedSession): Promise<WorkPermitWithRelations[]> {
    await PermissionGuard.require(session, 'safety.view_permits')
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) throw new Error("No se pudo determinar la empresa")
    return await WorkPermitRepository.getExpiredPermits(companyId)
  }
}

/**
 * LOTO Procedure Service
 * Business logic for Lock-Out/Tag-Out procedures
 */

import { Prisma } from "@prisma/client"
import { LOTOProcedureRepository } from "../repositories/loto-procedure.repository"
import { PermissionGuard } from "../helpers/permission-guard"
import { getCurrentCompanyId } from "@/lib/company-context"
import type { AuthenticatedSession } from "@/types/auth.types"
import type {
  CreateLOTOProcedureData,
  UpdateLOTOProcedureData,
  LOTOProcedureFilters,
  LOTOProcedureWithRelations,
  PaginatedLOTOProceduresResponse,
  ApplyLOTOData,
  VerifyLOTOData,
  RemoveLOTOData
} from "@/types/loto-procedure.types"

export class LOTOProcedureService {
  static async buildWhereClause(session: AuthenticatedSession, filters?: LOTOProcedureFilters): Promise<Prisma.LOTOProcedureWhereInput> {
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) throw new Error("No se pudo determinar la empresa")

    const whereClause: Prisma.LOTOProcedureWhereInput = {
      workOrder: { site: { clientCompany: { tenantCompanyId: companyId } } }
    }

    if (filters?.workOrderId) whereClause.workOrderId = filters.workOrderId
    if (filters?.assetId) whereClause.assetId = filters.assetId
    if (filters?.status) whereClause.status = filters.status
    if (filters?.authorizedBy) whereClause.authorizedBy = filters.authorizedBy
    if (filters?.createdAtFrom || filters?.createdAtTo) {
      whereClause.createdAt = {}
      if (filters?.createdAtFrom) whereClause.createdAt.gte = filters.createdAtFrom
      if (filters?.createdAtTo) whereClause.createdAt.lte = filters.createdAtTo
    }

    return whereClause
  }

  static async getList(session: AuthenticatedSession, filters: LOTOProcedureFilters, page: number, limit: number): Promise<PaginatedLOTOProceduresResponse> {
    await PermissionGuard.require(session, 'safety.view_loto')
    const whereClause = await this.buildWhereClause(session, filters)
    const { items, total } = await LOTOProcedureRepository.findMany(whereClause, page, limit)
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  static async getById(id: string, session: AuthenticatedSession): Promise<LOTOProcedureWithRelations | null> {
    await PermissionGuard.require(session, 'safety.view_loto')
    return await LOTOProcedureRepository.findById(id)
  }

  static async create(data: CreateLOTOProcedureData, session: AuthenticatedSession): Promise<LOTOProcedureWithRelations> {
    await PermissionGuard.require(session, 'safety.manage_loto')
    const createData: Prisma.LOTOProcedureCreateInput = {
      workOrder: { connect: { id: data.workOrderId } },
      asset: { connect: { id: data.assetId } },
      authorized: { connect: { id: session.user.id } },
      status: "PENDING",
      isolationPoints: data.isolationPoints,
      energySources: data.energySources,
      lockSerialNumbers: data.lockSerialNumbers ?? [],
      tagNumbers: data.tagNumbers ?? []
    }
    return await LOTOProcedureRepository.create(createData)
  }

  static async update(id: string, data: UpdateLOTOProcedureData, session: AuthenticatedSession): Promise<LOTOProcedureWithRelations | null> {
    await PermissionGuard.require(session, 'safety.manage_loto')
    const existing = await LOTOProcedureRepository.findById(id)
    if (!existing) return null
    return await LOTOProcedureRepository.update(id, { ...data, updatedAt: new Date() })
  }

  static async delete(id: string, session: AuthenticatedSession): Promise<void> {
    await PermissionGuard.require(session, 'safety.manage_loto')
    const existing = await LOTOProcedureRepository.findById(id)
    if (!existing) throw new Error("Procedimiento LOTO no encontrado")
    await LOTOProcedureRepository.hardDelete(id)
  }

  static async apply(lotoId: string, data: ApplyLOTOData, session: AuthenticatedSession): Promise<LOTOProcedureWithRelations | null> {
    // Técnicos solo necesitan ver/ejecutar LOTO, no gestionarlo
    await PermissionGuard.require(session, 'safety.view_loto')
    const loto = await LOTOProcedureRepository.findById(lotoId)
    if (!loto) return null
    if (loto.status !== "PENDING") throw new Error("El procedimiento LOTO no está pendiente")
    return await LOTOProcedureRepository.update(lotoId, {
      status: "APPLIED",
      lockSerialNumbers: data.lockSerialNumbers,
      tagNumbers: data.tagNumbers,
      appliedAt: new Date()
    })
  }

  static async verify(lotoId: string, data: VerifyLOTOData, session: AuthenticatedSession): Promise<LOTOProcedureWithRelations | null> {
    await PermissionGuard.require(session, 'safety.verify_loto')
    const loto = await LOTOProcedureRepository.findById(lotoId)
    if (!loto) return null
    if (loto.status !== "APPLIED") throw new Error("El procedimiento LOTO no ha sido aplicado")
    return await LOTOProcedureRepository.update(lotoId, {
      status: "VERIFIED",
      verifier: { connect: { id: session.user.id } },
      verifiedAt: new Date()
    })
  }

  static async remove(lotoId: string, data: RemoveLOTOData, session: AuthenticatedSession): Promise<LOTOProcedureWithRelations | null> {
    await PermissionGuard.require(session, 'safety.manage_loto')
    const loto = await LOTOProcedureRepository.findById(lotoId)
    if (!loto) return null
    if (loto.status !== "VERIFIED") throw new Error("El procedimiento LOTO debe estar verificado antes de removerlo")
    return await LOTOProcedureRepository.update(lotoId, {
      status: "REMOVED",
      removedAt: new Date(),
      removalAuthorizer: { connect: { id: session.user.id } }
    })
  }
}

/**
 * Root Cause Analysis Service
 * Business logic for RCA management
 */

import { Prisma } from "@prisma/client"
import { RootCauseAnalysisRepository } from "../repositories/root-cause-analysis.repository"
import { PermissionGuard } from "../helpers/permission-guard"
import { getCurrentCompanyId } from "@/lib/company-context"
import type { AuthenticatedSession } from "@/types/auth.types"
import type {
  CreateRootCauseAnalysisData,
  UpdateRootCauseAnalysisData,
  RootCauseAnalysisFilters,
  RootCauseAnalysisWithRelations,
  PaginatedRootCauseAnalysesResponse,
  ReviewRCAData,
  ApproveRCAData
} from "@/types/root-cause-analysis.types"

export class RootCauseAnalysisService {
  static async buildWhereClause(session: AuthenticatedSession, filters?: RootCauseAnalysisFilters): Promise<Prisma.RootCauseAnalysisWhereInput> {
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) throw new Error("No se pudo determinar la empresa")

    const whereClause: Prisma.RootCauseAnalysisWhereInput = {
      workOrder: { site: { clientCompany: { tenantCompanyId: companyId } } }
    }

    if (filters?.search) {
      whereClause.OR = [
        { failureMode: { contains: filters.search, mode: 'insensitive' } },
        { rootCause: { contains: filters.search, mode: 'insensitive' } }
      ]
    }
    if (filters?.workOrderId) whereClause.workOrderId = filters.workOrderId
    if (filters?.assetId) whereClause.assetId = filters.assetId
    if (filters?.analysisType) whereClause.analysisType = filters.analysisType
    if (filters?.status) whereClause.status = filters.status
    if (filters?.analyzedBy) whereClause.analyzedBy = filters.analyzedBy
    if (filters?.createdAtFrom || filters?.createdAtTo) {
      whereClause.createdAt = {}
      if (filters?.createdAtFrom) whereClause.createdAt.gte = filters.createdAtFrom
      if (filters?.createdAtTo) whereClause.createdAt.lte = filters.createdAtTo
    }

    return whereClause
  }

  static async getList(session: AuthenticatedSession, filters: RootCauseAnalysisFilters, page: number, limit: number): Promise<PaginatedRootCauseAnalysesResponse> {
    await PermissionGuard.require(session, 'rca.view')
    const whereClause = await this.buildWhereClause(session, filters)
    const { items, total } = await RootCauseAnalysisRepository.findMany(whereClause, page, limit)
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  static async getById(id: string, session: AuthenticatedSession): Promise<RootCauseAnalysisWithRelations | null> {
    await PermissionGuard.require(session, 'rca.view')
    return await RootCauseAnalysisRepository.findById(id)
  }

  static async create(data: CreateRootCauseAnalysisData, session: AuthenticatedSession): Promise<RootCauseAnalysisWithRelations> {
    await PermissionGuard.require(session, 'rca.create')
    const createData: Prisma.RootCauseAnalysisCreateInput = {
      workOrder: { connect: { id: data.workOrderId } },
      asset: data.assetId ? { connect: { id: data.assetId } } : undefined,
      analysisType: data.analysisType,
      failureMode: data.failureMode,
      immediateSymptom: data.immediateSymptom,
      why1: data.why1 || null,
      why2: data.why2 || null,
      why3: data.why3 || null,
      why4: data.why4 || null,
      why5: data.why5 || null,
      rootCause: data.rootCause || null,
      fishboneData: data.fishboneData ? (data.fishboneData as unknown as Prisma.InputJsonValue) : undefined,
      analyzer: { connect: { id: session.user.id } },
      status: "DRAFT"
    }
    return await RootCauseAnalysisRepository.create(createData)
  }

  static async update(id: string, data: UpdateRootCauseAnalysisData, session: AuthenticatedSession): Promise<RootCauseAnalysisWithRelations | null> {
    await PermissionGuard.require(session, 'rca.create')
    const existing = await RootCauseAnalysisRepository.findById(id)
    if (!existing) return null
    const updateData: Prisma.RootCauseAnalysisUpdateInput = {
      ...(data.analysisType !== undefined && { analysisType: data.analysisType }),
      ...(data.failureMode !== undefined && { failureMode: data.failureMode }),
      ...(data.immediateSymptom !== undefined && { immediateSymptom: data.immediateSymptom }),
      ...(data.why1 !== undefined && { why1: data.why1 }),
      ...(data.why2 !== undefined && { why2: data.why2 }),
      ...(data.why3 !== undefined && { why3: data.why3 }),
      ...(data.why4 !== undefined && { why4: data.why4 }),
      ...(data.why5 !== undefined && { why5: data.why5 }),
      ...(data.rootCause !== undefined && { rootCause: data.rootCause }),
      ...(data.fishboneData !== undefined && { fishboneData: data.fishboneData as unknown as Prisma.InputJsonValue }),
      ...(data.status !== undefined && { status: data.status }),
      updatedAt: new Date()
    }
    return await RootCauseAnalysisRepository.update(id, updateData)
  }

  static async delete(id: string, session: AuthenticatedSession): Promise<void> {
    await PermissionGuard.require(session, 'rca.create')
    const existing = await RootCauseAnalysisRepository.findById(id)
    if (!existing) throw new Error("RCA no encontrado")
    await RootCauseAnalysisRepository.hardDelete(id)
  }

  static async submitForReview(rcaId: string, session: AuthenticatedSession): Promise<RootCauseAnalysisWithRelations | null> {
    await PermissionGuard.require(session, 'rca.create')
    const rca = await RootCauseAnalysisRepository.findById(rcaId)
    if (!rca) return null
    if (rca.status !== "DRAFT" && rca.status !== "IN_ANALYSIS") throw new Error("Solo se pueden enviar RCA en borrador o análisis")
    return await RootCauseAnalysisRepository.update(rcaId, { status: "PENDING_REVIEW", analyzedAt: new Date() })
  }

  static async review(rcaId: string, data: ReviewRCAData, session: AuthenticatedSession): Promise<RootCauseAnalysisWithRelations | null> {
    await PermissionGuard.require(session, 'rca.review')
    const rca = await RootCauseAnalysisRepository.findById(rcaId)
    if (!rca) return null
    if (rca.status !== "PENDING_REVIEW") throw new Error("El RCA no está pendiente de revisión")
    return await RootCauseAnalysisRepository.update(rcaId, {
      status: data.approved ? "APPROVED" : "IN_ANALYSIS",
      reviewer: { connect: { id: session.user.id } },
      reviewedAt: new Date()
    })
  }

  static async approve(rcaId: string, data: ApproveRCAData, session: AuthenticatedSession): Promise<RootCauseAnalysisWithRelations | null> {
    await PermissionGuard.require(session, 'rca.approve')
    const rca = await RootCauseAnalysisRepository.findById(rcaId)
    if (!rca) return null
    if (rca.status !== "PENDING_REVIEW") throw new Error("El RCA debe estar pendiente de revisión")
    return await RootCauseAnalysisRepository.update(rcaId, {
      status: "APPROVED",
      reviewer: { connect: { id: session.user.id } },
      reviewedAt: new Date()
    })
  }
}

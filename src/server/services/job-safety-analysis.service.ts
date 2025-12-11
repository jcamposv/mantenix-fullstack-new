/**
 * Job Safety Analysis Service
 * Business logic for JSA management
 */

import { Prisma } from "@prisma/client"
import { JobSafetyAnalysisRepository } from "../repositories/job-safety-analysis.repository"
import { PermissionGuard } from "../helpers/permission-guard"
import { getCurrentCompanyId } from "@/lib/company-context"
import type { AuthenticatedSession } from "@/types/auth.types"
import type {
  CreateJobSafetyAnalysisData,
  UpdateJobSafetyAnalysisData,
  JobSafetyAnalysisFilters,
  JobSafetyAnalysisWithRelations,
  PaginatedJobSafetyAnalysesResponse,
  ReviewJSAData,
  ApproveJSAData,
  RejectJSAData
} from "@/types/job-safety-analysis.types"

export class JobSafetyAnalysisService {
  static async buildWhereClause(session: AuthenticatedSession, filters?: JobSafetyAnalysisFilters): Promise<Prisma.JobSafetyAnalysisWhereInput> {
    const companyId = await getCurrentCompanyId(session)
    if (!companyId) throw new Error("No se pudo determinar la empresa")

    const whereClause: Prisma.JobSafetyAnalysisWhereInput = {
      workOrder: { site: { clientCompany: { tenantCompanyId: companyId } } }
    }

    if (filters?.workOrderId) whereClause.workOrderId = filters.workOrderId
    if (filters?.status) whereClause.status = filters.status
    if (filters?.preparedBy) whereClause.preparedBy = filters.preparedBy
    if (filters?.reviewedBy) whereClause.reviewedBy = filters.reviewedBy
    if (filters?.approvedBy) whereClause.approvedBy = filters.approvedBy
    if (filters?.createdAtFrom || filters?.createdAtTo) {
      whereClause.createdAt = {}
      if (filters?.createdAtFrom) whereClause.createdAt.gte = filters.createdAtFrom
      if (filters?.createdAtTo) whereClause.createdAt.lte = filters.createdAtTo
    }

    return whereClause
  }

  static async getList(session: AuthenticatedSession, filters: JobSafetyAnalysisFilters, page: number, limit: number): Promise<PaginatedJobSafetyAnalysesResponse> {
    await PermissionGuard.require(session, 'safety.view_jsa')
    const whereClause = await this.buildWhereClause(session, filters)
    const { items, total } = await JobSafetyAnalysisRepository.findMany(whereClause, page, limit)
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  static async getById(id: string, session: AuthenticatedSession): Promise<JobSafetyAnalysisWithRelations | null> {
    await PermissionGuard.require(session, 'safety.view_jsa')
    return await JobSafetyAnalysisRepository.findById(id)
  }

  static async create(data: CreateJobSafetyAnalysisData, session: AuthenticatedSession): Promise<JobSafetyAnalysisWithRelations> {
    await PermissionGuard.require(session, 'safety.create_jsa')
    const createData: Prisma.JobSafetyAnalysisCreateInput = {
      workOrder: { connect: { id: data.workOrderId } },
      preparer: { connect: { id: session.user.id } },
      status: "DRAFT",
      jobSteps: data.jobSteps as unknown as Prisma.InputJsonValue
    }
    return await JobSafetyAnalysisRepository.create(createData)
  }

  static async update(id: string, data: UpdateJobSafetyAnalysisData, session: AuthenticatedSession): Promise<JobSafetyAnalysisWithRelations | null> {
    await PermissionGuard.require(session, 'safety.create_jsa')
    const existing = await JobSafetyAnalysisRepository.findById(id)
    if (!existing) return null
    const updateData: Prisma.JobSafetyAnalysisUpdateInput = {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.jobSteps !== undefined && { jobSteps: data.jobSteps as unknown as Prisma.InputJsonValue }),
      updatedAt: new Date()
    }
    return await JobSafetyAnalysisRepository.update(id, updateData)
  }

  static async delete(id: string, session: AuthenticatedSession): Promise<void> {
    await PermissionGuard.require(session, 'safety.create_jsa')
    const existing = await JobSafetyAnalysisRepository.findById(id)
    if (!existing) throw new Error("JSA no encontrado")
    await JobSafetyAnalysisRepository.hardDelete(id)
  }

  static async submitForReview(jsaId: string, session: AuthenticatedSession): Promise<JobSafetyAnalysisWithRelations | null> {
    await PermissionGuard.require(session, 'safety.create_jsa')
    const jsa = await JobSafetyAnalysisRepository.findById(jsaId)
    if (!jsa) return null
    if (jsa.status !== "DRAFT") throw new Error("Solo se pueden enviar JSA en estado borrador")
    return await JobSafetyAnalysisRepository.update(jsaId, { status: "PENDING_REVIEW", preparedAt: new Date() })
  }

  static async review(jsaId: string, data: ReviewJSAData, session: AuthenticatedSession): Promise<JobSafetyAnalysisWithRelations | null> {
    await PermissionGuard.require(session, 'safety.review_jsa')
    const jsa = await JobSafetyAnalysisRepository.findById(jsaId)
    if (!jsa) return null
    if (jsa.status !== "PENDING_REVIEW") throw new Error("El JSA no está pendiente de revisión")
    return await JobSafetyAnalysisRepository.update(jsaId, {
      status: data.approved ? "PENDING_APPROVAL" : "DRAFT",
      reviewer: { connect: { id: session.user.id } },
      reviewedAt: new Date()
    })
  }

  static async approve(jsaId: string, data: ApproveJSAData, session: AuthenticatedSession): Promise<JobSafetyAnalysisWithRelations | null> {
    await PermissionGuard.require(session, 'safety.approve_jsa')
    const jsa = await JobSafetyAnalysisRepository.findById(jsaId)
    if (!jsa) return null
    if (jsa.status !== "PENDING_APPROVAL") throw new Error("El JSA no está pendiente de aprobación")
    return await JobSafetyAnalysisRepository.update(jsaId, { status: "APPROVED", approver: { connect: { id: session.user.id } }, approvedAt: new Date() })
  }

  static async reject(jsaId: string, data: RejectJSAData, session: AuthenticatedSession): Promise<JobSafetyAnalysisWithRelations | null> {
    await PermissionGuard.require(session, 'safety.approve_jsa')
    const jsa = await JobSafetyAnalysisRepository.findById(jsaId)
    if (!jsa) return null
    return await JobSafetyAnalysisRepository.update(jsaId, { status: "REJECTED" })
  }
}

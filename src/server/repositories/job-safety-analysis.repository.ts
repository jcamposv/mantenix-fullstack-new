/**
 * Job Safety Analysis Repository
 * Data access layer for JSA records
 */

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { JobSafetyAnalysisWithRelations } from "@/types/job-safety-analysis.types"

export class JobSafetyAnalysisRepository {
  /**
   * Define include relations for queries
   */
  static getIncludeRelations(): Prisma.JobSafetyAnalysisInclude {
    return {
      workOrder: {
        select: {
          id: true,
          number: true,
          title: true,
          status: true
        }
      },
      preparer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      reviewer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      approver: {
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
  static async findById(id: string): Promise<JobSafetyAnalysisWithRelations | null> {
    return await prisma.jobSafetyAnalysis.findUnique({
      where: { id },
      include: this.getIncludeRelations()
    }) as unknown as JobSafetyAnalysisWithRelations | null
  }

  /**
   * Find first matching criteria
   */
  static async findFirst(
    whereClause: Prisma.JobSafetyAnalysisWhereInput
  ): Promise<JobSafetyAnalysisWithRelations | null> {
    return await prisma.jobSafetyAnalysis.findFirst({
      where: whereClause,
      include: this.getIncludeRelations()
    }) as unknown as JobSafetyAnalysisWithRelations | null
  }

  /**
   * Find many with pagination
   */
  static async findMany(
    whereClause: Prisma.JobSafetyAnalysisWhereInput,
    page: number,
    limit: number
  ): Promise<{ items: JobSafetyAnalysisWithRelations[]; total: number }> {
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      prisma.jobSafetyAnalysis.findMany({
        where: whereClause,
        include: this.getIncludeRelations(),
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.jobSafetyAnalysis.count({ where: whereClause })
    ])

    return {
      items: items as unknown as JobSafetyAnalysisWithRelations[],
      total
    }
  }

  /**
   * Create new record
   */
  static async create(
    data: Prisma.JobSafetyAnalysisCreateInput
  ): Promise<JobSafetyAnalysisWithRelations> {
    return await prisma.jobSafetyAnalysis.create({
      data,
      include: this.getIncludeRelations()
    }) as unknown as JobSafetyAnalysisWithRelations
  }

  /**
   * Update record
   */
  static async update(
    id: string,
    data: Prisma.JobSafetyAnalysisUpdateInput
  ): Promise<JobSafetyAnalysisWithRelations> {
    return await prisma.jobSafetyAnalysis.update({
      where: { id },
      data,
      include: this.getIncludeRelations()
    }) as unknown as JobSafetyAnalysisWithRelations
  }

  /**
   * Get JSA for a work order
   */
  static async getByWorkOrder(
    workOrderId: string
  ): Promise<JobSafetyAnalysisWithRelations | null> {
    return await prisma.jobSafetyAnalysis.findFirst({
      where: { workOrderId },
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'desc' }
    }) as unknown as JobSafetyAnalysisWithRelations | null
  }

  /**
   * Get JSAs pending review for a company
   */
  static async getPendingReview(
    companyId: string
  ): Promise<JobSafetyAnalysisWithRelations[]> {
    return await prisma.jobSafetyAnalysis.findMany({
      where: {
        workOrder: {
          companyId
        },
        status: 'PENDING_REVIEW'
      },
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'asc' }
    }) as unknown as JobSafetyAnalysisWithRelations[]
  }

  /**
   * Get JSAs pending approval for a company
   */
  static async getPendingApproval(
    companyId: string
  ): Promise<JobSafetyAnalysisWithRelations[]> {
    return await prisma.jobSafetyAnalysis.findMany({
      where: {
        workOrder: {
          companyId
        },
        status: 'PENDING_APPROVAL'
      },
      include: this.getIncludeRelations(),
      orderBy: { createdAt: 'asc' }
    }) as unknown as JobSafetyAnalysisWithRelations[]
  }

  /**
   * Hard delete (permanently remove)
   */
  static async hardDelete(id: string): Promise<void> {
    await prisma.jobSafetyAnalysis.delete({
      where: { id }
    })
  }
}

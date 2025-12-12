import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { CompanyGroupWithRelations, CompanyGroupWithDetails } from "@/types/company-group.types"

/**
 * Repository para el acceso a datos de grupos corporativos
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class CompanyGroupRepository {

  private static readonly includeBasicRelations = {
    companies: {
      select: {
        id: true,
        name: true,
        subdomain: true,
        logo: true
      }
    },
    _count: {
      select: {
        companies: true,
        users: true
      }
    }
  }

  private static readonly includeDetailedRelations = {
    companies: {
      select: {
        id: true,
        name: true,
        subdomain: true,
        logo: true,
        tier: true,
        isActive: true,
        createdAt: true
      }
    },
    users: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    },
    _count: {
      select: {
        companies: true,
        users: true
      }
    }
  }

  static async findById(id: string): Promise<CompanyGroupWithRelations | null> {
    return await prisma.companyGroup.findUnique({
      where: { id },
      include: CompanyGroupRepository.includeBasicRelations
    })
  }

  static async findByIdWithDetails(id: string): Promise<CompanyGroupWithDetails | null> {
    return await prisma.companyGroup.findUnique({
      where: { id },
      include: CompanyGroupRepository.includeDetailedRelations
    }) as CompanyGroupWithDetails | null
  }

  static async findFirst(whereClause: Prisma.CompanyGroupWhereInput): Promise<CompanyGroupWithRelations | null> {
    return await prisma.companyGroup.findFirst({
      where: whereClause,
      include: CompanyGroupRepository.includeBasicRelations
    })
  }

  static async findMany(
    whereClause: Prisma.CompanyGroupWhereInput,
    page: number,
    limit: number
  ): Promise<{ items: CompanyGroupWithRelations[], total: number }> {
    const offset = (page - 1) * limit

    const [companyGroups, total] = await Promise.all([
      prisma.companyGroup.findMany({
        where: whereClause,
        include: CompanyGroupRepository.includeBasicRelations,
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.companyGroup.count({ where: whereClause })
    ])

    return { items: companyGroups, total }
  }

  static async findAll(whereClause: Prisma.CompanyGroupWhereInput): Promise<CompanyGroupWithRelations[]> {
    return await prisma.companyGroup.findMany({
      where: whereClause,
      include: CompanyGroupRepository.includeBasicRelations,
      orderBy: { createdAt: 'desc' }
    })
  }

  static async create(data: Prisma.CompanyGroupCreateInput): Promise<CompanyGroupWithRelations> {
    return await prisma.companyGroup.create({
      data,
      include: CompanyGroupRepository.includeBasicRelations
    })
  }

  static async update(id: string, data: Prisma.CompanyGroupUpdateInput): Promise<CompanyGroupWithRelations> {
    return await prisma.companyGroup.update({
      where: { id },
      data,
      include: CompanyGroupRepository.includeBasicRelations
    })
  }

  static async delete(id: string): Promise<CompanyGroupWithRelations> {
    return await prisma.companyGroup.update({
      where: { id },
      data: {
        isActive: false
      },
      include: CompanyGroupRepository.includeBasicRelations
    })
  }

  /**
   * Add companies to a company group
   */
  static async addCompanies(groupId: string, companyIds: string[]): Promise<CompanyGroupWithRelations> {
    return await prisma.companyGroup.update({
      where: { id: groupId },
      data: {
        companies: {
          connect: companyIds.map(id => ({ id }))
        }
      },
      include: CompanyGroupRepository.includeBasicRelations
    })
  }

  /**
   * Remove companies from a company group
   */
  static async removeCompanies(groupId: string, companyIds: string[]): Promise<CompanyGroupWithRelations> {
    return await prisma.companyGroup.update({
      where: { id: groupId },
      data: {
        companies: {
          disconnect: companyIds.map(id => ({ id }))
        }
      },
      include: CompanyGroupRepository.includeBasicRelations
    })
  }

  /**
   * Get all companies in a group
   */
  static async getGroupCompanies(groupId: string) {
    const group = await prisma.companyGroup.findUnique({
      where: { id: groupId },
      select: {
        companies: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            name: true,
            subdomain: true,
            logo: true,
            tier: true
          }
        }
      }
    })
    return group?.companies || []
  }
}

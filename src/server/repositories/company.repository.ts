import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { CompanyWithRelations, CompanyBranding, CompanyBasicInfo } from "@/types/company.types"

/**
 * Repository para el acceso a datos de empresas
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class CompanyRepository {
  
  private static readonly includeRelations = {
    _count: {
      select: {
        users: true,
        clientCompanies: true
      }
    },
    subscription: {
      select: {
        id: true,
        planId: true,
        plan: {
          select: {
            id: true,
            name: true,
            tier: true
          }
        }
      }
    }
  }

  static async findById(id: string): Promise<CompanyWithRelations | null> {
    return await prisma.company.findUnique({
      where: { id },
      include: CompanyRepository.includeRelations
    })
  }

  static async findFirst(whereClause: Prisma.CompanyWhereInput): Promise<CompanyWithRelations | null> {
    return await prisma.company.findFirst({
      where: whereClause,
      include: CompanyRepository.includeRelations
    })
  }

  static async findMany(whereClause: Prisma.CompanyWhereInput, page: number, limit: number): Promise<{ items: CompanyWithRelations[], total: number }> {
    const offset = (page - 1) * limit

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where: whereClause,
        include: CompanyRepository.includeRelations,
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.company.count({ where: whereClause })
    ])

    return { items: companies, total }
  }

  static async findAll(whereClause: Prisma.CompanyWhereInput): Promise<CompanyWithRelations[]> {
    return await prisma.company.findMany({
      where: whereClause,
      include: CompanyRepository.includeRelations,
      orderBy: { createdAt: 'desc' }
    })
  }

  static async create(data: Prisma.CompanyCreateInput): Promise<CompanyWithRelations> {
    return await prisma.company.create({
      data,
      include: CompanyRepository.includeRelations
    })
  }

  static async update(id: string, data: Prisma.CompanyUpdateInput): Promise<CompanyWithRelations> {
    return await prisma.company.update({
      where: { id },
      data,
      include: CompanyRepository.includeRelations
    })
  }

  static async delete(id: string): Promise<CompanyWithRelations> {
    return await prisma.company.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date()
      },
      include: CompanyRepository.includeRelations
    })
  }

  static async findBySubdomain(subdomain: string): Promise<CompanyWithRelations | null> {
    return await prisma.company.findUnique({
      where: { subdomain },
      include: CompanyRepository.includeRelations
    })
  }

  static async findBrandingBySubdomain(subdomain: string): Promise<CompanyBranding | null> {
    return await prisma.company.findUnique({
      where: { 
        subdomain,
        isActive: true 
      },
      select: {
        name: true,
        logo: true,
        logoSmall: true,
        primaryColor: true,
        secondaryColor: true,
        backgroundColor: true,
        customFont: true
      }
    })
  }

  static async findBasicInfoById(id: string): Promise<CompanyBasicInfo | null> {
    return await prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        subdomain: true,
        logo: true,
        isActive: true
      }
    })
  }

  static async getCompanyGroupId(companyId: string): Promise<string | null> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { companyGroupId: true }
    })
    return company?.companyGroupId || null
  }
}
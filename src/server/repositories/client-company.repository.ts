import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { ClientCompanyWithRelations } from "@/types/client-company.types"

/**
 * Repository para el acceso a datos de empresas cliente
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class ClientCompanyRepository {
  
  private static readonly includeRelations = {
    tenantCompany: {
      select: {
        id: true,
        name: true,
        subdomain: true
      }
    },
    createdByUser: {
      select: {
        id: true,
        name: true,
        email: true
      }
    },
    _count: {
      select: {
        sites: true,
        externalUsers: true
      }
    }
  }

  static async findById(id: string): Promise<ClientCompanyWithRelations | null> {
    return await prisma.clientCompany.findUnique({
      where: { id },
      include: ClientCompanyRepository.includeRelations
    })
  }

  static async findFirst(whereClause: Prisma.ClientCompanyWhereInput): Promise<ClientCompanyWithRelations | null> {
    return await prisma.clientCompany.findFirst({
      where: whereClause,
      include: ClientCompanyRepository.includeRelations
    })
  }

  static async findMany(whereClause: Prisma.ClientCompanyWhereInput, page: number, limit: number): Promise<{ clientCompanies: ClientCompanyWithRelations[], total: number }> {
    const offset = (page - 1) * limit

    const [clientCompanies, total] = await Promise.all([
      prisma.clientCompany.findMany({
        where: whereClause,
        include: ClientCompanyRepository.includeRelations,
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.clientCompany.count({ where: whereClause })
    ])

    return { clientCompanies, total }
  }

  static async findAll(whereClause: Prisma.ClientCompanyWhereInput): Promise<ClientCompanyWithRelations[]> {
    return await prisma.clientCompany.findMany({
      where: whereClause,
      include: ClientCompanyRepository.includeRelations,
      orderBy: { createdAt: 'desc' }
    })
  }

  static async create(data: Prisma.ClientCompanyCreateInput): Promise<ClientCompanyWithRelations> {
    return await prisma.clientCompany.create({
      data,
      include: ClientCompanyRepository.includeRelations
    })
  }

  static async update(id: string, data: Prisma.ClientCompanyUpdateInput): Promise<ClientCompanyWithRelations> {
    return await prisma.clientCompany.update({
      where: { id },
      data,
      include: ClientCompanyRepository.includeRelations
    })
  }

  static async delete(id: string): Promise<ClientCompanyWithRelations> {
    return await prisma.clientCompany.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date()
      },
      include: ClientCompanyRepository.includeRelations
    })
  }

  static async findWithRelatedData(id: string) {
    return await prisma.clientCompany.findUnique({
      where: { id },
      include: {
        ...ClientCompanyRepository.includeRelations,
        sites: { 
          where: { isActive: true },
          select: { id: true, name: true, address: true }
        },
        externalUsers: { 
          select: { id: true, name: true, email: true }
        }
      }
    })
  }
}
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { SiteWithRelations } from "@/types/site.types"

/**
 * Repository para el acceso a datos de sedes
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class SiteRepository {
  
  private static readonly includeRelations = {
    clientCompany: {
      select: {
        id: true,
        name: true,
        tenantCompany: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        }
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
        siteUsers: true,
        userInvitations: true
      }
    }
  }

  static async findById(id: string): Promise<SiteWithRelations | null> {
    return await prisma.site.findUnique({
      where: { id },
      include: SiteRepository.includeRelations
    })
  }

  static async findFirst(whereClause: Prisma.SiteWhereInput): Promise<SiteWithRelations | null> {
    return await prisma.site.findFirst({
      where: whereClause,
      include: SiteRepository.includeRelations
    })
  }

  static async findMany(whereClause: Prisma.SiteWhereInput, page: number, limit: number): Promise<{ sites: SiteWithRelations[], total: number }> {
    const offset = (page - 1) * limit

    const [sites, total] = await Promise.all([
      prisma.site.findMany({
        where: whereClause,
        include: SiteRepository.includeRelations,
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.site.count({ where: whereClause })
    ])

    return { sites, total }
  }

  static async findAll(whereClause: Prisma.SiteWhereInput): Promise<SiteWithRelations[]> {
    return await prisma.site.findMany({
      where: whereClause,
      include: SiteRepository.includeRelations,
      orderBy: { createdAt: 'desc' }
    })
  }

  static async create(data: Prisma.SiteCreateInput): Promise<SiteWithRelations> {
    return await prisma.site.create({
      data,
      include: SiteRepository.includeRelations
    })
  }

  static async update(id: string, data: Prisma.SiteUpdateInput): Promise<SiteWithRelations> {
    return await prisma.site.update({
      where: { id },
      data,
      include: SiteRepository.includeRelations
    })
  }

  static async delete(id: string): Promise<SiteWithRelations> {
    return await prisma.site.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date()
      },
      include: SiteRepository.includeRelations
    })
  }

  static async findWithRelatedData(id: string): Promise<SiteWithRelations | null> {
    return await prisma.site.findUnique({
      where: { id },
      include: {
        ...SiteRepository.includeRelations,
        siteUsers: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                key: true
              }
            }
          }
        }
      }
    }) as unknown as SiteWithRelations | null
  }

  static async countPendingInvitations(siteId: string): Promise<number> {
    return await prisma.userInvitation.count({
      where: {
        siteId,
        used: false,
        expiresAt: { gt: new Date() }
      }
    })
  }
}
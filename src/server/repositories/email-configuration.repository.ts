import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

/**
 * Repository para el acceso a datos de configuraciones de email
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class EmailConfigurationRepository {

  private static readonly includeRelations = {
    company: {
      select: {
        id: true,
        name: true,
        subdomain: true
      }
    },
    emailTemplates: {
      where: {
        isActive: true,
        deletedAt: null
      },
      select: {
        id: true,
        emailConfigurationId: true,
        type: true,
        name: true,
        subject: true,
        templateId: true,
        isActive: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        type: 'asc' as const
      }
    },
    _count: {
      select: {
        emailTemplates: true
      }
    }
  } satisfies Prisma.EmailConfigurationInclude

  static async findById(id: string) {
    return await prisma.emailConfiguration.findUnique({
      where: { id },
      include: EmailConfigurationRepository.includeRelations
    })
  }

  static async findByCompanyId(companyId: string) {
    return await prisma.emailConfiguration.findUnique({
      where: { companyId },
      include: EmailConfigurationRepository.includeRelations
    })
  }

  static async findFirst(whereClause: Prisma.EmailConfigurationWhereInput) {
    return await prisma.emailConfiguration.findFirst({
      where: whereClause,
      include: EmailConfigurationRepository.includeRelations
    })
  }

  static async findMany(
    whereClause: Prisma.EmailConfigurationWhereInput,
    page: number,
    limit: number
  ) {
    const offset = (page - 1) * limit

    const [configurations, total] = await Promise.all([
      prisma.emailConfiguration.findMany({
        where: whereClause,
        include: EmailConfigurationRepository.includeRelations,
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.emailConfiguration.count({ where: whereClause })
    ])

    return { items: configurations, total }
  }

  static async create(data: Prisma.EmailConfigurationCreateInput) {
    return await prisma.emailConfiguration.create({
      data,
      include: EmailConfigurationRepository.includeRelations
    })
  }

  static async update(id: string, data: Prisma.EmailConfigurationUpdateInput) {
    return await prisma.emailConfiguration.update({
      where: { id },
      data,
      include: EmailConfigurationRepository.includeRelations
    })
  }

  static async delete(id: string) {
    return await prisma.emailConfiguration.delete({
      where: { id },
      include: EmailConfigurationRepository.includeRelations
    })
  }

  /**
   * Soft delete de una configuración de email
   */
  static async softDelete(id: string) {
    return await prisma.emailConfiguration.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date()
      },
      include: EmailConfigurationRepository.includeRelations
    })
  }

  /**
   * Obtiene todas las configuraciones activas
   */
  static async findAllActive() {
    return await prisma.emailConfiguration.findMany({
      where: {
        isActive: true,
        deletedAt: null
      },
      include: EmailConfigurationRepository.includeRelations,
      orderBy: { createdAt: 'desc' }
    })
  }
}

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { EmailTemplateType } from "@/types/email.types"

/**
 * Repository para el acceso a datos de templates de email
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class EmailTemplateRepository {

  private static readonly selectFields = {
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
  } satisfies Prisma.EmailTemplateSelect

  private static readonly includeRelations = {
    emailConfiguration: {
      select: {
        id: true,
        companyId: true,
        fromEmail: true,
        fromName: true,
        replyToEmail: true,
        company: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        }
      }
    }
  }

  static async findById(id: string) {
    return await prisma.emailTemplate.findUnique({
      where: { id },
      select: {
        ...EmailTemplateRepository.selectFields,
        emailConfiguration: EmailTemplateRepository.includeRelations.emailConfiguration
      }
    })
  }

  static async findByConfigurationAndType(
    emailConfigurationId: string,
    type: EmailTemplateType
  ) {
    return await prisma.emailTemplate.findUnique({
      where: {
        emailConfigurationId_type: {
          emailConfigurationId,
          type
        }
      },
      select: {
        ...EmailTemplateRepository.selectFields,
        emailConfiguration: EmailTemplateRepository.includeRelations.emailConfiguration
      }
    })
  }

  static async findFirst(whereClause: Prisma.EmailTemplateWhereInput) {
    return await prisma.emailTemplate.findFirst({
      where: whereClause,
      select: {
        ...EmailTemplateRepository.selectFields,
        emailConfiguration: EmailTemplateRepository.includeRelations.emailConfiguration
      }
    })
  }

  static async findMany(
    whereClause: Prisma.EmailTemplateWhereInput,
    page: number,
    limit: number
  ) {
    const offset = (page - 1) * limit

    const [templates, total] = await Promise.all([
      prisma.emailTemplate.findMany({
        where: whereClause,
        select: {
          ...EmailTemplateRepository.selectFields,
          emailConfiguration: EmailTemplateRepository.includeRelations.emailConfiguration
        },
        orderBy: [
          { type: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.emailTemplate.count({ where: whereClause })
    ])

    return { items: templates, total }
  }

  static async findByEmailConfigurationId(emailConfigurationId: string) {
    return await prisma.emailTemplate.findMany({
      where: {
        emailConfigurationId,
        isActive: true,
        deletedAt: null
      },
      select: {
        ...EmailTemplateRepository.selectFields,
        emailConfiguration: EmailTemplateRepository.includeRelations.emailConfiguration
      },
      orderBy: { type: 'asc' }
    })
  }

  static async create(data: Prisma.EmailTemplateCreateInput) {
    return await prisma.emailTemplate.create({
      data,
      select: {
        ...EmailTemplateRepository.selectFields,
        emailConfiguration: EmailTemplateRepository.includeRelations.emailConfiguration
      }
    })
  }

  static async update(id: string, data: Prisma.EmailTemplateUpdateInput) {
    return await prisma.emailTemplate.update({
      where: { id },
      data,
      select: {
        ...EmailTemplateRepository.selectFields,
        emailConfiguration: EmailTemplateRepository.includeRelations.emailConfiguration
      }
    })
  }

  static async delete(id: string) {
    return await prisma.emailTemplate.delete({
      where: { id },
      select: {
        ...EmailTemplateRepository.selectFields,
        emailConfiguration: EmailTemplateRepository.includeRelations.emailConfiguration
      }
    })
  }

  /**
   * Soft delete de un template de email
   */
  static async softDelete(id: string) {
    return await prisma.emailTemplate.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date()
      },
      select: {
        ...EmailTemplateRepository.selectFields,
        emailConfiguration: EmailTemplateRepository.includeRelations.emailConfiguration
      }
    })
  }

  /**
   * Obtiene todos los templates activos
   */
  static async findAllActive() {
    return await prisma.emailTemplate.findMany({
      where: {
        isActive: true,
        deletedAt: null
      },
      select: {
        ...EmailTemplateRepository.selectFields,
        emailConfiguration: EmailTemplateRepository.includeRelations.emailConfiguration
      },
      orderBy: [
        { type: 'asc' },
        { createdAt: 'desc' }
      ]
    })
  }
}

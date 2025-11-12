import { Prisma, FeatureModule } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { CompanyFeatureWithRelations } from "@/types/feature.types"

/**
 * Repository para el acceso a datos de features de empresas
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class FeatureRepository {

  private static readonly includeRelations = {
    company: {
      select: {
        id: true,
        name: true
      }
    },
    enabledByUser: {
      select: {
        id: true,
        name: true
      }
    }
  }

  static async findById(id: string): Promise<CompanyFeatureWithRelations | null> {
    return await prisma.companyFeature.findUnique({
      where: { id },
      include: FeatureRepository.includeRelations
    })
  }

  static async findByCompanyAndModule(
    companyId: string,
    module: FeatureModule
  ): Promise<CompanyFeatureWithRelations | null> {
    return await prisma.companyFeature.findUnique({
      where: {
        companyId_module: {
          companyId,
          module
        }
      },
      include: FeatureRepository.includeRelations
    })
  }

  static async findAllByCompany(companyId: string): Promise<CompanyFeatureWithRelations[]> {
    return await prisma.companyFeature.findMany({
      where: { companyId },
      include: FeatureRepository.includeRelations,
      orderBy: { module: 'asc' }
    })
  }

  static async findEnabledByCompany(companyId: string): Promise<CompanyFeatureWithRelations[]> {
    return await prisma.companyFeature.findMany({
      where: {
        companyId,
        isEnabled: true
      },
      include: FeatureRepository.includeRelations
    })
  }

  static async findMany(
    whereClause: Prisma.CompanyFeatureWhereInput,
    page: number,
    limit: number
  ): Promise<{ features: CompanyFeatureWithRelations[], total: number }> {
    const offset = (page - 1) * limit

    const [features, total] = await Promise.all([
      prisma.companyFeature.findMany({
        where: whereClause,
        include: FeatureRepository.includeRelations,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.companyFeature.count({ where: whereClause })
    ])

    return { features, total }
  }

  static async create(data: Prisma.CompanyFeatureCreateInput): Promise<CompanyFeatureWithRelations> {
    return await prisma.companyFeature.create({
      data,
      include: FeatureRepository.includeRelations
    })
  }

  static async update(
    id: string,
    data: Prisma.CompanyFeatureUpdateInput
  ): Promise<CompanyFeatureWithRelations> {
    return await prisma.companyFeature.update({
      where: { id },
      data,
      include: FeatureRepository.includeRelations
    })
  }

  static async updateByCompanyAndModule(
    companyId: string,
    module: FeatureModule,
    data: Prisma.CompanyFeatureUpdateInput
  ): Promise<CompanyFeatureWithRelations> {
    return await prisma.companyFeature.update({
      where: {
        companyId_module: {
          companyId,
          module
        }
      },
      data,
      include: FeatureRepository.includeRelations
    })
  }

  static async upsert(
    companyId: string,
    module: FeatureModule,
    createData: Prisma.CompanyFeatureCreateInput,
    updateData: Prisma.CompanyFeatureUpdateInput
  ): Promise<CompanyFeatureWithRelations> {
    return await prisma.companyFeature.upsert({
      where: {
        companyId_module: {
          companyId,
          module
        }
      },
      create: createData,
      update: updateData,
      include: FeatureRepository.includeRelations
    })
  }

  static async delete(id: string): Promise<CompanyFeatureWithRelations> {
    return await prisma.companyFeature.delete({
      where: { id },
      include: FeatureRepository.includeRelations
    })
  }

  static async isModuleEnabled(companyId: string, module: FeatureModule): Promise<boolean> {
    const feature = await prisma.companyFeature.findUnique({
      where: {
        companyId_module: {
          companyId,
          module
        }
      },
      select: { isEnabled: true }
    })

    return feature?.isEnabled ?? false
  }
}

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { CompanyLocationWithRelations } from "@/types/attendance.types"

/**
 * Repository para el acceso a datos de ubicaciones de empresas
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class LocationRepository {

  private static readonly includeRelations = {
    company: {
      select: {
        id: true,
        name: true
      }
    },
    _count: {
      select: {
        attendanceRecords: true
      }
    }
  }

  static async findById(id: string): Promise<CompanyLocationWithRelations | null> {
    return await prisma.companyLocation.findUnique({
      where: { id },
      include: LocationRepository.includeRelations
    })
  }

  static async findByCompany(companyId: string): Promise<CompanyLocationWithRelations[]> {
    return await prisma.companyLocation.findMany({
      where: { companyId },
      include: LocationRepository.includeRelations,
      orderBy: { name: 'asc' }
    })
  }

  static async findActiveByCompany(companyId: string): Promise<CompanyLocationWithRelations[]> {
    return await prisma.companyLocation.findMany({
      where: {
        companyId,
        isActive: true
      },
      include: LocationRepository.includeRelations,
      orderBy: { name: 'asc' }
    })
  }

  static async findMany(
    whereClause: Prisma.CompanyLocationWhereInput,
    page: number,
    limit: number
  ): Promise<{ items: CompanyLocationWithRelations[], total: number }> {
    const offset = (page - 1) * limit

    const [locations, total] = await Promise.all([
      prisma.companyLocation.findMany({
        where: whereClause,
        include: LocationRepository.includeRelations,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.companyLocation.count({ where: whereClause })
    ])

    return { items: locations, total }
  }

  static async create(data: Prisma.CompanyLocationCreateInput): Promise<CompanyLocationWithRelations> {
    return await prisma.companyLocation.create({
      data,
      include: LocationRepository.includeRelations
    })
  }

  static async update(
    id: string,
    data: Prisma.CompanyLocationUpdateInput
  ): Promise<CompanyLocationWithRelations> {
    return await prisma.companyLocation.update({
      where: { id },
      data,
      include: LocationRepository.includeRelations
    })
  }

  static async delete(id: string): Promise<CompanyLocationWithRelations> {
    return await prisma.companyLocation.update({
      where: { id },
      data: {
        isActive: false
      },
      include: LocationRepository.includeRelations
    })
  }
}

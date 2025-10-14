import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { UserWithRelations } from "@/types/user.types"

/**
 * Repository para el acceso a datos de usuarios
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class UserRepository {
  
  private static readonly includeRelations = {
    company: {
      select: {
        id: true,
        name: true
      }
    },
    clientCompany: {
      select: {
        id: true,
        name: true
      }
    },
    site: {
      select: {
        id: true,
        name: true,
        address: true
      }
    },
    _count: {
      select: {
        alertsReported: true,
        alertsAssigned: true
      }
    }
  }
  static async findById(id: string): Promise<UserWithRelations | null> {
    return await prisma.user.findUnique({
      where: { id },
      include: UserRepository.includeRelations
    })
  }

  static async findFirst(whereClause: Prisma.UserWhereInput): Promise<UserWithRelations | null> {
    return await prisma.user.findFirst({
      where: whereClause,
      include: UserRepository.includeRelations
    })
  }

  static async findMany(whereClause: Prisma.UserWhereInput, page: number, limit: number): Promise<{ users: UserWithRelations[], total: number }> {
    const offset = (page - 1) * limit

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: UserRepository.includeRelations,
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ])

    return { users, total }
  }

  static async create(data: Prisma.UserCreateInput): Promise<UserWithRelations> {
    return await prisma.user.create({
      data,
      include: UserRepository.includeRelations
    })
  }

  static async update(id: string, data: Prisma.UserUpdateInput): Promise<UserWithRelations> {
    return await prisma.user.update({
      where: { id },
      data,
      include: UserRepository.includeRelations
    })
  }

  static async delete(id: string): Promise<UserWithRelations> {
    return await prisma.user.delete({
      where: { id },
      include: UserRepository.includeRelations
    })
  }

  static async findByEmail(email: string): Promise<UserWithRelations | null> {
    return await prisma.user.findUnique({
      where: { email },
      include: UserRepository.includeRelations
    })
  }

  /**
   * Obtiene todos los usuarios con relaciones (para super admin)
   */
  static async findAllWithRelations(): Promise<UserWithRelations[]> {
    return await prisma.user.findMany({
      include: UserRepository.includeRelations,
      orderBy: { createdAt: 'desc' }
    })
  }
}
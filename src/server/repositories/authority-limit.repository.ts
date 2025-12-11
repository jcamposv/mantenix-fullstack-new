/**
 * Authority Limit Repository
 * Data access layer for authority limits
 */

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { AuthorityLimitWithRelations } from "@/types/authority-limit.types"

export class AuthorityLimitRepository {
  /**
   * Define include relations for queries
   */
  static getIncludeRelations(): Prisma.AuthorityLimitInclude {
    return {
      company: {
        select: {
          id: true,
          name: true,
          subdomain: true
        }
      }
    }
  }

  /**
   * Find by ID with relations
   */
  static async findById(id: string): Promise<AuthorityLimitWithRelations | null> {
    return await prisma.authorityLimit.findUnique({
      where: { id },
      include: this.getIncludeRelations()
    }) as unknown as AuthorityLimitWithRelations | null
  }

  /**
   * Find first matching criteria
   */
  static async findFirst(
    whereClause: Prisma.AuthorityLimitWhereInput
  ): Promise<AuthorityLimitWithRelations | null> {
    return await prisma.authorityLimit.findFirst({
      where: whereClause,
      include: this.getIncludeRelations()
    }) as unknown as AuthorityLimitWithRelations | null
  }

  /**
   * Find many with pagination
   */
  static async findMany(
    whereClause: Prisma.AuthorityLimitWhereInput,
    page: number,
    limit: number
  ): Promise<{ items: AuthorityLimitWithRelations[]; total: number }> {
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      prisma.authorityLimit.findMany({
        where: whereClause,
        include: this.getIncludeRelations(),
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.authorityLimit.count({ where: whereClause })
    ])

    return {
      items: items as unknown as AuthorityLimitWithRelations[],
      total
    }
  }

  /**
   * Create new record
   */
  static async create(
    data: Prisma.AuthorityLimitCreateInput
  ): Promise<AuthorityLimitWithRelations> {
    return await prisma.authorityLimit.create({
      data,
      include: this.getIncludeRelations()
    }) as unknown as AuthorityLimitWithRelations
  }

  /**
   * Update record
   */
  static async update(
    id: string,
    data: Prisma.AuthorityLimitUpdateInput
  ): Promise<AuthorityLimitWithRelations> {
    return await prisma.authorityLimit.update({
      where: { id },
      data,
      include: this.getIncludeRelations()
    }) as unknown as AuthorityLimitWithRelations
  }

  /**
   * Soft delete (set isActive to false)
   */
  static async softDelete(id: string): Promise<AuthorityLimitWithRelations> {
    return await prisma.authorityLimit.update({
      where: { id },
      data: { isActive: false },
      include: this.getIncludeRelations()
    }) as unknown as AuthorityLimitWithRelations
  }

  /**
   * Hard delete (permanently remove)
   */
  static async hardDelete(id: string): Promise<void> {
    await prisma.authorityLimit.delete({
      where: { id }
    })
  }

  /**
   * Check if roleKey exists in company
   */
  static async checkExists(
    roleKey: string,
    companyId: string,
    excludeId?: string
  ): Promise<boolean> {
    const whereClause: Prisma.AuthorityLimitWhereInput = {
      roleKey,
      companyId,
      isActive: true
    }

    if (excludeId) {
      whereClause.id = { not: excludeId }
    }

    const count = await prisma.authorityLimit.count({ where: whereClause })
    return count > 0
  }

  /**
   * Get authority limit by role and company
   */
  static async getByRoleAndCompany(
    roleKey: string,
    companyId: string
  ): Promise<AuthorityLimitWithRelations | null> {
    return await prisma.authorityLimit.findFirst({
      where: {
        roleKey,
        companyId,
        isActive: true
      },
      include: this.getIncludeRelations()
    }) as unknown as AuthorityLimitWithRelations | null
  }

  /**
   * Get all active limits for a company
   */
  static async getActiveByCompany(
    companyId: string
  ): Promise<AuthorityLimitWithRelations[]> {
    return await prisma.authorityLimit.findMany({
      where: {
        companyId,
        isActive: true
      },
      include: this.getIncludeRelations(),
      orderBy: { maxDirectAuthorization: 'asc' }
    }) as unknown as AuthorityLimitWithRelations[]
  }
}

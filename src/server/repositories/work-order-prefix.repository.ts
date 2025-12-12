import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type {
  CreateWorkOrderPrefixData,
  UpdateWorkOrderPrefixData,
  WorkOrderPrefixFilters,
} from "@/types/work-order-prefix.types"

export class WorkOrderPrefixRepository {
  /**
   * Find many work order prefixes with optional filters and pagination
   */
  static async findMany(
    companyId: string,
    filters?: WorkOrderPrefixFilters,
    page = 1,
    limit = 10
  ) {
    const where: Prisma.WorkOrderPrefixWhereInput = {
      companyId,
      isActive: filters?.isActive ?? true,
    }

    // Search filter
    if (filters?.search) {
      where.OR = [
        { code: { contains: filters.search, mode: "insensitive" } },
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    // Execute count and find operations in parallel
    const [total, prefixes] = await Promise.all([
      prisma.workOrderPrefix.count({ where }),
      prisma.workOrderPrefix.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              subdomain: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: {
              workOrders: true,
            },
          },
        },
      }),
    ])

    return {
      items: prefixes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  /**
   * Find prefix by ID with relations
   */
  static async findById(
    id: string,
    companyId: string
  ) {
    return await prisma.workOrderPrefix.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            workOrders: true,
          },
        },
      },
    })
  }

  /**
   * Find prefix by code
   */
  static async findByCode(
    code: string,
    companyId: string
  ) {
    return await prisma.workOrderPrefix.findUnique({
      where: {
        companyId_code: {
          companyId,
          code: code.toUpperCase(),
        },
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            workOrders: true,
          },
        },
      },
    })
  }

  /**
   * Check if a code already exists for the company
   */
  static async codeExists(
    code: string,
    companyId: string,
    excludeId?: string
  ): Promise<boolean> {
    const where: Prisma.WorkOrderPrefixWhereInput = {
      companyId,
      code: code.toUpperCase(),
      isActive: true,
    }

    if (excludeId) {
      where.id = { not: excludeId }
    }

    const count = await prisma.workOrderPrefix.count({ where })
    return count > 0
  }

  /**
   * Create a new work order prefix
   */
  static async create(
    data: CreateWorkOrderPrefixData,
    companyId: string,
    createdBy: string
  ) {
    return await prisma.workOrderPrefix.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description || null,
        companyId,
        createdBy,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            workOrders: true,
          },
        },
      },
    })
  }

  /**
   * Update a work order prefix
   */
  static async update(
    id: string,
    data: UpdateWorkOrderPrefixData,
    companyId: string
  ) {
    const updateData: Prisma.WorkOrderPrefixUpdateInput = {}

    if (data.code !== undefined) {
      updateData.code = data.code.toUpperCase()
    }
    if (data.name !== undefined) {
      updateData.name = data.name
    }
    if (data.description !== undefined) {
      updateData.description = data.description || null
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive
    }

    return await prisma.workOrderPrefix.update({
      where: {
        id,
        companyId,
      },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            workOrders: true,
          },
        },
      },
    })
  }

  /**
   * Soft delete a work order prefix
   */
  static async softDelete(id: string, companyId: string): Promise<void> {
    await prisma.workOrderPrefix.update({
      where: {
        id,
        companyId,
      },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    })
  }

  /**
   * Hard delete a work order prefix (only if no work orders are associated)
   */
  static async hardDelete(id: string, companyId: string): Promise<void> {
    // Check if there are work orders associated with this prefix
    const count = await prisma.workOrder.count({
      where: {
        prefixId: id,
        companyId,
      },
    })

    if (count > 0) {
      throw new Error(
        `Cannot delete prefix. There are ${count} work order(s) associated with this prefix.`
      )
    }

    await prisma.workOrderPrefix.delete({
      where: {
        id,
        companyId,
      },
    })
  }

  /**
   * Get all active prefixes for a company (for dropdowns)
   */
  static async findAllActive(companyId: string) {
    const prefixes = await prisma.workOrderPrefix.findMany({
      where: {
        companyId,
        isActive: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
      },
      orderBy: {
        code: "asc",
      },
    })

    return prefixes
  }
}

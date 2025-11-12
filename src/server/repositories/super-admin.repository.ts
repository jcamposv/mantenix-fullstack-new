import { prisma } from "@/lib/prisma"

export class SuperAdminRepository {
  // Company metrics
  static async getTotalCompanies(): Promise<number> {
    return await prisma.company.count()
  }

  static async getActiveCompanies(): Promise<number> {
    return await prisma.company.count({ where: { isActive: true } })
  }

  static async getInactiveCompanies(): Promise<number> {
    return await prisma.company.count({ where: { isActive: false } })
  }

  static async getCompaniesCreatedAfter(date: Date): Promise<number> {
    return await prisma.company.count({
      where: {
        createdAt: {
          gte: date
        }
      }
    })
  }

  // User metrics
  static async getTotalUsers(): Promise<number> {
    return await prisma.user.count()
  }

  static async getActiveUsers(): Promise<number> {
    // Users that are not locked are considered active
    return await prisma.user.count({ where: { isLocked: false } })
  }

  static async getInactiveUsers(): Promise<number> {
    // Locked users are considered inactive
    return await prisma.user.count({ where: { isLocked: true } })
  }

  static async getUsersByRole(): Promise<Array<{ role: string; _count: { role: number } }>> {
    const roles = await prisma.user.findMany({
      distinct: ['role'],
      select: { role: true },
      orderBy: { role: 'asc' }
    })

    const results = await Promise.all(
      roles.map(async ({ role }) => {
        const count = await prisma.user.count({ where: { role } })
        return { role, _count: { role: count } }
      })
    )

    return results
  }

  static async getUsersCreatedAfter(date: Date): Promise<number> {
    return await prisma.user.count({
      where: {
        createdAt: {
          gte: date
        }
      }
    })
  }

  // Work order metrics
  static async getTotalWorkOrders(): Promise<number> {
    return await prisma.workOrder.count()
  }

  static async getActiveWorkOrders(): Promise<number> {
    return await prisma.workOrder.count({
      where: {
        status: {
          notIn: ["COMPLETED", "CANCELLED"]
        }
      }
    })
  }

  // Alert metrics
  static async getTotalAlerts(): Promise<number> {
    return await prisma.alert.count()
  }

  static async getCriticalAlerts(): Promise<number> {
    return await prisma.alert.count({
      where: {
        priority: "CRITICAL",
        status: "OPEN"
      }
    })
  }

  // Asset metrics
  static async getTotalAssets(): Promise<number> {
    return await prisma.asset.count()
  }

  // Inventory metrics
  static async getTotalInventoryItems(): Promise<number> {
    return await prisma.inventoryItem.count()
  }

  // Company group metrics
  static async getTotalCompanyGroups(): Promise<number> {
    return await prisma.companyGroup.count()
  }

  static async getActiveCompanyGroups(): Promise<number> {
    return await prisma.companyGroup.count({
      where: { isActive: true }
    })
  }
}

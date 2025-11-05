import { SuperAdminRepository } from "@/server/repositories/super-admin.repository"
import type { SaaSMetrics, CompanyMetrics, UserMetrics, SystemMetrics } from "@/schemas/super-admin"
import type { AuthenticatedSession } from "@/types/auth.types"

export class SuperAdminService {
  static async getMetrics(session: AuthenticatedSession): Promise<SaaSMetrics> {
    // Verificar que el usuario es SUPER_ADMIN
    if (session.user.role !== "SUPER_ADMIN") {
      throw new Error("No autorizado")
    }

    // Obtener métricas de empresas
    const companyMetrics = await this.getCompanyMetrics()

    // Obtener métricas de usuarios
    const userMetrics = await this.getUserMetrics()

    // Obtener métricas del sistema
    const systemMetrics = await this.getSystemMetrics()

    return {
      companies: companyMetrics,
      users: userMetrics,
      system: systemMetrics
    }
  }

  private static async getCompanyMetrics(): Promise<CompanyMetrics> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [total, active, inactive, companiesLastMonth] = await Promise.all([
      SuperAdminRepository.getTotalCompanies(),
      SuperAdminRepository.getActiveCompanies(),
      SuperAdminRepository.getInactiveCompanies(),
      SuperAdminRepository.getCompaniesCreatedAfter(thirtyDaysAgo)
    ])

    const growthPercentage = total > 0
      ? parseFloat(((companiesLastMonth / total) * 100).toFixed(1))
      : 0

    return {
      total,
      active,
      inactive,
      growth: {
        month: companiesLastMonth,
        percentage: growthPercentage
      }
    }
  }

  private static async getUserMetrics(): Promise<UserMetrics> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Active = not locked, Inactive = locked
    const [total, active, inactive, usersByRoleArray, usersLastMonth] = await Promise.all([
      SuperAdminRepository.getTotalUsers(),
      SuperAdminRepository.getActiveUsers(),
      SuperAdminRepository.getInactiveUsers(),
      SuperAdminRepository.getUsersByRole(),
      SuperAdminRepository.getUsersCreatedAfter(thirtyDaysAgo)
    ])

    const byRole = usersByRoleArray.reduce((acc, item) => {
      acc[item.role] = item._count.role
      return acc
    }, {} as Record<string, number>)

    const growthPercentage = total > 0
      ? parseFloat(((usersLastMonth / total) * 100).toFixed(1))
      : 0

    return {
      total,
      active,
      inactive,
      byRole,
      growth: {
        month: usersLastMonth,
        percentage: growthPercentage
      }
    }
  }

  private static async getSystemMetrics(): Promise<SystemMetrics> {
    const [
      totalWorkOrders,
      activeWorkOrders,
      totalAlerts,
      criticalAlerts,
      totalAssets,
      totalInventoryItems,
      totalCompanyGroups,
      activeCompanyGroups
    ] = await Promise.all([
      SuperAdminRepository.getTotalWorkOrders(),
      SuperAdminRepository.getActiveWorkOrders(),
      SuperAdminRepository.getTotalAlerts(),
      SuperAdminRepository.getCriticalAlerts(),
      SuperAdminRepository.getTotalAssets(),
      SuperAdminRepository.getTotalInventoryItems(),
      SuperAdminRepository.getTotalCompanyGroups(),
      SuperAdminRepository.getActiveCompanyGroups()
    ])

    return {
      workOrders: {
        total: totalWorkOrders,
        active: activeWorkOrders
      },
      alerts: {
        total: totalAlerts,
        critical: criticalAlerts
      },
      assets: {
        total: totalAssets
      },
      inventory: {
        total: totalInventoryItems
      },
      companyGroups: {
        total: totalCompanyGroups,
        active: activeCompanyGroups
      }
    }
  }
}

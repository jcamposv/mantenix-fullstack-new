import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { AssetStatusHistoryRepository } from "../repositories/asset-status-history.repository"
import { AuthService } from "./auth.service"
import type { AuthenticatedSession } from "@/types/auth.types"
import type { ChangeAssetStatusData, AssetStatusHistoryFilters } from "@/schemas/asset-status"

/**
 * Service for Asset Status management
 * Handles business logic for asset status changes and history tracking
 */
export class AssetStatusService {

  /**
   * Change asset status
   * Closes current status and creates new status record
   * Updates Asset.status field
   *
   * Authorized roles: OPERARIO, TECNICO, SUPERVISOR, JEFE_MANTENIMIENTO, admins
   */
  static async changeAssetStatus(
    data: ChangeAssetStatusData,
    session: AuthenticatedSession
  ) {
    // Verify permissions
    if (!AuthService.canUserPerformAction(session.user.role, 'change_asset_status')) {
      throw new Error("No tienes permisos para cambiar el estado de activos")
    }

    // Verify asset exists and user has access
    const asset = await prisma.asset.findUnique({
      where: { id: data.assetId },
      include: {
        site: {
          include: {
            clientCompany: {
              select: {
                id: true,
                tenantCompanyId: true
              }
            }
          }
        }
      }
    })

    if (!asset) {
      throw new Error("Activo no encontrado")
    }

    // Validate access by role
    await this.validateAssetAccess(asset, session)

    // Validate WorkOrder if provided
    if (data.workOrderId) {
      const workOrder = await prisma.workOrder.findUnique({
        where: { id: data.workOrderId }
      })

      if (!workOrder) {
        throw new Error("Orden de trabajo no encontrada")
      }

      // Verify work order is for this asset
      if (workOrder.assetId !== data.assetId) {
        throw new Error("La orden de trabajo no corresponde a este activo")
      }
    }

    // Check if status is actually changing
    if (asset.status === data.status) {
      throw new Error("El activo ya tiene este estado")
    }

    // Use transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      // Close current active status
      const currentStatus = await AssetStatusHistoryRepository.getCurrentStatus(data.assetId)

      if (currentStatus) {
        await tx.assetStatusHistory.update({
          where: { id: currentStatus.id },
          data: { endedAt: new Date() }
        })
      }

      // Create new status record
      const newStatusRecord = await tx.assetStatusHistory.create({
        data: {
          assetId: data.assetId,
          status: data.status,
          startedAt: new Date(),
          reason: data.reason,
          notes: data.notes,
          changedBy: session.user.id,
          workOrderId: data.workOrderId
        },
        include: AssetStatusHistoryRepository['getIncludeRelations']()
      })

      // Update asset status field
      const updatedAsset = await tx.asset.update({
        where: { id: data.assetId },
        data: { status: data.status },
        include: {
          site: true
        }
      })

      return {
        statusRecord: newStatusRecord,
        asset: updatedAsset
      }
    })
  }

  /**
   * Get asset status history with pagination
   */
  static async getAssetStatusHistory(
    filters: AssetStatusHistoryFilters,
    session: AuthenticatedSession
  ) {
    // Verify permissions
    if (!AuthService.canUserPerformAction(session.user.role, 'view_asset_status_history')) {
      throw new Error("No tienes permisos para ver el historial de estados")
    }

    // Build where clause
    const whereClause: Prisma.AssetStatusHistoryWhereInput = {}

    if (filters.assetId) {
      // Verify user has access to this asset
      const asset = await prisma.asset.findUnique({
        where: { id: filters.assetId },
        include: {
          site: {
            include: {
              clientCompany: {
                select: {
                  id: true,
                  tenantCompanyId: true
                }
              }
            }
          }
        }
      })

      if (!asset) {
        throw new Error("Activo no encontrado")
      }

      await this.validateAssetAccess(asset, session)
      whereClause.assetId = filters.assetId
    }

    if (filters.status) {
      whereClause.status = filters.status
    }

    if (filters.startDate) {
      whereClause.startedAt = {
        gte: new Date(filters.startDate)
      }
    }

    if (filters.endDate) {
      whereClause.startedAt = {
        ...whereClause.startedAt as Prisma.DateTimeFilter,
        lte: new Date(filters.endDate)
      }
    }

    if (filters.changedBy) {
      whereClause.changedBy = filters.changedBy
    }

    return await AssetStatusHistoryRepository.findMany(
      whereClause,
      filters.page,
      filters.limit
    )
  }

  /**
   * Get current status for an asset
   */
  static async getCurrentAssetStatus(assetId: string, session: AuthenticatedSession) {
    // Verify permissions
    if (!AuthService.canUserPerformAction(session.user.role, 'view_asset_status_history')) {
      throw new Error("No tienes permisos para ver el estado de activos")
    }

    // Verify asset exists and user has access
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        site: {
          include: {
            clientCompany: {
              select: {
                id: true,
                tenantCompanyId: true
              }
            }
          }
        }
      }
    })

    if (!asset) {
      throw new Error("Activo no encontrado")
    }

    await this.validateAssetAccess(asset, session)

    return await AssetStatusHistoryRepository.getCurrentStatus(assetId)
  }

  /**
   * Calculate asset availability for a period
   * Returns percentage of time asset was OPERATIVO
   */
  static async calculateAssetAvailability(
    assetId: string,
    startDate: Date,
    endDate: Date,
    session: AuthenticatedSession
  ): Promise<number> {
    // Verify permissions
    if (!AuthService.canUserPerformAction(session.user.role, 'view_asset_status_history')) {
      throw new Error("No tienes permisos para ver métricas de activos")
    }

    // Verify asset exists and user has access
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        site: {
          include: {
            clientCompany: {
              select: {
                id: true,
                tenantCompanyId: true
              }
            }
          }
        }
      }
    })

    if (!asset) {
      throw new Error("Activo no encontrado")
    }

    await this.validateAssetAccess(asset, session)

    // Get history for period
    const history = await AssetStatusHistoryRepository.getHistoryForPeriod(
      assetId,
      startDate,
      endDate
    )

    // Calculate uptime minutes
    const uptimeMinutes = AssetStatusHistoryRepository.calculateUptimeMinutes(
      history,
      startDate,
      endDate
    )

    // Calculate total period minutes
    const totalMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60)

    // Calculate availability percentage
    const availability = totalMinutes > 0 ? (uptimeMinutes / totalMinutes) * 100 : 0

    return Math.round(availability * 100) / 100 // Round to 2 decimals
  }

  /**
   * Validate user has access to asset based on role and context
   */
  private static async validateAssetAccess(
    asset: {
      siteId: string
      site: {
        clientCompany: {
          id: string
          tenantCompanyId: string
        } | null
      }
    },
    session: AuthenticatedSession
  ): Promise<void> {
    const role = session.user.role

    switch (role) {
      case "SUPER_ADMIN":
        // Super admin has access to everything
        return

      case "ADMIN_GRUPO":
      case "ADMIN_EMPRESA":
      case "JEFE_MANTENIMIENTO":
      case "ENCARGADO_BODEGA":
      case "SUPERVISOR":
      case "TECNICO":
      case "OPERARIO":
        // Company-level roles: check company context
        if (!session.user.companyId) {
          throw new Error("Usuario sin empresa asociada")
        }
        if (asset.site.clientCompany?.tenantCompanyId !== session.user.companyId) {
          throw new Error("No tienes acceso a este activo")
        }
        return

      case "CLIENTE_ADMIN_GENERAL":
        // Client admin: check client company
        if (!session.user.clientCompanyId) {
          throw new Error("Usuario sin empresa cliente asociada")
        }
        if (asset.site.clientCompany?.id !== session.user.clientCompanyId) {
          throw new Error("No tienes acceso a este activo")
        }
        return

      case "CLIENTE_ADMIN_SEDE":
      case "CLIENTE_OPERARIO":
        // Site-level roles: check site
        if (!session.user.siteId) {
          throw new Error("Usuario sin sede asociada")
        }
        if (asset.siteId !== session.user.siteId) {
          throw new Error("No tienes acceso a este activo")
        }
        return

      default:
        throw new Error("Rol no autorizado para acceder a activos")
    }
  }
}

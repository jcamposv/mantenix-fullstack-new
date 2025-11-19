import { Prisma } from "@prisma/client"
import { LocationRepository } from "@/server/repositories/location.repository"
import { PermissionHelper } from "@/server/helpers/permission.helper"
import type {
  CompanyLocationWithRelations,
  CreateLocationData,
  UpdateLocationData,
  LocationFilters,
  PaginatedLocationsResponse
} from "@/types/attendance.types"
import type { AuthenticatedSession } from "@/types/auth.types"

export class LocationService {

  static buildWhereClause(
    filters?: LocationFilters,
    companyId?: string
  ): Prisma.CompanyLocationWhereInput {
    const whereClause: Prisma.CompanyLocationWhereInput = {}

    if (companyId) {
      whereClause.companyId = companyId
    }

    if (filters?.companyId) {
      whereClause.companyId = filters.companyId
    }

    if (typeof filters?.isActive === 'boolean') {
      whereClause.isActive = filters.isActive
    }

    if (filters?.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    return whereClause
  }

  static async getList(
    session: AuthenticatedSession,
    filters?: LocationFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedLocationsResponse> {
    await PermissionHelper.requirePermissionAsync(
      session,
      PermissionHelper.PERMISSIONS.MANAGE_LOCATIONS
    )

    // Si no es super admin, solo ver su empresa
    const hasViewCompanies = await PermissionHelper.hasPermissionAsync(
      session,
      PermissionHelper.PERMISSIONS.VIEW_COMPANIES
    )

    const companyId = hasViewCompanies
      ? filters?.companyId
      : session.user.companyId

    if (!companyId && !hasViewCompanies) {
      throw new Error("Usuario sin empresa asignada")
    }

    const whereClause = this.buildWhereClause(filters, companyId)
    const { locations, total } = await LocationRepository.findMany(whereClause, page, limit)

    const totalPages = Math.ceil(total / limit)

    return {
      locations,
      total,
      page,
      limit,
      totalPages
    }
  }

  static async getById(
    session: AuthenticatedSession,
    id: string
  ): Promise<CompanyLocationWithRelations | null> {
    await PermissionHelper.requirePermissionAsync(
      session,
      PermissionHelper.PERMISSIONS.MANAGE_LOCATIONS
    )

    const location = await LocationRepository.findById(id)

    if (!location) {
      return null
    }

    // Verificar que la ubicación es de su empresa
    const isSuperAdmin = await PermissionHelper.hasPermissionAsync(
      session,
      PermissionHelper.PERMISSIONS.VIEW_COMPANIES
    )

    if (!isSuperAdmin && location.companyId !== session.user.companyId) {
      throw new Error("No tienes permisos para ver esta ubicación")
    }

    return location
  }

  static async getByCompany(
    session: AuthenticatedSession,
    companyId?: string
  ): Promise<CompanyLocationWithRelations[]> {
    const targetCompanyId = companyId || session.user.companyId

    if (!targetCompanyId) {
      throw new Error("Usuario sin empresa asignada")
    }

    // Verificar permisos
    const isSuperAdmin = await PermissionHelper.hasPermissionAsync(
      session,
      PermissionHelper.PERMISSIONS.VIEW_COMPANIES
    )

    if (!isSuperAdmin && targetCompanyId !== session.user.companyId) {
      throw new Error("No tienes permisos para ver ubicaciones de esta empresa")
    }

    return await LocationRepository.findByCompany(targetCompanyId)
  }

  static async getActiveByCompany(companyId: string): Promise<CompanyLocationWithRelations[]> {
    return await LocationRepository.findActiveByCompany(companyId)
  }

  static async create(
    session: AuthenticatedSession,
    data: CreateLocationData
  ): Promise<CompanyLocationWithRelations> {
    await PermissionHelper.requirePermissionAsync(
      session,
      PermissionHelper.PERMISSIONS.MANAGE_LOCATIONS
    )

    // Verificar que es su empresa o es super admin
    const isSuperAdmin = await PermissionHelper.hasPermissionAsync(
      session,
      PermissionHelper.PERMISSIONS.VIEW_COMPANIES
    )

    if (!isSuperAdmin && data.companyId !== session.user.companyId) {
      throw new Error("No puedes crear ubicaciones para otra empresa")
    }

    const createData: Prisma.CompanyLocationCreateInput = {
      company: {
        connect: { id: data.companyId }
      },
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      radiusMeters: data.radiusMeters || 100,
      workStartTime: data.workStartTime || "08:00",
      workEndTime: data.workEndTime || "17:00",
      lateToleranceMinutes: data.lateToleranceMinutes ?? 15,
      timezone: data.timezone || "America/Costa_Rica",
      workDays: data.workDays || ["MON", "TUE", "WED", "THU", "FRI"]
    }

    return await LocationRepository.create(createData)
  }

  static async update(
    session: AuthenticatedSession,
    id: string,
    data: UpdateLocationData
  ): Promise<CompanyLocationWithRelations> {
    await PermissionHelper.requirePermissionAsync(
      session,
      PermissionHelper.PERMISSIONS.MANAGE_LOCATIONS
    )

    const location = await LocationRepository.findById(id)

    if (!location) {
      throw new Error("Ubicación no encontrada")
    }

    // Verificar que es su empresa o es super admin
    const isSuperAdmin = await PermissionHelper.hasPermissionAsync(
      session,
      PermissionHelper.PERMISSIONS.VIEW_COMPANIES
    )

    if (!isSuperAdmin && location.companyId !== session.user.companyId) {
      throw new Error("No puedes modificar ubicaciones de otra empresa")
    }

    const updateData: Prisma.CompanyLocationUpdateInput = {
      ...(data.name && { name: data.name }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.latitude && { latitude: data.latitude }),
      ...(data.longitude && { longitude: data.longitude }),
      ...(data.radiusMeters && { radiusMeters: data.radiusMeters }),
      ...(data.workStartTime && { workStartTime: data.workStartTime }),
      ...(data.workEndTime && { workEndTime: data.workEndTime }),
      ...(data.lateToleranceMinutes !== undefined && { lateToleranceMinutes: data.lateToleranceMinutes }),
      ...(data.timezone && { timezone: data.timezone }),
      ...(data.workDays && { workDays: data.workDays }),
      ...(typeof data.isActive === 'boolean' && { isActive: data.isActive })
    }

    return await LocationRepository.update(id, updateData)
  }

  static async delete(
    session: AuthenticatedSession,
    id: string
  ): Promise<CompanyLocationWithRelations> {
    await PermissionHelper.requirePermissionAsync(
      session,
      PermissionHelper.PERMISSIONS.MANAGE_LOCATIONS
    )

    const location = await LocationRepository.findById(id)

    if (!location) {
      throw new Error("Ubicación no encontrada")
    }

    // Verificar que es su empresa o es super admin
    const isSuperAdmin = await PermissionHelper.hasPermissionAsync(
      session,
      PermissionHelper.PERMISSIONS.VIEW_COMPANIES
    )

    if (!isSuperAdmin && location.companyId !== session.user.companyId) {
      throw new Error("No puedes eliminar ubicaciones de otra empresa")
    }

    return await LocationRepository.delete(id)
  }
}

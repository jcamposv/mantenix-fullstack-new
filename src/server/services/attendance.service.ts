import { Prisma, AttendanceStatus } from "@prisma/client"
import { AttendanceRepository } from "@/server/repositories/attendance.repository"
import { LocationRepository } from "@/server/repositories/location.repository"
import { FeatureService } from "@/server/services/feature.service"
import { PermissionHelper } from "@/server/helpers/permission.helper"
import { validateGeofence } from "@/lib/geolocation"
import type {
  AttendanceRecordWithRelations,
  CheckInData,
  CheckOutData,
  AttendanceFilters,
  PaginatedAttendanceResponse,
  MonthlyAttendanceReport,
  DailyAttendanceSummary
} from "@/types/attendance.types"
import type { AuthenticatedSession } from "@/types/auth.types"

export class AttendanceService {

  static buildWhereClause(
    filters?: AttendanceFilters,
    companyId?: string
  ): Prisma.AttendanceRecordWhereInput {
    const whereClause: Prisma.AttendanceRecordWhereInput = {}

    if (companyId) {
      whereClause.companyId = companyId
    }

    if (filters?.userId) {
      whereClause.userId = filters.userId
    }

    if (filters?.locationId) {
      whereClause.locationId = filters.locationId
    }

    if (filters?.status) {
      whereClause.status = filters.status
    }

    // Filtrar por rango de fechas
    if (filters?.startDate || filters?.endDate) {
      whereClause.checkInAt = {}
      if (filters.startDate) {
        whereClause.checkInAt.gte = filters.startDate
      }
      if (filters.endDate) {
        whereClause.checkInAt.lte = filters.endDate
      }
    }

    // Filtrar por mes y año
    if (filters?.month && filters?.year) {
      const startDate = new Date(filters.year, filters.month - 1, 1)
      const endDate = new Date(filters.year, filters.month, 0, 23, 59, 59, 999)
      whereClause.checkInAt = {
        gte: startDate,
        lte: endDate
      }
    }

    return whereClause
  }

  static async getList(
    session: AuthenticatedSession,
    filters?: AttendanceFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedAttendanceResponse> {
    // Verificar permisos
    const hasAllAccess = PermissionHelper.hasPermission(
      session.user.role,
      PermissionHelper.PERMISSIONS.VIEW_ALL_ATTENDANCE
    )

    const hasCompanyAccess = PermissionHelper.hasPermission(
      session.user.role,
      PermissionHelper.PERMISSIONS.VIEW_COMPANY_ATTENDANCE
    )

    if (!hasAllAccess && !hasCompanyAccess) {
      // Solo puede ver su propia asistencia
      await PermissionHelper.requirePermissionAsync(
        session,
        PermissionHelper.PERMISSIONS.VIEW_ATTENDANCE
      )
      filters = { ...filters, userId: session.user.id }
    }

    // Si no es super admin, solo ver su empresa
    const companyId = hasAllAccess ? undefined : session.user.companyId

    if (!companyId && !hasAllAccess) {
      throw new Error("Usuario sin empresa asignada")
    }

    const whereClause = this.buildWhereClause(filters, companyId)
    const { records, total } = await AttendanceRepository.findMany(whereClause, page, limit)

    const totalPages = Math.ceil(total / limit)

    return {
      records,
      total,
      page,
      limit,
      totalPages
    }
  }

  static async getById(
    session: AuthenticatedSession,
    id: string
  ): Promise<AttendanceRecordWithRelations | null> {
    const record = await AttendanceRepository.findById(id)

    if (!record) {
      return null
    }

    // Verificar permisos
    const hasAllAccess = PermissionHelper.hasPermission(
      session.user.role,
      PermissionHelper.PERMISSIONS.VIEW_ALL_ATTENDANCE
    )

    if (!hasAllAccess) {
      // Solo puede ver su propia asistencia o de su empresa
      if (
        record.userId !== session.user.id &&
        record.companyId !== session.user.companyId
      ) {
        throw new Error("No tienes permisos para ver este registro")
      }
    }

    return record
  }

  static async getTodayRecord(
    session: AuthenticatedSession
  ): Promise<AttendanceRecordWithRelations | null> {
    const companyId = session.user.companyId

    if (!companyId) {
      throw new Error("Usuario sin empresa asignada")
    }

    return await AttendanceRepository.findTodayRecord(session.user.id, companyId)
  }

  static async checkIn(
    session: AuthenticatedSession,
    data: CheckInData
  ): Promise<AttendanceRecordWithRelations> {
    await PermissionHelper.requirePermissionAsync(
      session,
      PermissionHelper.PERMISSIONS.CREATE_ATTENDANCE
    )

    const companyId = session.user.companyId

    if (!companyId) {
      throw new Error("Usuario sin empresa asignada")
    }

    // Verificar que el módulo está habilitado
    await FeatureService.requireModuleEnabled(companyId, "HR_ATTENDANCE")

    // Verificar que no haya ya marcado entrada hoy
    const todayRecord = await this.getTodayRecord(session)

    if (todayRecord) {
      throw new Error("Ya has marcado entrada hoy")
    }

    // Obtener ubicaciones de la empresa
    const locations = await LocationRepository.findActiveByCompany(companyId)

    // Validar geofence
    const geofenceResult = validateGeofence(
      { latitude: data.latitude, longitude: data.longitude },
      locations
    )

    if (!geofenceResult.isWithinGeofence) {
      throw new Error(geofenceResult.message)
    }

    // Obtener la ubicación más cercana para usar su configuración de horarios
    const nearestLocation = geofenceResult.nearestLocation
    if (!nearestLocation) {
      throw new Error("No se pudo determinar la ubicación")
    }

    // Valores por defecto si no están configurados
    const timezone = nearestLocation.timezone || "America/Costa_Rica"
    const workStartTime = nearestLocation.workStartTime || "08:00"
    const lateToleranceMinutes = nearestLocation.lateToleranceMinutes ?? 15
    const workDays = nearestLocation.workDays && nearestLocation.workDays.length > 0
      ? nearestLocation.workDays
      : ["MON", "TUE", "WED", "THU", "FRI"]

    // Obtener fecha/hora actual en el timezone de la ubicación
    const now = new Date()
    const locationTime = new Date(
      now.toLocaleString("en-US", { timeZone: timezone })
    )

    // Verificar si es día laboral
    const dayOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][
      locationTime.getDay()
    ]
    if (!workDays.includes(dayOfWeek)) {
      throw new Error(
        `Hoy ${dayOfWeek === "SUN" ? "domingo" : dayOfWeek === "SAT" ? "sábado" : ""} no es un día laboral en esta ubicación`
      )
    }

    // Parsear horario de entrada de la ubicación (formato "HH:mm")
    const [workStartHour, workStartMinute] = workStartTime
      .split(":")
      .map(Number)

    // Calcular hora límite con tolerancia
    const workStartTimeDate = new Date(locationTime)
    workStartTimeDate.setHours(workStartHour, workStartMinute, 0, 0)

    const lateThresholdTime = new Date(workStartTimeDate)
    lateThresholdTime.setMinutes(
      lateThresholdTime.getMinutes() + lateToleranceMinutes
    )

    // Determinar estado (ON_TIME o LATE)
    let status: AttendanceStatus = "ON_TIME"
    let lateMinutes = 0

    if (locationTime > lateThresholdTime) {
      status = "LATE"
      lateMinutes = Math.floor(
        (locationTime.getTime() - workStartTimeDate.getTime()) / 60000
      )
    }

    const createData: Prisma.AttendanceRecordCreateInput = {
      company: {
        connect: { id: companyId }
      },
      user: {
        connect: { id: session.user.id }
      },
      location: geofenceResult.nearestLocation
        ? {
            connect: { id: geofenceResult.nearestLocation.id }
          }
        : undefined,
      latitude: data.latitude,
      longitude: data.longitude,
      checkInAt: now,
      status,
      lateMinutes: lateMinutes > 0 ? lateMinutes : undefined,
      notes: data.notes,
      deviceInfo: data.deviceInfo
    }

    return await AttendanceRepository.create(createData)
  }

  static async checkOut(
    session: AuthenticatedSession,
    data: CheckOutData
  ): Promise<AttendanceRecordWithRelations> {
    const record = await AttendanceRepository.findById(data.attendanceId)

    if (!record) {
      throw new Error("Registro de asistencia no encontrado")
    }

    // Verificar que es el dueño del registro
    if (record.userId !== session.user.id) {
      throw new Error("Solo puedes marcar salida de tu propia asistencia")
    }

    if (record.checkOutAt) {
      throw new Error("Ya has marcado salida")
    }

    const now = new Date()

    // Calcular duración del trabajo
    const workDurationMinutes = Math.floor(
      (now.getTime() - record.checkInAt.getTime()) / 60000
    )

    const updateData: Prisma.AttendanceRecordUpdateInput = {
      checkOutAt: now,
      workDurationMinutes,
      notes: data.notes ? `${record.notes || ""}\n${data.notes}`.trim() : record.notes
    }

    return await AttendanceRepository.update(record.id, updateData)
  }

  static async getMonthlyReport(
    session: AuthenticatedSession,
    userId: string,
    month: number,
    year: number
  ): Promise<MonthlyAttendanceReport> {
    const companyId = session.user.companyId

    if (!companyId) {
      throw new Error("Usuario sin empresa asignada")
    }

    // Verificar permisos
    const hasAllAccess = PermissionHelper.hasPermission(
      session.user.role,
      PermissionHelper.PERMISSIONS.VIEW_ALL_ATTENDANCE
    )

    const hasCompanyAccess = PermissionHelper.hasPermission(
      session.user.role,
      PermissionHelper.PERMISSIONS.VIEW_COMPANY_ATTENDANCE
    )

    if (!hasAllAccess && !hasCompanyAccess && userId !== session.user.id) {
      throw new Error("No tienes permisos para ver este reporte")
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    const records = await AttendanceRepository.findByUserAndDateRange(
      userId,
      companyId,
      startDate,
      endDate
    )

    const stats = await AttendanceRepository.getMonthlyStats(companyId, userId, month, year)

    // Calcular horas totales trabajadas
    const totalWorkHours = records.reduce((sum, record) => {
      return sum + (record.workDurationMinutes || 0)
    }, 0) / 60

    // Calcular promedio de minutos tarde
    const averageLateMinutes =
      stats.late > 0
        ? records
            .filter((r) => r.status === "LATE")
            .reduce((sum, r) => sum + (r.lateMinutes || 0), 0) / stats.late
        : 0

    // Días del mes
    const daysInMonth = new Date(year, month, 0).getDate()

    return {
      userId,
      userName: records[0]?.user.name || "Usuario",
      userAvatar: records[0]?.user.avatar,
      month,
      year,
      totalDays: daysInMonth,
      daysPresent: stats.totalRecords,
      daysOnTime: stats.onTime,
      daysLate: stats.late,
      daysAbsent: stats.absent,
      daysJustified: stats.justified,
      totalWorkHours,
      averageLateMinutes,
      records
    }
  }

  static async getDailySummary(
    session: AuthenticatedSession,
    date: Date
  ): Promise<DailyAttendanceSummary> {
    await PermissionHelper.requirePermissionAsync(
      session,
      PermissionHelper.PERMISSIONS.VIEW_COMPANY_ATTENDANCE
    )

    const companyId = session.user.companyId

    if (!companyId) {
      throw new Error("Usuario sin empresa asignada")
    }

    const stats = await AttendanceRepository.getCompanyDailyStats(companyId, date)

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const records = await AttendanceRepository.findByUserAndDateRange(
      "", // Empty userId to get all
      companyId,
      startOfDay,
      endOfDay
    )

    const totalWorkMinutes = records.reduce((sum, record) => {
      return sum + (record.workDurationMinutes || 0)
    }, 0)

    const averageWorkHours =
      records.length > 0 ? totalWorkMinutes / 60 / records.length : 0

    return {
      date,
      totalEmployees: stats.totalEmployees,
      present: stats.present,
      onTime: stats.onTime,
      late: stats.late,
      absent: stats.absent,
      justified: 0, // TODO: Calcular justificados
      earlyDeparture: 0, // TODO: Calcular salidas tempranas
      averageWorkHours
    }
  }
}

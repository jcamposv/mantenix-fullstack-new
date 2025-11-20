import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { AttendanceRecordWithRelations, AttendanceRecordBasic } from "@/types/attendance.types"

/**
 * Repository para el acceso a datos de registros de asistencia
 * Solo contiene operaciones CRUD directas con Prisma
 */
export class AttendanceRepository {

  private static readonly includeRelations = {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    },
    location: {
      select: {
        id: true,
        name: true
      }
    },
    company: {
      select: {
        id: true,
        name: true
      }
    }
  }

  private static readonly includeBasic = {
    user: {
      select: {
        id: true,
        name: true,
        avatar: true
      }
    }
  }

  static async findById(id: string): Promise<AttendanceRecordWithRelations | null> {
    return await prisma.attendanceRecord.findUnique({
      where: { id },
      include: AttendanceRepository.includeRelations
    })
  }

  static async findMany(
    whereClause: Prisma.AttendanceRecordWhereInput,
    page: number,
    limit: number
  ): Promise<{ items: AttendanceRecordWithRelations[], total: number }> {
    const offset = (page - 1) * limit

    const [records, total] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where: whereClause,
        include: AttendanceRepository.includeRelations,
        orderBy: { checkInAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.attendanceRecord.count({ where: whereClause })
    ])

    return { items: records, total }
  }

  static async findByUserAndDateRange(
    userId: string,
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AttendanceRecordBasic[]> {
    return await prisma.attendanceRecord.findMany({
      where: {
        userId,
        companyId,
        checkInAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: AttendanceRepository.includeBasic,
      orderBy: { checkInAt: 'asc' }
    })
  }

  static async findTodayRecord(userId: string, companyId: string): Promise<AttendanceRecordWithRelations | null> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return await prisma.attendanceRecord.findFirst({
      where: {
        userId,
        companyId,
        checkInAt: {
          gte: today,
          lt: tomorrow
        }
      },
      include: AttendanceRepository.includeRelations,
      orderBy: { checkInAt: 'desc' }
    })
  }

  static async create(data: Prisma.AttendanceRecordCreateInput): Promise<AttendanceRecordWithRelations> {
    return await prisma.attendanceRecord.create({
      data,
      include: AttendanceRepository.includeRelations
    })
  }

  static async update(
    id: string,
    data: Prisma.AttendanceRecordUpdateInput
  ): Promise<AttendanceRecordWithRelations> {
    return await prisma.attendanceRecord.update({
      where: { id },
      data,
      include: AttendanceRepository.includeRelations
    })
  }

  static async delete(id: string): Promise<AttendanceRecordWithRelations> {
    return await prisma.attendanceRecord.delete({
      where: { id },
      include: AttendanceRepository.includeRelations
    })
  }

  // ============================================================================
  // ESTADÍSTICAS Y REPORTES
  // ============================================================================

  static async getMonthlyStats(
    companyId: string,
    userId: string,
    month: number,
    year: number
  ): Promise<{
    totalRecords: number
    onTime: number
    late: number
    absent: number
    justified: number
    earlyDeparture: number
  }> {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    const records = await prisma.attendanceRecord.findMany({
      where: {
        companyId,
        userId,
        checkInAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        status: true
      }
    })

    const stats = {
      totalRecords: records.length,
      onTime: 0,
      late: 0,
      absent: 0,
      justified: 0,
      earlyDeparture: 0
    }

    records.forEach(record => {
      switch (record.status) {
        case 'ON_TIME':
          stats.onTime++
          break
        case 'LATE':
          stats.late++
          break
        case 'ABSENT':
          stats.absent++
          break
        case 'JUSTIFIED':
          stats.justified++
          break
        case 'EARLY_DEPARTURE':
          stats.earlyDeparture++
          break
      }
    })

    return stats
  }

  static async getCompanyDailyStats(
    companyId: string,
    date: Date
  ): Promise<{
    totalEmployees: number
    present: number
    onTime: number
    late: number
    absent: number
    justified: number
    earlyDeparture: number
  }> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Total de empleados activos de la empresa
    const totalEmployees = await prisma.user.count({
      where: {
        companyId,
        isLocked: false,
        role: {
          key: { in: ['TECNICO', 'SUPERVISOR', 'ADMIN_EMPRESA'] }
        }
      }
    })

    // Registros del día
    const records = await prisma.attendanceRecord.findMany({
      where: {
        companyId,
        checkInAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      select: {
        status: true
      }
    })

    const stats = {
      totalEmployees,
      present: records.length,
      onTime: records.filter(r => r.status === 'ON_TIME').length,
      late: records.filter(r => r.status === 'LATE').length,
      absent: totalEmployees - records.length,
      justified: records.filter(r => r.status === 'JUSTIFIED').length,
      earlyDeparture: records.filter(r => r.status === 'EARLY_DEPARTURE').length
    }

    return stats
  }
}

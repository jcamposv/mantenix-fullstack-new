import type {
  AttendanceRecord,
  AttendanceStatus,
  CompanyLocation,
  User,
  Company
} from "@prisma/client"

// ============================================================================
// ATTENDANCE RECORD TYPES
// ============================================================================

export interface AttendanceRecordWithRelations extends AttendanceRecord {
  user: Pick<User, "id" | "name" | "email" | "avatar">
  location?: Pick<CompanyLocation, "id" | "name"> | null
  company?: Pick<Company, "id" | "name"> | null
}

export interface AttendanceRecordBasic extends AttendanceRecord {
  user: {
    id: string
    name: string
    avatar?: string | null
  }
}

export interface CreateAttendanceData {
  userId: string
  companyId: string
  locationId?: string
  latitude: number
  longitude: number
  checkInAt: Date
  status: AttendanceStatus
  notes?: string
  deviceInfo?: string
  ipAddress?: string
}

export interface CheckInData {
  latitude: number
  longitude: number
  deviceInfo?: string
  notes?: string
}

export interface CheckOutData {
  attendanceId: string
  latitude: number
  longitude: number
  notes?: string
}

export interface UpdateAttendanceData {
  checkOutAt?: Date
  status?: AttendanceStatus
  notes?: string
  workDurationMinutes?: number
  lateMinutes?: number
}

export interface AttendanceFilters {
  userId?: string
  locationId?: string
  status?: AttendanceStatus
  startDate?: Date
  endDate?: Date
  month?: number
  year?: number
}

export interface PaginatedAttendanceResponse {
  records: AttendanceRecordWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============================================================================
// ATTENDANCE REPORTS
// ============================================================================

export interface DailyAttendanceSummary {
  date: Date
  totalEmployees: number
  present: number
  onTime: number
  late: number
  absent: number
  justified: number
  earlyDeparture: number
  averageWorkHours: number
}

export interface MonthlyAttendanceReport {
  userId: string
  userName: string
  userAvatar?: string | null
  month: number
  year: number
  totalDays: number
  daysPresent: number
  daysOnTime: number
  daysLate: number
  daysAbsent: number
  daysJustified: number
  totalWorkHours: number
  averageLateMinutes: number
  records: AttendanceRecordBasic[]
}

export interface YearlyAttendanceReport {
  userId: string
  userName: string
  year: number
  monthlyBreakdown: Array<{
    month: number
    daysPresent: number
    daysOnTime: number
    daysLate: number
    daysAbsent: number
    totalWorkHours: number
  }>
  totalDaysPresent: number
  totalDaysOnTime: number
  totalDaysLate: number
  totalDaysAbsent: number
  totalWorkHours: number
}

export interface AttendanceStats {
  totalRecords: number
  onTimePercentage: number
  latePercentage: number
  absentPercentage: number
  averageWorkHours: number
  averageLateMinutes: number
}

// ============================================================================
// COMPANY LOCATION TYPES
// ============================================================================

export interface CompanyLocationWithRelations extends CompanyLocation {
  company: Pick<Company, "id" | "name">
  _count?: {
    attendanceRecords: number
  }
}

export interface CreateLocationData {
  companyId: string
  name: string
  address?: string
  latitude: number
  longitude: number
  radiusMeters?: number
  workStartTime?: string
  workEndTime?: string
  lateToleranceMinutes?: number
  timezone?: string
  workDays?: string[]
}

export interface UpdateLocationData {
  name?: string
  address?: string
  latitude?: number
  longitude?: number
  radiusMeters?: number
  workStartTime?: string
  workEndTime?: string
  lateToleranceMinutes?: number
  timezone?: string
  workDays?: string[]
  isActive?: boolean
}

export interface LocationFilters {
  companyId?: string
  isActive?: boolean
  search?: string
}

export interface PaginatedLocationsResponse {
  locations: CompanyLocationWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============================================================================
// GEOLOCATION TYPES
// ============================================================================

export interface GeolocationCoordinates {
  latitude: number
  longitude: number
  accuracy?: number
}

export interface GeofenceValidationResult {
  isWithinGeofence: boolean
  distance: number // Distance in meters
  nearestLocation?: CompanyLocationWithRelations
  message: string
}

// ============================================================================
// FEATURE FLAGS TYPES
// ============================================================================

export interface FeatureModuleInfo {
  module: string
  name: string
  description: string
  category: "HR" | "AI" | "ANALYTICS" | "OTHER"
}

export const AVAILABLE_FEATURES: Record<string, FeatureModuleInfo> = {
  HR_ATTENDANCE: {
    module: "HR_ATTENDANCE",
    name: "Asistencia y Marcaje",
    description: "Control de asistencia de empleados con geolocalización",
    category: "HR"
  },
  HR_VACATIONS: {
    module: "HR_VACATIONS",
    name: "Gestión de Vacaciones",
    description: "Solicitudes y seguimiento de vacaciones",
    category: "HR"
  },
  HR_PERMISSIONS: {
    module: "HR_PERMISSIONS",
    name: "Permisos y Ausencias",
    description: "Gestión de permisos y justificaciones",
    category: "HR"
  },
  AI_ASSISTANT: {
    module: "AI_ASSISTANT",
    name: "Asistente de IA",
    description: "Asistente inteligente para mantenimiento predictivo",
    category: "AI"
  },
  ADVANCED_ANALYTICS: {
    module: "ADVANCED_ANALYTICS",
    name: "Análisis Avanzados",
    description: "Reportes y estadísticas avanzadas",
    category: "ANALYTICS"
  }
}

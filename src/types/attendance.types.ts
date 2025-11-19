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
  category: "HR" | "AI" | "ANALYTICS" | "BUSINESS_MODEL" | "PLATFORM" | "SUPPORT" | "OTHER"
}

export const AVAILABLE_FEATURES: Record<string, FeatureModuleInfo> = {
  // HR Modules
  HR_ATTENDANCE: {
    module: "HR_ATTENDANCE",
    name: "Asistencia y Marcaje",
    description: "Control de asistencia de empleados con geolocalización",
    category: "HR"
  },
  HR_TIME_OFF: {
    module: "HR_TIME_OFF",
    name: "Gestión de Ausencias",
    description: "Vacaciones, permisos y licencias",
    category: "HR"
  },

  // AI & Analytics
  AI_ASSISTANT: {
    module: "AI_ASSISTANT",
    name: "Asistente de IA",
    description: "Asistente inteligente para mantenimiento predictivo (add-on)",
    category: "AI"
  },
  ADVANCED_ANALYTICS: {
    module: "ADVANCED_ANALYTICS",
    name: "Dashboard de Métricas",
    description: "Reportes y estadísticas avanzadas",
    category: "ANALYTICS"
  },

  // Business Models
  EXTERNAL_CLIENT_MANAGEMENT: {
    module: "EXTERNAL_CLIENT_MANAGEMENT",
    name: "Gestión de Clientes Externos",
    description: "Permite gestionar clientes externos, sus sedes, y asignar assets y órdenes de trabajo por sitio",
    category: "BUSINESS_MODEL"
  },
  INTERNAL_CORPORATE_GROUP: {
    module: "INTERNAL_CORPORATE_GROUP",
    name: "Grupo Corporativo Multi-Compañía",
    description: "Habilita grupo empresarial con inventario compartido y transferencias inter-company",
    category: "BUSINESS_MODEL"
  },

  // Platform Features
  API_ACCESS: {
    module: "API_ACCESS",
    name: "Acceso a API REST",
    description: "Acceso completo a la API REST para integraciones",
    category: "PLATFORM"
  },
  PRIORITY_SUPPORT: {
    module: "PRIORITY_SUPPORT",
    name: "Soporte Prioritario",
    description: "Soporte con tiempo de respuesta garantizado",
    category: "SUPPORT"
  },
  DEDICATED_SUPPORT: {
    module: "DEDICATED_SUPPORT",
    name: "Soporte Dedicado",
    description: "Account manager dedicado para tu empresa",
    category: "SUPPORT"
  }
}

/**
 * useAttendance Hook
 *
 * Wrapper around useServerTable for attendance records with type-safe filters.
 * Uses the generic server pagination hook to avoid code duplication.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import { useServerTable } from './use-server-table'
import type { AttendanceRecordWithRelations } from '@/types/attendance.types'
import type { AttendanceStatus } from '@prisma/client'

/**
 * Filters for attendance records
 */
export interface AttendanceFilters {
  userId?: string
  locationId?: string
  status?: AttendanceStatus
  startDate?: Date
  endDate?: Date
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseAttendanceOptions {
  page?: number
  limit?: number
  search?: string
  filters?: AttendanceFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook result
 */
interface UseAttendanceResult {
  records: AttendanceRecordWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for attendance records with comprehensive filtering
 */
export function useAttendance(
  options: UseAttendanceOptions = {}
): UseAttendanceResult {
  const {
    page = 1,
    limit = 20,
    search,
    filters,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  const { data, total, page: currentPage, limit: currentLimit, totalPages, loading, error, refetch } =
    useServerTable<AttendanceRecordWithRelations, AttendanceFilters>({
      endpoint: '/api/attendance',
      page,
      limit,
      search,
      filters,
      autoRefresh,
      refreshInterval,
    })

  return {
    records: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

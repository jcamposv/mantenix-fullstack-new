/**
 * Attendance Filters Component
 *
 * Simple filter UI for attendance table with status filter.
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AttendanceFilters } from '@/hooks/use-attendance'
import type { AttendanceStatus } from '@prisma/client'

interface AttendanceFiltersProps {
  filters: AttendanceFilters
  onFiltersChange: (filters: AttendanceFilters) => void
}

const STATUS_OPTIONS = [
  { value: 'ON_TIME', label: 'A Tiempo' },
  { value: 'LATE', label: 'Tarde' },
  { value: 'ABSENT', label: 'Ausente' },
  { value: 'JUSTIFIED', label: 'Justificado' },
  { value: 'EARLY_DEPARTURE', label: 'Salida Temprana' },
]

export function AttendanceFilters({
  filters,
  onFiltersChange,
}: AttendanceFiltersProps) {
  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as AttendanceStatus),
    })
  }

  return (
    <div className="space-y-6 p-1">
      <div className="space-y-3">
        <Label htmlFor="status">Estado</Label>
        <Select
          value={filters.status || 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Summary */}
      {filters.status && (
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground mb-2">
            Filtros activos:
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.status && (
              <Badge variant="secondary" className="text-xs">
                {STATUS_OPTIONS.find((s) => s.value === filters.status)?.label}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

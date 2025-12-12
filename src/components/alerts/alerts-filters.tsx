/**
 * Alerts Filters Component
 *
 * Compact filtering UI for alerts (used inside FilterButton popover).
 *
 * Following Next.js Expert standards:
 * - Client component
 * - Type-safe props
 * - Clean composition
 * - Under 200 lines
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
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { AlertManagementFilters } from '@/hooks/use-alerts-management'
import { AlertStatus, AlertPriority, AlertType } from '@prisma/client'
import { alertTypes } from '@/schemas/alert'
import { Calendar, AlertTriangle } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

interface AlertsFiltersProps {
  filters: AlertManagementFilters
  onFiltersChange: (filters: AlertManagementFilters) => void
}

const statusOptions: { value: AlertStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'OPEN', label: 'Abiertas' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'RESOLVED', label: 'Resueltas' },
  { value: 'CLOSED', label: 'Cerradas' },
]

const priorityOptions: { value: AlertPriority | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todas' },
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
]

const myAlertsOptions: { value: 'reported' | 'assigned' | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todas las alertas' },
  { value: 'reported', label: 'Reportadas por mí' },
  { value: 'assigned', label: 'Asignadas a mí' },
]

export function AlertsFilters({
  filters,
  onFiltersChange,
}: AlertsFiltersProps) {
  const handleStatusChange = (value: string) => {
    if (value === 'ALL') {
      onFiltersChange({
        ...filters,
        status: undefined,
      })
    } else {
      onFiltersChange({
        ...filters,
        status: value as AlertStatus,
      })
    }
  }

  const handlePriorityChange = (value: string) => {
    if (value === 'ALL') {
      onFiltersChange({
        ...filters,
        priority: undefined,
      })
    } else {
      onFiltersChange({
        ...filters,
        priority: value as AlertPriority,
      })
    }
  }

  const handleTypeChange = (value: string) => {
    if (value === 'ALL') {
      onFiltersChange({
        ...filters,
        type: undefined,
      })
    } else {
      onFiltersChange({
        ...filters,
        type: value as AlertType,
      })
    }
  }

  const handleMyAlertsChange = (value: string) => {
    if (value === 'ALL') {
      onFiltersChange({
        ...filters,
        my: undefined,
      })
    } else {
      onFiltersChange({
        ...filters,
        my: value as 'reported' | 'assigned',
      })
    }
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onFiltersChange({
      ...filters,
      startDate: range?.from,
      endDate: range?.to,
    })
  }

  return (
    <div className="space-y-6 p-1">
      {/* Grid layout para filtros principales */}
      <div className="grid grid-cols-2 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            Estado
          </Label>
          <Select
            value={filters.status || 'ALL'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            Prioridad
          </Label>
          <Select
            value={filters.priority || 'ALL'}
            onValueChange={handlePriorityChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tipo</Label>
          <Select
            value={filters.type || 'ALL'}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {alertTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <span className="flex items-center gap-2">
                    <span>{type.icon}</span>
                    {type.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* My Alerts Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Mis Alertas</Label>
          <Select
            value={filters.my || 'ALL'}
            onValueChange={handleMyAlertsChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {myAlertsOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-3 pt-2 border-t">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          Rango de Fechas
        </Label>
        <DateRangePicker
          value={{
            from: filters.startDate,
            to: filters.endDate,
          }}
          onChange={handleDateRangeChange}
          placeholder="Seleccionar fechas"
          className="w-full"
        />
      </div>

      {/* Active Filters Summary */}
      {(filters.status ||
        filters.priority ||
        filters.type ||
        filters.my ||
        filters.startDate) && (
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-2">
            Filtros activos:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.status && (
              <Badge variant="secondary" className="text-xs">
                {statusOptions.find((o) => o.value === filters.status)?.label}
              </Badge>
            )}
            {filters.priority && (
              <Badge variant="secondary" className="text-xs">
                {
                  priorityOptions.find((o) => o.value === filters.priority)
                    ?.label
                }
              </Badge>
            )}
            {filters.type && (
              <Badge variant="secondary" className="text-xs">
                {alertTypes.find((t) => t.value === filters.type)?.label}
              </Badge>
            )}
            {filters.my && (
              <Badge variant="secondary" className="text-xs">
                {myAlertsOptions.find((o) => o.value === filters.my)?.label}
              </Badge>
            )}
            {filters.startDate && filters.endDate && (
              <Badge variant="secondary" className="text-xs">
                {filters.startDate.toLocaleDateString('es')} -{' '}
                {filters.endDate.toLocaleDateString('es')}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

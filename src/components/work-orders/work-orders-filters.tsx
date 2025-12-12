/**
 * Work Orders Filters Component
 *
 * Compact filtering UI for work orders (used inside FilterButton popover).
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
import { Checkbox } from '@/components/ui/checkbox'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import {
  WorkOrderManagementFilters,
  type WorkOrderStatus,
  type WorkOrderPriority,
  type WorkOrderType,
} from '@/hooks/use-work-orders-management'
import { Calendar, Wrench, User, Filter } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

interface WorkOrdersFiltersProps {
  filters: WorkOrderManagementFilters
  onFiltersChange: (filters: WorkOrderManagementFilters) => void
}

const statusOptions = [
  { value: 'ALL', label: 'Todos' },
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'ASSIGNED', label: 'Asignada' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'COMPLETED', label: 'Completada' },
  { value: 'CANCELLED', label: 'Cancelada' },
]

const priorityOptions = [
  { value: 'ALL', label: 'Todas' },
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' },
]

const typeOptions = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PREVENTIVO', label: 'Preventivo' },
  { value: 'CORRECTIVO', label: 'Correctivo' },
  { value: 'REPARACION', label: 'Reparación' },
]

export function WorkOrdersFilters({
  filters,
  onFiltersChange,
}: WorkOrdersFiltersProps) {
  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'ALL' ? undefined : (value as WorkOrderStatus),
    })
  }

  const handlePriorityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      priority: value === 'ALL' ? undefined : (value as WorkOrderPriority),
    })
  }

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value === 'ALL' ? undefined : (value as WorkOrderType),
    })
  }

  const handleAssignedToMeChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      assignedToMe: checked || undefined,
    })
  }

  const handleCreatedByMeChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      createdByMe: checked || undefined,
    })
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onFiltersChange({
      ...filters,
      scheduledDateFrom: range?.from,
      scheduledDateTo: range?.to,
    })
  }

  return (
    <div className="space-y-6 p-1">
      {/* Grid layout para filtros principales */}
      <div className="grid grid-cols-3 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-3.5 w-3.5" />
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
            <Filter className="h-3.5 w-3.5" />
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
          <Label className="text-sm font-medium flex items-center gap-2">
            <Wrench className="h-3.5 w-3.5" />
            Tipo
          </Label>
          <Select value={filters.type || 'ALL'} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* My Work Orders Checkboxes */}
      <div className="space-y-3 pt-2 border-t">
        <Label className="text-sm font-medium flex items-center gap-2">
          <User className="h-3.5 w-3.5" />
          Mis Órdenes
        </Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="assignedToMe"
              checked={filters.assignedToMe || false}
              onCheckedChange={handleAssignedToMeChange}
            />
            <label
              htmlFor="assignedToMe"
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Asignadas a mí
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="createdByMe"
              checked={filters.createdByMe || false}
              onCheckedChange={handleCreatedByMeChange}
            />
            <label
              htmlFor="createdByMe"
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Creadas por mí
            </label>
          </div>
        </div>
      </div>

      {/* Scheduled Date Range Filter */}
      <div className="space-y-3 pt-2 border-t">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          Fecha Programada
        </Label>
        <DateRangePicker
          value={{
            from: filters.scheduledDateFrom,
            to: filters.scheduledDateTo,
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
        filters.assignedToMe ||
        filters.createdByMe ||
        filters.scheduledDateFrom) && (
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
                {typeOptions.find((o) => o.value === filters.type)?.label}
              </Badge>
            )}
            {filters.assignedToMe && (
              <Badge variant="secondary" className="text-xs">
                Asignadas a mí
              </Badge>
            )}
            {filters.createdByMe && (
              <Badge variant="secondary" className="text-xs">
                Creadas por mí
              </Badge>
            )}
            {filters.scheduledDateFrom && filters.scheduledDateTo && (
              <Badge variant="secondary" className="text-xs">
                {filters.scheduledDateFrom.toLocaleDateString('es')} -{' '}
                {filters.scheduledDateTo.toLocaleDateString('es')}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

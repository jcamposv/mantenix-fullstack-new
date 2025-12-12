/**
 * Work Permits Filters Component
 *
 * Compact filtering UI for work permits (used inside FilterButton popover).
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
import type { WorkPermitFilters } from '@/hooks/use-work-permits'
import { Filter, ShieldAlert } from 'lucide-react'

interface WorkPermitsFiltersProps {
  filters: WorkPermitFilters
  onFiltersChange: (filters: WorkPermitFilters) => void
}

const statusOptions = [
  { value: 'ALL', label: 'Todos' },
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'PENDING_AUTHORIZATION', label: 'Pendiente Autorización' },
  { value: 'AUTHORIZED', label: 'Autorizado' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

const typeOptions = [
  { value: 'ALL', label: 'Todos' },
  { value: 'HOT_WORK', label: 'Trabajo en Caliente' },
  { value: 'CONFINED_SPACE', label: 'Espacio Confinado' },
  { value: 'ELECTRICAL', label: 'Eléctrico' },
  { value: 'HEIGHT_WORK', label: 'Trabajo en Altura' },
  { value: 'EXCAVATION', label: 'Excavación' },
  { value: 'CHEMICAL', label: 'Químico' },
  { value: 'RADIATION', label: 'Radiación' },
  { value: 'GENERAL', label: 'General' },
]

export function WorkPermitsFilters({
  filters,
  onFiltersChange,
}: WorkPermitsFiltersProps) {
  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'ALL' ? undefined : value,
    })
  }

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      permitType: value === 'ALL' ? undefined : value,
    })
  }

  return (
    <div className="space-y-6 p-1">
      {/* Grid layout para filtros principales */}
      <div className="grid grid-cols-2 gap-4">
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

        {/* Type Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5" />
            Tipo
          </Label>
          <Select
            value={filters.permitType || 'ALL'}
            onValueChange={handleTypeChange}
          >
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

      {/* Active Filters Summary */}
      {(filters.status || filters.permitType) && (
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
            {filters.permitType && (
              <Badge variant="secondary" className="text-xs">
                {typeOptions.find((o) => o.value === filters.permitType)?.label}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

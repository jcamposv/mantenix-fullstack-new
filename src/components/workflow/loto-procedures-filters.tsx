/**
 * LOTO Procedures Filters Component
 *
 * Compact filtering UI for LOTO procedures (used inside FilterButton popover).
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
import type { LOTOProcedureFilters } from '@/hooks/use-loto-procedures'
import { Filter } from 'lucide-react'

interface LotoProceduresFiltersProps {
  filters: LOTOProcedureFilters
  onFiltersChange: (filters: LOTOProcedureFilters) => void
}

const statusOptions = [
  { value: 'ALL', label: 'Todos' },
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'PREPARED', label: 'Preparado' },
  { value: 'APPLIED', label: 'Aplicado' },
  { value: 'VERIFIED', label: 'Verificado' },
  { value: 'REMOVED', label: 'Removido' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

export function LotoProceduresFilters({
  filters,
  onFiltersChange,
}: LotoProceduresFiltersProps) {
  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'ALL' ? undefined : value,
    })
  }

  return (
    <div className="space-y-6 p-1">
      {/* Grid layout para filtros principales */}
      <div className="grid grid-cols-1 gap-4">
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
      </div>

      {/* Active Filters Summary */}
      {filters.status && (
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
          </div>
        </div>
      )}
    </div>
  )
}

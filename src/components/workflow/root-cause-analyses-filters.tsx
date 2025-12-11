/**
 * Root Cause Analyses Filters Component
 *
 * Compact filtering UI for root cause analyses (used inside FilterButton popover).
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
import type { RootCauseAnalysisFilters } from '@/hooks/use-root-cause-analyses'
import { Filter, Search } from 'lucide-react'

interface RootCauseAnalysesFiltersProps {
  filters: RootCauseAnalysisFilters
  onFiltersChange: (filters: RootCauseAnalysisFilters) => void
}

const statusOptions = [
  { value: 'ALL', label: 'Todos' },
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'IN_ANALYSIS', label: 'En Análisis' },
  { value: 'PENDING_REVIEW', label: 'Pendiente Revisión' },
  { value: 'APPROVED', label: 'Aprobado' },
  { value: 'IMPLEMENTED', label: 'Implementado' },
  { value: 'CLOSED', label: 'Cerrado' },
]

const typeOptions = [
  { value: 'ALL', label: 'Todos' },
  { value: 'FIVE_WHY', label: '5 Porqués' },
  { value: 'FISHBONE', label: 'Ishikawa/Fishbone' },
]

export function RootCauseAnalysesFilters({
  filters,
  onFiltersChange,
}: RootCauseAnalysesFiltersProps) {
  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'ALL' ? undefined : value,
    })
  }

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      analysisType: value === 'ALL' ? undefined : value,
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
            <Search className="h-3.5 w-3.5" />
            Tipo
          </Label>
          <Select
            value={filters.analysisType || 'ALL'}
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
      {(filters.status || filters.analysisType) && (
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
            {filters.analysisType && (
              <Badge variant="secondary" className="text-xs">
                {typeOptions.find((o) => o.value === filters.analysisType)?.label}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Approval Rules Filters Component
 *
 * Compact filtering UI for approval rules (used inside FilterButton popover).
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
import type { ApprovalRuleFilters } from '@/hooks/use-approval-rules'
import { Filter } from 'lucide-react'

interface ApprovalRulesFiltersProps {
  filters: ApprovalRuleFilters
  onFiltersChange: (filters: ApprovalRuleFilters) => void
}

const activeStatusOptions = [
  { value: 'ALL', label: 'Todos' },
  { value: 'true', label: 'Activas' },
  { value: 'false', label: 'Inactivas' },
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

export function ApprovalRulesFilters({
  filters,
  onFiltersChange,
}: ApprovalRulesFiltersProps) {
  const handleActiveStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      isActive: value === 'ALL' ? undefined : value === 'true',
    })
  }

  const handlePriorityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      priority: value === 'ALL' ? undefined : value,
    })
  }

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value === 'ALL' ? undefined : value,
    })
  }

  return (
    <div className="space-y-6 p-1">
      {/* Grid layout para filtros principales */}
      <div className="grid grid-cols-3 gap-4">
        {/* Active Status Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-3.5 w-3.5" />
            Estado
          </Label>
          <Select
            value={
              filters.isActive === undefined
                ? 'ALL'
                : filters.isActive
                  ? 'true'
                  : 'false'
            }
            onValueChange={handleActiveStatusChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activeStatusOptions.map((option) => (
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
            <Filter className="h-3.5 w-3.5" />
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

      {/* Active Filters Summary */}
      {(filters.isActive !== undefined ||
        filters.priority ||
        filters.type) && (
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-2">
            Filtros activos:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.isActive !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {
                  activeStatusOptions.find(
                    (o) =>
                      o.value ===
                      (filters.isActive === undefined
                        ? 'ALL'
                        : filters.isActive
                          ? 'true'
                          : 'false')
                  )?.label
                }
              </Badge>
            )}
            {filters.priority && (
              <Badge variant="secondary" className="text-xs">
                {priorityOptions.find((o) => o.value === filters.priority)?.label}
              </Badge>
            )}
            {filters.type && (
              <Badge variant="secondary" className="text-xs">
                {typeOptions.find((o) => o.value === filters.type)?.label}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

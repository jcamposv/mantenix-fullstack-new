/**
 * Authority Limits Filters Component
 *
 * Compact filtering UI for authority limits (used inside FilterButton popover).
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
import type { AuthorityLimitFilters } from '@/hooks/use-authority-limits'
import { Filter } from 'lucide-react'

interface AuthorityLimitsFiltersProps {
  filters: AuthorityLimitFilters
  onFiltersChange: (filters: AuthorityLimitFilters) => void
}

const activeStatusOptions = [
  { value: 'ALL', label: 'Todos' },
  { value: 'true', label: 'Activos' },
  { value: 'false', label: 'Inactivos' },
]

export function AuthorityLimitsFilters({
  filters,
  onFiltersChange,
}: AuthorityLimitsFiltersProps) {
  const handleActiveStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      isActive: value === 'ALL' ? undefined : value === 'true',
    })
  }

  return (
    <div className="space-y-6 p-1">
      {/* Grid layout para filtros principales */}
      <div className="grid grid-cols-1 gap-4">
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
      </div>

      {/* Active Filters Summary */}
      {filters.isActive !== undefined && (
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
          </div>
        </div>
      )}
    </div>
  )
}

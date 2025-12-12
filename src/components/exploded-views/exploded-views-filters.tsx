/**
 * Exploded Views Filters Component
 *
 * Compact filtering UI for exploded views (used inside FilterButton popover).
 *
 * Following Next.js Expert standards:
 * - Client component
 * - Type-safe props
 * - Clean composition
 * - Under 200 lines
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { EVViewFilters } from '@/hooks/use-ev-views'

interface ExplodedViewsFiltersProps {
  filters: EVViewFilters
  onFiltersChange: (filters: EVViewFilters) => void
}

export function ExplodedViewsFilters({
  filters,
  onFiltersChange,
}: ExplodedViewsFiltersProps) {
  const handleActiveChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      isActive: checked || undefined,
    })
  }

  return (
    <div className="space-y-6 p-1">
      {/* Active Checkbox */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={filters.isActive || false}
            onCheckedChange={handleActiveChange}
          />
          <label
            htmlFor="isActive"
            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Solo vistas activas
          </label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {filters.isActive && (
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-2">
            Filtros activos:
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs">
              Solo activas
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}

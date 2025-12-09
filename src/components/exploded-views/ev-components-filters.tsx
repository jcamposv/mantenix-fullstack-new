/**
 * EV Components Filters Component
 *
 * Compact filtering UI for exploded view components (used inside FilterButton popover).
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
import { EVComponentFilters } from '@/hooks/use-ev-components'

interface EVComponentsFiltersProps {
  filters: EVComponentFilters
  onFiltersChange: (filters: EVComponentFilters) => void
}

export function EVComponentsFilters({
  filters,
  onFiltersChange,
}: EVComponentsFiltersProps) {
  const handleActiveChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      isActive: checked || undefined,
    })
  }

  const handleInventoryChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      hasInventoryItem: checked || undefined,
    })
  }

  return (
    <div className="space-y-6 p-1">
      {/* Checkboxes */}
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
            Solo componentes activos
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasInventoryItem"
            checked={filters.hasInventoryItem || false}
            onCheckedChange={handleInventoryChange}
          />
          <label
            htmlFor="hasInventoryItem"
            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Solo con inventario vinculado
          </label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.isActive || filters.hasInventoryItem) && (
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-2">
            Filtros activos:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.isActive && (
              <Badge variant="secondary" className="text-xs">
                Solo activos
              </Badge>
            )}
            {filters.hasInventoryItem && (
              <Badge variant="secondary" className="text-xs">
                Con inventario
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

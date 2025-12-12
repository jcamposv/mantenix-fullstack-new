/**
 * SA Email Configs Filters Component
 *
 * Filter UI for super admin email configurations table.
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { SAEmailConfigFilters } from '@/hooks/use-sa-email-configs'

interface SAEmailConfigsFiltersProps {
  filters: SAEmailConfigFilters
  onFiltersChange: (filters: SAEmailConfigFilters) => void
}

export function SAEmailConfigsFilters({
  filters,
  onFiltersChange,
}: SAEmailConfigsFiltersProps) {
  const handleActiveChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      isActive: checked || undefined,
    })
  }

  return (
    <div className="space-y-6 p-1">
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Estado</h4>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={filters.isActive || false}
            onCheckedChange={handleActiveChange}
          />
          <label
            htmlFor="isActive"
            className="text-sm font-normal cursor-pointer"
          >
            Solo configuraciones activas
          </label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {filters.isActive && (
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground mb-2">
            Filtros activos:
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              Activas
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}

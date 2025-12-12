/**
 * SA Users Filters Component
 *
 * Filter UI for super admin users table.
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { SAUserFilters } from '@/hooks/use-sa-users'

interface SAUsersFiltersProps {
  filters: SAUserFilters
  onFiltersChange: (filters: SAUserFilters) => void
}

export function SAUsersFilters({
  filters,
  onFiltersChange,
}: SAUsersFiltersProps) {
  const handleVerifiedChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      emailVerified: checked || undefined,
    })
  }

  const handleExternalChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      isExternalUser: checked || undefined,
    })
  }

  return (
    <div className="space-y-6 p-1">
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Estado</h4>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="emailVerified"
            checked={filters.emailVerified || false}
            onCheckedChange={handleVerifiedChange}
          />
          <label
            htmlFor="emailVerified"
            className="text-sm font-normal cursor-pointer"
          >
            Solo usuarios verificados
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-sm">Tipo</h4>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isExternalUser"
            checked={filters.isExternalUser || false}
            onCheckedChange={handleExternalChange}
          />
          <label
            htmlFor="isExternalUser"
            className="text-sm font-normal cursor-pointer"
          >
            Solo usuarios externos
          </label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.emailVerified || filters.isExternalUser) && (
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground mb-2">
            Filtros activos:
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.emailVerified && (
              <Badge variant="secondary" className="text-xs">
                Verificados
              </Badge>
            )}
            {filters.isExternalUser && (
              <Badge variant="secondary" className="text-xs">
                Externos
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

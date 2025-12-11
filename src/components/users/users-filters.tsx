/**
 * Users Filters Component
 *
 * Filter UI for users table with role, verification status, and company filters.
 */

'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import type { UserManagementFilters } from '@/hooks/use-users-management'

interface UsersFiltersProps {
  filters: UserManagementFilters
  onFiltersChange: (filters: UserManagementFilters) => void
}

export function UsersFilters({ filters, onFiltersChange }: UsersFiltersProps) {
  const handleVerifiedChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      emailVerified: checked || undefined,
    })
  }

  return (
    <div className="space-y-6 p-1">
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Estado de Verificación</h4>
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

      {/* Active Filters Summary */}
      {(filters.emailVerified) && (
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
          </div>
        </div>
      )}
    </div>
  )
}

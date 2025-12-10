/**
 * SA Companies Filters Component
 *
 * Filter UI for super admin companies table.
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { SACompanyFilters } from '@/hooks/use-sa-companies'

interface SACompaniesFiltersProps {
  filters: SACompanyFilters
  onFiltersChange: (filters: SACompanyFilters) => void
}

export function SACompaniesFilters({
  filters,
  onFiltersChange,
}: SACompaniesFiltersProps) {
  const handleSubscriptionChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      hasSubscription: checked || undefined,
    })
  }

  return (
    <div className="space-y-6 p-1">
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Subscripción</h4>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasSubscription"
            checked={filters.hasSubscription || false}
            onCheckedChange={handleSubscriptionChange}
          />
          <label
            htmlFor="hasSubscription"
            className="text-sm font-normal cursor-pointer"
          >
            Solo empresas con subscripción activa
          </label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {filters.hasSubscription && (
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground mb-2">
            Filtros activos:
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              Con subscripción
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}

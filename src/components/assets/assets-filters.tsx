/**
 * Assets Filters Component
 *
 * Compact filtering UI for assets (used inside FilterButton popover).
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
import { Checkbox } from '@/components/ui/checkbox'
import { AssetManagementFilters, AssetStatus } from '@/hooks/use-assets-management'
import { Package, Filter } from 'lucide-react'

interface AssetsFiltersProps {
  filters: AssetManagementFilters
  onFiltersChange: (filters: AssetManagementFilters) => void
}

const statusOptions: { value: AssetStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'OPERATIVO', label: 'Operativo' },
  { value: 'EN_MANTENIMIENTO', label: 'En Mantenimiento' },
  { value: 'FUERA_DE_SERVICIO', label: 'Fuera de Servicio' },
]

export function AssetsFilters({
  filters,
  onFiltersChange,
}: AssetsFiltersProps) {
  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'ALL' ? undefined : (value as AssetStatus),
    })
  }

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      category: value === 'ALL' ? undefined : value,
    })
  }

  const handleActiveChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      isActive: checked || undefined,
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

        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Package className="h-3.5 w-3.5" />
            Categoría
          </Label>
          <Select
            value={filters.category || 'ALL'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              <SelectItem value="HVAC">HVAC</SelectItem>
              <SelectItem value="Eléctrico">Eléctrico</SelectItem>
              <SelectItem value="Mecánico">Mecánico</SelectItem>
              <SelectItem value="Hidráulico">Hidráulico</SelectItem>
              <SelectItem value="Neumático">Neumático</SelectItem>
              <SelectItem value="Estructural">Estructural</SelectItem>
              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Checkbox */}
      <div className="space-y-3 pt-2 border-t">
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
            Solo activos activos
          </label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.status || filters.category || filters.isActive) && (
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
            {filters.category && (
              <Badge variant="secondary" className="text-xs">
                {filters.category}
              </Badge>
            )}
            {filters.isActive && (
              <Badge variant="secondary" className="text-xs">
                Solo activos
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

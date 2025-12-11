/**
 * Inventory Items Filters Component
 *
 * Compact filtering UI for inventory items (used inside FilterButton popover).
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
import { InventoryItemManagementFilters } from '@/hooks/use-inventory-items-management'
import { Package } from 'lucide-react'

interface InventoryItemsFiltersProps {
  filters: InventoryItemManagementFilters
  onFiltersChange: (filters: InventoryItemManagementFilters) => void
}

const categoryOptions = [
  { value: 'ALL', label: 'Todas' },
  { value: 'Herramientas', label: 'Herramientas' },
  { value: 'Repuestos', label: 'Repuestos' },
  { value: 'Materiales', label: 'Materiales' },
  { value: 'Consumibles', label: 'Consumibles' },
  { value: 'Equipos', label: 'Equipos' },
  { value: 'EPP', label: 'EPP' },
  { value: 'Otro', label: 'Otro' },
]

export function InventoryItemsFilters({
  filters,
  onFiltersChange,
}: InventoryItemsFiltersProps) {
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
      <div className="grid grid-cols-1 gap-4">
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
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
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
            Solo ítems activos
          </label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.category || filters.isActive) && (
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-2">
            Filtros activos:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.category && (
              <Badge variant="secondary" className="text-xs">
                {categoryOptions.find((o) => o.value === filters.category)?.label}
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

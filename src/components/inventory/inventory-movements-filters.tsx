/**
 * Inventory Movements Filters Component
 *
 * Filter UI for inventory movements table with type filter.
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
import { MOVEMENT_TYPE_OPTIONS } from '@/schemas/inventory'
import type { InventoryMovementFilters, MovementType } from '@/hooks/use-inventory-movements'

interface InventoryMovementsFiltersProps {
  filters: InventoryMovementFilters
  onFiltersChange: (filters: InventoryMovementFilters) => void
}

export function InventoryMovementsFilters({
  filters,
  onFiltersChange,
}: InventoryMovementsFiltersProps) {
  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value === 'all' ? undefined : (value as MovementType),
    })
  }

  return (
    <div className="space-y-6 p-1">
      <div className="space-y-3">
        <Label htmlFor="type">Tipo de Movimiento</Label>
        <Select
          value={filters.type || 'all'}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Todos los tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {MOVEMENT_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Summary */}
      {filters.type && (
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground mb-2">
            Filtros activos:
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.type && (
              <Badge variant="secondary" className="text-xs">
                {MOVEMENT_TYPE_OPTIONS.find((t) => t.value === filters.type)?.label}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Inventory Requests Filters Component
 *
 * Filter UI for inventory requests table with status and urgency filters.
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
import { REQUEST_URGENCY_OPTIONS } from '@/schemas/inventory'
import type { InventoryRequestFilters, RequestUrgency } from '@/hooks/use-inventory-requests'
import type { InventoryRequestStatus } from '@/types/inventory.types'

interface InventoryRequestsFiltersProps {
  filters: InventoryRequestFilters
  onFiltersChange: (filters: InventoryRequestFilters) => void
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'APPROVED', label: 'Aprobado' },
  { value: 'REJECTED', label: 'Rechazado' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'PARTIALLY_DELIVERED', label: 'Parcialmente Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

export function InventoryRequestsFilters({
  filters,
  onFiltersChange,
}: InventoryRequestsFiltersProps) {
  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as InventoryRequestStatus),
    })
  }

  const handleUrgencyChange = (value: string) => {
    onFiltersChange({
      ...filters,
      urgency: value === 'all' ? undefined : (value as RequestUrgency),
    })
  }

  return (
    <div className="space-y-6 p-1">
      <div className="space-y-3">
        <Label htmlFor="status">Estado</Label>
        <Select
          value={filters.status || 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label htmlFor="urgency">Urgencia</Label>
        <Select
          value={filters.urgency || 'all'}
          onValueChange={handleUrgencyChange}
        >
          <SelectTrigger id="urgency">
            <SelectValue placeholder="Todas las urgencias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las urgencias</SelectItem>
            {REQUEST_URGENCY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Summary */}
      {(filters.status || filters.urgency) && (
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground mb-2">
            Filtros activos:
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.status && (
              <Badge variant="secondary" className="text-xs">
                {STATUS_OPTIONS.find((s) => s.value === filters.status)?.label}
              </Badge>
            )}
            {filters.urgency && (
              <Badge variant="secondary" className="text-xs">
                {REQUEST_URGENCY_OPTIONS.find((u) => u.value === filters.urgency)?.label}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

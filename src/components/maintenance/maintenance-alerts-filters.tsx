/**
 * Maintenance Alerts Filters Component
 *
 * Compact filtering UI for maintenance alerts (used inside FilterButton popover).
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
import { AlertManagementFilters } from '@/hooks/use-maintenance-alerts-management'
import { ComponentCriticality } from '@prisma/client'
import type { AlertSeverity, StockStatus } from '@/types/maintenance-alert.types'
import { AlertTriangle, Package, Clock } from 'lucide-react'

interface MaintenanceAlertsFiltersProps {
  filters: AlertManagementFilters
  onFiltersChange: (filters: AlertManagementFilters) => void
}

const severityOptions: { value: AlertSeverity; label: string }[] = [
  { value: 'CRITICAL', label: 'Crítico' },
  { value: 'WARNING', label: 'Advertencia' },
  { value: 'INFO', label: 'Información' },
]

const criticalityOptions: { value: ComponentCriticality; label: string }[] = [
  { value: 'A', label: 'A - Crítico' },
  { value: 'B', label: 'B - Importante' },
  { value: 'C', label: 'C - Normal' },
]

const stockStatusOptions: { value: StockStatus; label: string }[] = [
  { value: 'CRITICAL', label: 'Stock Crítico' },
  { value: 'LOW', label: 'Stock Bajo' },
  { value: 'SUFFICIENT', label: 'Stock Suficiente' },
]

const daysRangeOptions = [
  { value: '0-7', label: '0-7 días' },
  { value: '8-30', label: '8-30 días' },
  { value: '31-90', label: '31-90 días' },
  { value: '90+', label: 'Más de 90 días' },
]

export function MaintenanceAlertsFilters({
  filters,
  onFiltersChange,
}: MaintenanceAlertsFiltersProps) {

  const handleSeverityChange = (severity: string) => {
    const current = filters.severity || []
    const severityValue = severity as AlertSeverity

    const updated = current.includes(severityValue)
      ? current.filter((s) => s !== severityValue)
      : [...current, severityValue]

    onFiltersChange({
      ...filters,
      severity: updated.length > 0 ? updated : undefined,
    })
  }

  const handleCriticalityChange = (criticality: string) => {
    const current = filters.criticality || []
    const criticalityValue = criticality as ComponentCriticality

    const updated = current.includes(criticalityValue)
      ? current.filter((c) => c !== criticalityValue)
      : [...current, criticalityValue]

    onFiltersChange({
      ...filters,
      criticality: updated.length > 0 ? updated : undefined,
    })
  }

  const handleStockStatusChange = (status: string) => {
    const current = filters.stockStatus || []
    const statusValue = status as StockStatus

    const updated = current.includes(statusValue)
      ? current.filter((s) => s !== statusValue)
      : [...current, statusValue]

    onFiltersChange({
      ...filters,
      stockStatus: updated.length > 0 ? updated : undefined,
    })
  }

  const handleDaysRangeChange = (range: string) => {
    if (range === 'all') {
      onFiltersChange({
        ...filters,
        daysUntilMaintenance: undefined,
      })
      return
    }

    const [min, max] = range.split('-')
    onFiltersChange({
      ...filters,
      daysUntilMaintenance: {
        min: min ? parseInt(min) : undefined,
        max: max === '+' ? undefined : max ? parseInt(max) : undefined,
      },
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {/* Severity Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            Severidad
          </Label>
          <div className="flex flex-wrap gap-2">
            {severityOptions.map((option) => {
              const isSelected = filters.severity?.includes(option.value)
              return (
                <Badge
                  key={option.value}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/90"
                  onClick={() => handleSeverityChange(option.value)}
                >
                  {option.label}
                </Badge>
              )
            })}
          </div>
        </div>

        {/* Criticality Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Criticidad (ISO 14224)</Label>
          <div className="flex flex-wrap gap-2">
            {criticalityOptions.map((option) => {
              const isSelected = filters.criticality?.includes(option.value)
              return (
                <Badge
                  key={option.value}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/90"
                  onClick={() => handleCriticalityChange(option.value)}
                >
                  {option.label}
                </Badge>
              )
            })}
          </div>
        </div>

        {/* Stock Status Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Package className="h-3.5 w-3.5" />
            Estado del Stock
          </Label>
          <div className="flex flex-wrap gap-2">
            {stockStatusOptions.map((option) => {
              const isSelected = filters.stockStatus?.includes(option.value)
              return (
                <Badge
                  key={option.value}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/90"
                  onClick={() => handleStockStatusChange(option.value)}
                >
                  {option.label}
                </Badge>
              )
            })}
          </div>
        </div>

        {/* Days Range Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            Días hasta Falla
          </Label>
          <Select
            value={
              filters.daysUntilMaintenance
                ? `${filters.daysUntilMaintenance.min || 0}-${filters.daysUntilMaintenance.max || '+'}`
                : 'all'
            }
            onValueChange={handleDaysRangeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {daysRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

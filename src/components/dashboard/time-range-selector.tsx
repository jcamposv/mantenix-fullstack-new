/**
 * Time Range Filters Component
 *
 * Simple filter controls for time range (to be used inside FilterButton).
 * Consistent with existing filter pattern.
 *
 * Following Next.js Expert standards:
 * - Small focused component (< 200 lines)
 * - Type-safe
 */

'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Calendar } from 'lucide-react'
import type { DateRange as DateRangeType } from 'react-day-picker'

export type TimeRange = 'today' | 'week' | 'month' | 'last_month' | 'custom'

export interface DateRange {
  from: Date
  to: Date
}

interface TimeRangeFiltersProps {
  value: TimeRange
  dateRange?: DateRange
  onChange: (range: TimeRange, dates?: DateRange) => void
}

const TIME_RANGES = [
  { value: 'today' as const, label: 'Hoy' },
  { value: 'week' as const, label: 'Esta Semana' },
  { value: 'month' as const, label: 'Este Mes' },
  { value: 'last_month' as const, label: 'Último Mes' },
  { value: 'custom' as const, label: 'Personalizado' },
]

export function TimeRangeFilters({
  value,
  dateRange,
  onChange,
}: TimeRangeFiltersProps) {
  const handleRangeChange = (newRange: string) => {
    onChange(newRange as TimeRange)
  }

  const handleDateRangeChange = (range: DateRangeType | undefined) => {
    if (range?.from && range?.to) {
      onChange('custom', {
        from: range.from,
        to: range.to,
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Time Range Presets */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" />
          Período
        </Label>
        <Select value={value} onValueChange={handleRangeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Este Mes" />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom Date Range */}
      {value === 'custom' && (
        <div className="space-y-3 pt-2 border-t">
          <Label className="text-sm font-medium">Rango de Fechas</Label>
          <DateRangePicker
            value={{
              from: dateRange?.from,
              to: dateRange?.to,
            }}
            onChange={handleDateRangeChange}
            placeholder="Seleccionar fechas"
            className="w-full"
          />
        </div>
      )}
    </div>
  )
}

/**
 * Get label for current time range selection
 */
export function getTimeRangeLabel(
  timeRange: TimeRange,
  dateRange?: DateRange
): string {
  if (timeRange === 'custom' && dateRange) {
    return `${dateRange.from.toLocaleDateString('es')} - ${dateRange.to.toLocaleDateString('es')}`
  }
  return TIME_RANGES.find((r) => r.value === timeRange)?.label || 'Este Mes'
}

"use client"

import { useState, ReactNode } from "react"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface FilterButtonProps {
  /** Title shown in the popover header */
  title?: string
  /** Custom filter content to render inside the popover */
  children: ReactNode
  /** Whether there are active filters (changes button variant) */
  hasActiveFilters?: boolean
  /** Number of active filters to show in badge */
  activeFiltersCount?: number
  /** Callback when reset/clear button is clicked */
  onReset?: () => void
  /** Label for the reset button */
  resetLabel?: string
  /** Whether to show the reset button */
  showReset?: boolean
  /** Custom class name for the popover content */
  contentClassName?: string
  /** Popover alignment */
  align?: "start" | "center" | "end"
}

/**
 * FilterButton Component
 * Reusable filter button with popover for any type of filters
 *
 * @example
 * ```tsx
 * <FilterButton
 *   title="Filtros de Búsqueda"
 *   hasActiveFilters={hasFilters}
 *   activeFiltersCount={2}
 *   onReset={handleClearFilters}
 * >
 *   <div className="space-y-4">
 *     <DateRangePicker value={dateRange} onChange={setDateRange} />
 *     <Select value={status} onValueChange={setStatus}>
 *       // ... options
 *     </Select>
 *   </div>
 * </FilterButton>
 * ```
 *
 * Following nextjs-expert standards: < 200 lines, no 'any', proper TypeScript
 */
export function FilterButton({
  title = "Filtros",
  children,
  hasActiveFilters = false,
  activeFiltersCount = 0,
  onReset,
  resetLabel = "Limpiar",
  showReset = true,
  contentClassName = "w-96",
  align = "end",
}: FilterButtonProps) {
  const [open, setOpen] = useState<boolean>(false)

  const handleReset = () => {
    onReset?.()
    // Optionally close popover after reset
    // setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          className="relative h-9 gap-2"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filtros</span>
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`${contentClassName} p-0`} align={align}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <h4 className="font-semibold text-sm">{title}</h4>
          {showReset && hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {resetLabel}
            </Button>
          )}
        </div>
        <Separator />

        {/* Custom Filter Content */}
        <div className="p-4">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  )
}

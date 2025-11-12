"use client"

import { useState } from "react"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FilterOption {
  value: string
  label: string
  color?: string
}

interface FilterGroup {
  id: string
  label: string
  options: FilterOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
}

interface CalendarFilterButtonProps {
  filterGroups: FilterGroup[]
  onReset?: () => void
  hasActiveFilters?: boolean
}

/**
 * CalendarFilterButton
 * Reusable filter button with popover for calendars
 * Compact UI with badge indicator for active filters
 * Following nextjs-expert standards: < 200 lines, no 'any', proper TypeScript
 */
export function CalendarFilterButton({
  filterGroups,
  onReset,
  hasActiveFilters = false,
}: CalendarFilterButtonProps) {
  const [open, setOpen] = useState<boolean>(false)

  const handleToggleOption = (groupId: string, value: string): void => {
    const group = filterGroups.find((g) => g.id === groupId)
    if (!group) return

    const currentValues = group.selectedValues
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]

    group.onChange(newValues)
  }

  const activeFiltersCount = filterGroups.reduce(
    (count, group) => count + group.selectedValues.length,
    0
  )

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
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-3">
          <h4 className="font-semibold text-sm">Filtros</h4>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onReset?.()
              }}
              className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[420px]">
          <div className="p-4 space-y-4">
            {filterGroups.map((group, index) => (
              <div key={group.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">{group.label}</Label>
                  <div className="space-y-2.5">
                    {group.options.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`${group.id}-${option.value}`}
                          checked={group.selectedValues.includes(option.value)}
                          onCheckedChange={() =>
                            handleToggleOption(group.id, option.value)
                          }
                        />
                        <label
                          htmlFor={`${group.id}-${option.value}`}
                          className="flex items-center gap-2 text-sm cursor-pointer flex-1 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option.color && (
                            <div
                              className="h-3 w-3 rounded border shadow-sm"
                              style={{ backgroundColor: option.color }}
                            />
                          )}
                          <span>{option.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

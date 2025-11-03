"use client"

import * as React from "react"
import { CalendarIcon, X } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

export type DatePeriod = "today" | "this_week" | "this_month" | "last_month" | "last_3_months" | "this_year" | "last_year" | "custom"

interface DashboardFiltersProps {
  period: DatePeriod
  customDateRange: DateRange | undefined
  onPeriodChange: (period: DatePeriod) => void
  onCustomDateRangeChange: (range: DateRange | undefined) => void
}

export function DashboardFilters({
  period,
  customDateRange,
  onPeriodChange,
  onCustomDateRangeChange
}: DashboardFiltersProps) {
  const showCustomDatePicker = period === "custom"

  const handleClearFilters = () => {
    onPeriodChange("this_month")
    onCustomDateRangeChange(undefined)
  }

  const hasActiveFilters = period !== "this_month" || customDateRange

  return (
    <Card className="shadow-none">
      <CardContent className="pt-0">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Período:</span>
            </div>

            <Select value={period} onValueChange={(value) => onPeriodChange(value as DatePeriod)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="this_week">Esta Semana</SelectItem>
                <SelectItem value="this_month">Este Mes</SelectItem>
                <SelectItem value="last_month">Mes Pasado</SelectItem>
                <SelectItem value="last_3_months">Últimos 3 Meses</SelectItem>
                <SelectItem value="this_year">Este Año</SelectItem>
                <SelectItem value="last_year">Año Pasado</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            {showCustomDatePicker && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal min-w-[280px]",
                      !customDateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateRange?.from ? (
                      customDateRange.to ? (
                        <>
                          {format(customDateRange.from, "dd MMM yyyy", { locale: es })} -{" "}
                          {format(customDateRange.to, "dd MMM yyyy", { locale: es })}
                        </>
                      ) : (
                        format(customDateRange.from, "dd MMM yyyy", { locale: es })
                      )
                    ) : (
                      <span>Seleccionar rango de fechas</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={customDateRange?.from}
                    selected={customDateRange}
                    onSelect={onCustomDateRangeChange}
                    numberOfMonths={2}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-9"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { JSX } from "react"
import { getEventTypeLabel } from "@/schemas/calendar.schema"
import { getEventTypeColor } from "@/lib/calendar-colors"
import type { CalendarEventType } from "@/types/calendar.types"

/**
 * CalendarLegend Component
 * Horizontal legend showing all calendar event types
 * Calendar events are colored by TYPE only (not status)
 * Following nextjs-expert standards: < 200 lines, no 'any'
 */
export function CalendarLegend(): JSX.Element {
  // All calendar event types
  const eventTypes: CalendarEventType[] = [
    "PREVENTIVE_SCHEDULE",
    "PREVENTIVE_WO",
    "CORRECTIVE_WO",
    "REPAIR_WO",
    "INSPECTION",
    "PLANNED_SHUTDOWN",
    "METER_BASED_TRIGGER",
  ]

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs font-medium text-muted-foreground">Tipos de Evento:</span>
      {eventTypes.map((type) => {
        const colors = getEventTypeColor(type)
        const label = getEventTypeLabel(type)

        return (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded border shadow-sm flex-shrink-0"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
              }}
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

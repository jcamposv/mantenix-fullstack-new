"use client"

import { useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import listPlugin from "@fullcalendar/list"
import type {
  EventClickArg,
  DateSelectArg,
  EventContentArg,
  EventDropArg,
  DatesSetArg
} from "@fullcalendar/core"
import esLocale from "@fullcalendar/core/locales/es"
import { Loader2 } from "lucide-react"

export interface CalendarEvent {
  id: string
  title: string
  start: Date | string
  backgroundColor?: string
  borderColor?: string
  extendedProps?: Record<string, any>
}

interface BaseCalendarProps {
  events: CalendarEvent[]
  loading?: boolean
  onEventClick?: (info: EventClickArg) => void
  onDateSelect?: (selectInfo: DateSelectArg) => void
  onEventDrop?: (dropInfo: EventDropArg) => void
  onDatesSet?: (dateInfo: DatesSetArg) => void
  renderEventContent?: (eventInfo: EventContentArg) => React.ReactNode
  editable?: boolean
  selectable?: boolean
  initialView?: "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek"
}

/**
 * Base Calendar Component
 * Reusable wrapper around FullCalendar with common configuration
 */
export function BaseCalendar({
  events,
  loading = false,
  onEventClick,
  onDateSelect,
  onEventDrop,
  onDatesSet,
  renderEventContent,
  editable = false,
  selectable = false,
  initialView = "dayGridMonth"
}: BaseCalendarProps) {
  return (
    <div className="relative">
      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 right-4 z-10 bg-background/95 border rounded-md shadow-sm px-3 py-2 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Cargando...</span>
        </div>
      )}

      {/* Calendar container */}
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={initialView}
          locale={esLocale}

          // Header toolbar configuration
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
          }}

          // Event handlers
          datesSet={onDatesSet}
          eventClick={onEventClick}
          select={onDateSelect}
          eventDrop={onEventDrop}

          // Event configuration
          events={events}
          eventContent={renderEventContent}

          // Interaction
          editable={editable}
          selectable={selectable}
          selectMirror={true}
          dayMaxEvents={3}
          eventStartEditable={editable}
          eventDurationEditable={false}

          // Styling
          height="auto"
          aspectRatio={1.8}

          // Event display
          eventDisplay="block"
          displayEventTime={false}

          // Button text in Spanish
          buttonText={{
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            list: "Lista"
          }}

          // All-day slot text
          allDayText="Todo el día"

          // View configuration
          views={{
            dayGridMonth: {
              dayMaxEventRows: 3
            }
          }}
        />
      </div>

      {/* Common calendar styles */}
      <style jsx global>{`
        /* Cursor feedback */
        .calendar-container .fc-event {
          cursor: ${editable ? 'grab' : 'pointer'};
        }

        .calendar-container .fc-event:active {
          cursor: ${editable ? 'grabbing' : 'pointer'};
        }

        .calendar-container .fc-event:hover {
          opacity: 0.9;
        }

        /* Today highlight with shadcn accent color */
        .calendar-container .fc-day-today {
          background-color: hsl(var(--accent)) !important;
        }
      `}</style>
    </div>
  )
}

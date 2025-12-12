import type { CalendarEventType } from "@/types/calendar.types"

/**
 * Calendar Event Color Constants
 *
 * SINGLE SOURCE OF TRUTH for all calendar colors
 * Following nextjs-expert standards: DRY, type-safe, reusable, maintainable
 *
 * All components, schemas, services must import from this file
 * DO NOT duplicate color definitions anywhere else
 *
 * COLOR ARCHITECTURE:
 * - Calendar events: Colored by EVENT TYPE ONLY
 * - Status: NO colors (displayed as text labels)
 * - Priority: NO colors (displayed as text labels)
 */

export interface EventColor {
  bg: string
  border: string
  text: string
}

/**
 * Calendar Event Type Colors
 * ONLY colors in the entire calendar system
 * Each event type has a distinct, recognizable color
 */
export const CALENDAR_EVENT_COLORS: Record<CalendarEventType, EventColor> = {
  PREVENTIVE_SCHEDULE: {
    bg: "#3B82F6",      // blue-500
    border: "#2563EB",  // blue-600
    text: "#FFFFFF",
  },
  PREVENTIVE_WO: {
    bg: "#10B981",      // green-500
    border: "#059669",  // green-600
    text: "#FFFFFF",
  },
  CORRECTIVE_WO: {
    bg: "#EF4444",      // red-500
    border: "#DC2626",  // red-600
    text: "#FFFFFF",
  },
  REPAIR_WO: {
    bg: "#F59E0B",      // amber-500
    border: "#D97706",  // amber-600
    text: "#FFFFFF",
  },
  INSPECTION: {
    bg: "#06B6D4",      // cyan-500
    border: "#0891B2",  // cyan-600
    text: "#FFFFFF",
  },
  PLANNED_SHUTDOWN: {
    bg: "#78716C",      // stone-500
    border: "#57534E",  // stone-600
    text: "#FFFFFF",
  },
  METER_BASED_TRIGGER: {
    bg: "#EC4899",      // pink-500
    border: "#DB2777",  // pink-600
    text: "#FFFFFF",
  },
}

/**
 * Get calendar event color by type
 * ONLY function to get colors in the system
 *
 * @param eventType - The calendar event type
 * @returns EventColor object with bg, border, and text colors
 */
export function getCalendarEventColor(eventType: CalendarEventType): EventColor {
  return CALENDAR_EVENT_COLORS[eventType]
}

/**
 * Alias for backward compatibility with existing code
 * Prefer using getCalendarEventColor for new code
 */
export function getEventTypeColor(eventType: CalendarEventType): EventColor {
  return CALENDAR_EVENT_COLORS[eventType]
}

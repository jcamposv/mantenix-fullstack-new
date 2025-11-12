"use client"

import { useState } from "react"
import { OTCalendar, CalendarLegend, CalendarFiltersPanel, CalendarEventModal } from "@/components/calendar/ot-calendar"
import { useOTCalendarFilters } from "@/hooks/use-ot-calendar-filters"
import { useRouter } from "next/navigation"
import type { CalendarEvent } from "@/types/calendar.types"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Filter, Plus } from "lucide-react"

/**
 * Calendar Page
 * Unified calendar view for work orders and schedules
 *
 * Features:
 * - Displays both schedules and work orders
 * - Advanced filtering options
 * - Color-coded events by type and status
 * - Drag-and-drop rescheduling
 * - Quick event details modal
 * - Responsive design with mobile support
 *
 * Architecture:
 * - Client component for interactivity
 * - Uses custom hooks for state management
 * - Follows SOLID principles
 * - Proper TypeScript typing
 */
export default function CalendarPage() {
  const router = useRouter()
  const [refetchKey, setRefetchKey] = useState<number>(0)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false)

  // Filter management
  const {
    filters,
    setEventTypes,
    setStatuses,
    setPriorities,
    setShowCompleted,
    resetFilters,
    hasActiveFilters,
  } = useOTCalendarFilters()

  /**
   * Handle schedule click - show modal with schedule details
   */
  const handleScheduleClick = (scheduleId: string): void => {
    // In a real implementation, you would fetch the full schedule details
    // For now, we just navigate to a details page or show a modal
    console.log("Schedule clicked:", scheduleId)
    // router.push(`/schedules/${scheduleId}`)
  }

  /**
   * Handle date selection - create new work order or schedule
   */
  const handleDateSelect = (start: Date, end: Date): void => {
    console.log("Date selected:", start, end)
    // You can implement a modal to choose between creating a work order or schedule
    // For now, redirect to work order creation with pre-filled date
    // router.push(`/work-orders/new?scheduledDate=${start.toISOString()}`)
  }

  /**
   * Trigger calendar refetch
   */
  const handleRefetch = (): void => {
    setRefetchKey((prev) => prev + 1)
  }

  /**
   * Handle view details from modal
   */
  const handleViewDetails = (): void => {
    if (!selectedEvent) return

    const { type, workOrderId, scheduleId } = selectedEvent.extendedProps

    if (type === "workOrder" && workOrderId) {
      router.push(`/work-orders/${workOrderId}`)
    } else if (type === "schedule" && scheduleId) {
      router.push(`/schedules/${scheduleId}`)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendario de Órdenes de Trabajo</h1>
          <p className="text-sm text-muted-foreground">
            Vista unificada de programaciones y órdenes de trabajo
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter Sheet (Mobile) */}
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <CalendarFiltersPanel
                  selectedEventTypes={filters.eventTypes}
                  onEventTypesChange={setEventTypes}
                  selectedStatuses={filters.statuses}
                  onStatusesChange={setStatuses}
                  selectedPriorities={filters.priorities}
                  onPrioritiesChange={setPriorities}
                  showCompleted={filters.showCompleted}
                  onShowCompletedChange={setShowCompleted}
                  onResetFilters={resetFilters}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Create New Button */}
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Orden
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col gap-4 w-64 flex-shrink-0">
          <CalendarLegend />
          <CalendarFiltersPanel
            selectedEventTypes={filters.eventTypes}
            onEventTypesChange={setEventTypes}
            selectedStatuses={filters.statuses}
            onStatusesChange={setStatuses}
            selectedPriorities={filters.priorities}
            onPrioritiesChange={setPriorities}
            showCompleted={filters.showCompleted}
            onShowCompletedChange={setShowCompleted}
            onResetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>

        {/* Calendar */}
        <div className="flex-1 min-w-0">
          <OTCalendar
            onScheduleClick={handleScheduleClick}
            onDateSelect={handleDateSelect}
            refetchKey={refetchKey}
            initialFilters={filters}
            editable={true}
            selectable={true}
          />
        </div>
      </div>

      {/* Event Details Modal */}
      <CalendarEventModal
        event={selectedEvent}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onViewDetails={handleViewDetails}
      />
    </div>
  )
}

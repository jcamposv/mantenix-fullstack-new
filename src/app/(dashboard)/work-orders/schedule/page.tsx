"use client"

import { useState, JSX } from "react"
import { Plus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OTCalendar, CalendarLegend, CalendarFiltersPanel } from "@/components/calendar/ot-calendar"
import { ScheduleForm } from "@/components/work-order-schedule/schedule-form"
import { ScheduleDetailSheet } from "@/components/work-order-schedule/schedule-detail-sheet"
import { WorkOrderDetailSheet } from "@/components/work-orders/work-order-detail-sheet"
import { useDialogState } from "@/hooks/use-dialog-state"
import { useCalendarRefetch } from "@/hooks/use-calendar-refetch"
import { useOTCalendarFilters } from "@/hooks/use-ot-calendar-filters"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface DateRange {
  start: Date
  end: Date
}

/**
 * Work Order Schedule Page - UNIFIED CALENDAR
 * Displays both recurring schedules and generated work orders in one view
 *
 * Features:
 * - Unified calendar view with schedules and work orders
 * - Advanced filtering by type, status, priority, assets, sites
 * - Color-coded events
 * - Drag-and-drop rescheduling
 * - Create schedules by date selection
 * - Quick schedule details view
 *
 * Architecture:
 * - Uses new OTCalendar component
 * - Follows SOLID principles
 * - Proper TypeScript typing
 * - Custom hooks for state management
 */
export default function WorkOrderSchedulePage(): JSX.Element {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(null)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false)
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null)
  const [workOrderSheetOpen, setWorkOrderSheetOpen] = useState<boolean>(false)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  const [scheduleSheetOpen, setScheduleSheetOpen] = useState<boolean>(false)

  // Dialog state management
  const createDialog = useDialogState()
  const { triggerRefetch, refetchKey } = useCalendarRefetch()

  // Filter management
  const {
    filters,
    setEventTypes,
    setStatuses,
    setPriorities,
    setShowCompleted,
    resetFilters,
    hasActiveFilters,
  } = useOTCalendarFilters({
    // Default filters - show all
    eventTypes: [],
    statuses: [],
    priorities: [],
    assignedUserIds: [],
    assetIds: [],
    siteIds: [],
    showCompleted: true,
  })

  /**
   * Handle schedule event click - open detail sheet
   * Outlook-style: everything in one place
   */
  const handleScheduleClick = (scheduleId: string): void => {
    setSelectedScheduleId(scheduleId)
    setScheduleSheetOpen(true)
  }

  /**
   * Handle work order event click - open detail sheet
   * Outlook-style: everything in one place
   */
  const handleWorkOrderClick = (workOrderId: string): void => {
    setSelectedWorkOrderId(workOrderId)
    setWorkOrderSheetOpen(true)
  }

  /**
   * Handle date selection - create new schedule
   * Opens create dialog with selected date range
   */
  const handleDateSelect = (start: Date, end: Date): void => {
    setSelectedDateRange({ start, end })
    createDialog.open()
  }

  /**
   * Handle schedule creation success
   * Triggers calendar refetch and closes dialog
   */
  const handleCreateSuccess = (): void => {
    createDialog.close()
    setSelectedDateRange(null)
    triggerRefetch()
  }


  /**
   * Handle create dialog from button
   * Opens create dialog without date pre-selection
   */
  const handleCreateFromButton = (): void => {
    setSelectedDateRange(null)
    createDialog.open()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] gap-3">
      {/* Header - Compact */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight truncate">
            Calendario de Órdenes de Trabajo
          </h2>
          <p className="text-xs text-muted-foreground hidden md:block mt-0.5">
            Vista unificada de programaciones y órdenes de trabajo
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter Sheet (Mobile) */}
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden h-8">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">Filtros</span>
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

          {/* Create Button */}
          <Button onClick={handleCreateFromButton} size="sm" className="shrink-0 h-8">
            <Plus className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline text-xs">Nueva Programación</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col gap-3 w-64 flex-shrink-0 overflow-y-auto">
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

        {/* Calendar - New Unified OTCalendar */}
        <div className="flex-1 min-w-0">
          <OTCalendar
            onScheduleClick={handleScheduleClick}
            onWorkOrderClick={handleWorkOrderClick}
            onDateSelect={handleDateSelect}
            refetchKey={refetchKey}
            initialFilters={filters}
            editable={true}
            selectable={true}
            showDeleteButton={true}
          />
        </div>
      </div>

      {/* Work Order Detail Sheet - Outlook Style */}
      <WorkOrderDetailSheet
        workOrderId={selectedWorkOrderId}
        open={workOrderSheetOpen}
        onOpenChange={setWorkOrderSheetOpen}
        onSuccess={triggerRefetch}
      />

      {/* Schedule Detail Sheet - Outlook Style */}
      <ScheduleDetailSheet
        scheduleId={selectedScheduleId}
        open={scheduleSheetOpen}
        onOpenChange={setScheduleSheetOpen}
        onSuccess={triggerRefetch}
      />

      {/* Create Schedule Dialog */}
      <Dialog open={createDialog.isOpen} onOpenChange={createDialog.close}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Programación de Mantenimiento</DialogTitle>
            <DialogDescription>
              Configura una programación recurrente para generar órdenes de trabajo automáticamente
            </DialogDescription>
          </DialogHeader>
          <ScheduleForm
            initialDate={selectedDateRange?.start}
            onSuccess={handleCreateSuccess}
            onCancel={createDialog.close}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

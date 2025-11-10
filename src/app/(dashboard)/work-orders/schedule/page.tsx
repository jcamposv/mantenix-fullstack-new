"use client";

import { useState, JSX} from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkOrderCalendar } from '@/components/calendar/work-order-calendar';
import { ScheduleForm } from '@/components/work-order-schedule/schedule-form';
import { ScheduleDetails } from '@/components/work-order-schedule/schedule-details';
import { CalendarLegend } from '@/components/calendar/calendar-legend';
import { useDialogState } from '@/hooks/use-dialog-state';
import { useCalendarRefetch } from '@/hooks/use-calendar-refetch';
import {
  RECURRENCE_TYPE_LEGEND,
  WORK_ORDER_STATUS_LEGEND_DARK,
} from '@/lib/calendar-constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Work Order Schedule Page
 * Manages recurring work order schedules and displays upcoming generated orders
 * Follows SOLID principles with separated concerns via custom hooks
 */
export default function WorkOrderSchedulePage(): JSX.Element {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(null);

  // Use custom hooks for cleaner state management
  const detailDialog = useDialogState<string>();
  const createDialog = useDialogState();
  const { triggerRefetch, refetchKey } = useCalendarRefetch();

  /**
   * Handle event click - show schedule details
   * Opens detail dialog with selected schedule
   */
  const handleEventClick = (scheduleId: string): void => {
    detailDialog.open(scheduleId);
  };

  /**
   * Handle date selection - create new schedule
   * Opens create dialog with selected date range
   */
  const handleDateSelect = (start: Date, end: Date): void => {
    setSelectedDateRange({ start, end });
    createDialog.open();
  };

  /**
   * Handle schedule creation success
   * Triggers calendar refetch and closes dialog
   */
  const handleCreateSuccess = (): void => {
    createDialog.close();
    setSelectedDateRange(null);
    triggerRefetch();
  };

  /**
   * Handle schedule deletion
   * Triggers calendar refetch and closes dialog
   */
  const handleDeleteSuccess = (): void => {
    detailDialog.close();
    triggerRefetch();
  };

  /**
   * Handle create dialog from button
   * Opens create dialog without date pre-selection
   */
  const handleCreateFromButton = (): void => {
    setSelectedDateRange(null);
    createDialog.open();
  };

  return (
    <div className="space-y-3">
      {/* Header - Ultra compact */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight truncate">
            Programación de Mantenimiento
          </h2>
          <p className="text-xs text-muted-foreground hidden md:block mt-0.5">
            Calendario de órdenes de trabajo recurrentes y mantenimiento preventivo
          </p>
        </div>
        <Button onClick={handleCreateFromButton} size="sm" className="shrink-0 h-8">
          <Plus className="h-3.5 w-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline text-xs">Nueva Programación</span>
        </Button>
      </div>

      {/* Legend - Ultra compact */}
      <div className="space-y-1.5">
        <CalendarLegend
          title="📅 Programaciones:"
          items={RECURRENCE_TYPE_LEGEND}
        />
        <CalendarLegend
          title="🔧 Órdenes generadas:"
          items={WORK_ORDER_STATUS_LEGEND_DARK}
        />
      </div>

      {/* Calendar */}
      <WorkOrderCalendar
        onEventClick={handleEventClick}
        onDateSelect={handleDateSelect}
        refetchKey={refetchKey}
      />

      {/* Schedule Detail Dialog */}
      <Dialog open={detailDialog.isOpen} onOpenChange={detailDialog.close}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Programación</DialogTitle>
            <DialogDescription>
              Información y configuración de la programación de mantenimiento
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {detailDialog.data && (
              <ScheduleDetails
                scheduleId={detailDialog.data}
                onDelete={handleDeleteSuccess}
                onClose={detailDialog.close}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

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
  );
}

"use client";

import { useState,  JSX} from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkOrdersCalendar } from '@/components/calendar/work-orders-calendar';
import { WorkOrderQuickPreview } from '@/components/work-orders/work-order-quick-preview';
import { QuickCreateWorkOrder } from '@/components/work-orders/quick-create-work-order';
import { CalendarLegend } from '@/components/calendar/calendar-legend';
import { useDialogState } from '@/hooks/use-dialog-state';
import { useCalendarRefetch } from '@/hooks/use-calendar-refetch';
import { WORK_ORDER_STATUS_LEGEND } from '@/lib/calendar-constants';

/**
 * Work Orders Calendar Page
 * Displays all work orders in a calendar view with ability to create and preview
 * Follows SOLID principles with separated concerns via custom hooks
 */
export default function WorkOrdersCalendarPage(): JSX.Element {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Use custom hooks for cleaner state management
  const previewDialog = useDialogState<string>();
  const createDialog = useDialogState();
  const { triggerRefetch, refetchKey } = useCalendarRefetch();

  /**
   * Handle work order event click
   * Opens preview dialog with selected work order
   */
  const handleEventClick = (workOrderId: string): void => {
    previewDialog.open(workOrderId);
  };

  /**
   * Handle date selection
   * Opens create dialog with selected date
   */
  const handleDateSelect = (date: Date): void => {
    setSelectedDate(date);
    createDialog.open();
  };

  /**
   * Handle create button click
   * Navigates to template selection
   */
  const handleCreateFromButton = (): void => {
    router.push('/work-orders/new/select-template');
  };

  /**
   * Handle successful work order creation
   * Triggers calendar refetch and closes dialog
   */
  const handleCreateSuccess = (): void => {
    triggerRefetch();
    createDialog.close();
    setSelectedDate(null);
  };

  return (
    <div className="space-y-3">
      {/* Header - Ultra compact */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight truncate">
            Calendario de Órdenes de Trabajo
          </h2>
          <p className="text-xs text-muted-foreground hidden md:block mt-0.5">
            Vista de calendario de todas las órdenes de trabajo existentes
          </p>
        </div>
        <Button onClick={handleCreateFromButton} size="sm" className="shrink-0 h-8">
          <Plus className="h-3.5 w-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline text-xs">Crear Orden</span>
        </Button>
      </div>

      {/* Legend - Ultra compact */}
      <CalendarLegend items={WORK_ORDER_STATUS_LEGEND} />

      {/* Calendar */}
      <WorkOrdersCalendar
        onEventClick={handleEventClick}
        onCreateNew={handleDateSelect}
        refetchKey={refetchKey}
      />

      {/* Quick Preview Modal */}
      <WorkOrderQuickPreview
        workOrderId={previewDialog.data}
        open={previewDialog.isOpen}
        onOpenChange={previewDialog.close}
      />

      {/* Quick Create Modal */}
      <QuickCreateWorkOrder
        open={createDialog.isOpen}
        onOpenChange={createDialog.close}
        selectedDate={selectedDate}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}

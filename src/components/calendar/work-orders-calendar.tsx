"use client";

import { useState, useCallback, JSX } from 'react';
import type {
  EventClickArg,
  DateSelectArg,
  EventContentArg,
  DatesSetArg,
} from '@fullcalendar/core';
import { toast } from 'sonner';
import { BaseCalendar, type CalendarEvent } from './base-calendar';

interface WorkOrdersCalendarProps {
  /**
   * Callback when a work order event is clicked
   * @param workOrderId - ID of the clicked work order
   */
  onEventClick?: (workOrderId: string) => void;
  /**
   * Callback when a date is selected for creating a new work order
   * @param selectedDate - Selected date
   */
  onCreateNew?: (selectedDate: Date) => void;
  /**
   * Key to trigger refetch of calendar data
   * When this changes, calendar will refetch
   */
  refetchKey?: number;
}

/**
 * WorkOrdersCalendar Component
 * Displays work orders in a calendar view with ability to create and view details
 * Follows Single Responsibility Principle by focusing only on calendar display
 */
export function WorkOrdersCalendar({
  onEventClick,
  onCreateNew,
  refetchKey,
}: WorkOrdersCalendarProps): JSX.Element {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch work orders from API based on date range
   * Automatically called when the calendar view changes
   *
   * @param start - Start date of the visible range
   * @param end - End date of the visible range
   */
  const fetchWorkOrders = useCallback(async (start: Date, end: Date): Promise<void> => {
    try {
      setLoading(true);
      const startISO = start.toISOString();
      const endISO = end.toISOString();

      const response = await fetch(
        `/api/work-orders/calendar?startDate=${startISO}&endDate=${endISO}`
      );

      if (!response.ok) {
        throw new Error('Error al cargar órdenes de trabajo');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching calendar work orders:', error);
      toast.error('Error al cargar el calendario');
    } finally {
      setLoading(false);
    }
  }, [refetchKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Handle FullCalendar date set (when view changes or month changes)
   * Uses proper TypeScript typing instead of any
   *
   * @param info - FullCalendar dates set information
   */
  const handleDatesSet = useCallback((info: DatesSetArg): void => {
    fetchWorkOrders(info.start, info.end);
  }, [fetchWorkOrders]);

  /**
   * Handle event click
   * Prevents default and triggers callback with work order ID
   *
   * @param info - FullCalendar event click information
   */
  const handleEventClick = useCallback((info: EventClickArg): void => {
    info.jsEvent.preventDefault();
    const workOrderId = info.event.extendedProps.workOrderId as string | undefined;
    if (onEventClick && workOrderId) {
      onEventClick(workOrderId);
    }
  }, [onEventClick]);

  /**
   * Handle date selection (for creating new work orders)
   * Triggered when user selects a date or date range
   *
   * @param selectInfo - FullCalendar date selection information
   */
  const handleDateSelect = useCallback((selectInfo: DateSelectArg): void => {
    if (onCreateNew) {
      onCreateNew(selectInfo.start);
    }
  }, [onCreateNew]);

  /**
   * Custom event content renderer
   * Displays work order information in calendar cells
   *
   * @param eventInfo - FullCalendar event content information
   * @returns JSX element for event display
   */
  const renderEventContent = useCallback((eventInfo: EventContentArg): JSX.Element => {
    const props = eventInfo.event.extendedProps;

    return (
      <div className="flex flex-col gap-0.5 p-1 overflow-hidden text-white">
        <div className="font-medium text-xs truncate leading-tight">
          {(props.number as string) || eventInfo.event.title}
        </div>
        {props.assetName && (
          <div className="text-[10px] opacity-90 truncate leading-tight">
            {props.assetName as string}
          </div>
        )}
        {props.assignedTo && (
          <div className="text-[10px] opacity-75 leading-tight truncate">
            {props.assignedTo as string}
          </div>
        )}
      </div>
    );
  }, []);

  return (
    <BaseCalendar
      events={events}
      loading={loading}
      onEventClick={handleEventClick}
      onDateSelect={handleDateSelect}
      onDatesSet={handleDatesSet}
      renderEventContent={renderEventContent}
      selectable={true}
    />
  )
}

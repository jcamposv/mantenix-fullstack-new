"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type {
  EventClickArg,
  DateSelectArg,
  EventContentArg,
  EventDropArg,
  DatesSetArg,
} from '@fullcalendar/core';
import { toast } from 'sonner';
import { BaseCalendar, type CalendarEvent } from './base-calendar';
import { getStatusLabel } from '@/lib/calendar-utils';

interface WorkOrderCalendarProps {
  /**
   * Callback when a schedule event is clicked
   * @param scheduleId - ID of the clicked schedule
   */
  onEventClick?: (scheduleId: string) => void;
  /**
   * Callback when a date range is selected for creating a new schedule
   * @param start - Start date
   * @param end - End date
   */
  onDateSelect?: (start: Date, end: Date) => void;
  /**
   * Key to trigger refetch of calendar data
   * When this changes, calendar will refetch
   */
  refetchKey?: number;
}

/**
 * WorkOrderCalendar Component
 * Displays work order schedules and generated work orders in a calendar view
 * Supports drag-and-drop for rescheduling
 * Follows Single Responsibility Principle
 */
export function WorkOrderCalendar({
  onEventClick,
  onDateSelect,
  refetchKey,
}: WorkOrderCalendarProps): JSX.Element {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch events from API based on date range
   * Fetches both schedules and generated work orders
   *
   * @param start - Start date of the visible range
   * @param end - End date of the visible range
   */
  const fetchEvents = useCallback(async (start: Date, end: Date): Promise<void> => {
    try {
      setLoading(true);
      const startISO = start.toISOString();
      const endISO = end.toISOString();

      const response = await fetch(
        `/api/work-order-schedules/upcoming?startDate=${startISO}&endDate=${endISO}`
      );

      if (!response.ok) {
        throw new Error('Error al cargar programaciones');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
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
    fetchEvents(info.start, info.end);
  }, [fetchEvents]);

  /**
   * Handle event click
   * Can be either a schedule or a work order
   * Uses Next.js router instead of window.location
   *
   * @param info - FullCalendar event click information
   */
  const handleEventClick = useCallback((info: EventClickArg): void => {
    info.jsEvent.preventDefault();
    const props = info.event.extendedProps;

    // Check if it's a work order or schedule
    if (props.type === 'workOrder' && props.workOrderId) {
      // Navigate to work order detail using Next.js router
      router.push(`/work-orders/${props.workOrderId as string}`);
    } else if (props.type === 'schedule' && props.scheduleId) {
      // Show schedule details (existing behavior)
      if (onEventClick) {
        onEventClick(props.scheduleId as string);
      }
    }
  }, [onEventClick, router]);

  /**
   * Handle date selection (for creating new schedules)
   * Triggered when user selects a date or date range
   *
   * @param selectInfo - FullCalendar date selection information
   */
  const handleDateSelect = useCallback((selectInfo: DateSelectArg): void => {
    if (onDateSelect) {
      onDateSelect(selectInfo.start, selectInfo.end);
    }
  }, [onDateSelect]);

  /**
   * Handle event drag and drop
   * Allows rescheduling by dragging schedule events
   *
   * @param dropInfo - FullCalendar event drop information
   */
  const handleEventDrop = useCallback(async (dropInfo: EventDropArg): Promise<void> => {
    const scheduleId = dropInfo.event.extendedProps.scheduleId as string | undefined;
    const newDate = dropInfo.event.start;

    if (!scheduleId || !newDate) {
      dropInfo.revert();
      return;
    }

    try {
      // Update next generation date via API
      const response = await fetch(`/api/work-order-schedules/${scheduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nextGenerationDate: newDate.toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar fecha');
      }

      toast.success('Fecha actualizada exitosamente');
    } catch (error) {
      console.error('Error updating schedule date:', error);
      toast.error('Error al cambiar la fecha');
      dropInfo.revert(); // Revert the event to its original position
    }
  }, []);

  /**
   * Custom event content renderer
   * Different display for schedules vs work orders
   *
   * @param eventInfo - FullCalendar event content information
   * @returns JSX element for event display
   */
  const renderEventContent = useCallback((eventInfo: EventContentArg): JSX.Element => {
    const props = eventInfo.event.extendedProps;

    // Different rendering for schedules vs work orders
    if (props.type === 'workOrder') {
      return (
        <div className="flex flex-col gap-0.5 p-1 overflow-hidden text-white">
          <div className="font-medium text-xs truncate leading-tight">
            {props.number as string}
          </div>
          {props.assetName && (
            <div className="text-[10px] opacity-90 truncate leading-tight">
              {props.assetName as string}
            </div>
          )}
          <div className="text-[10px] opacity-75 leading-tight">
            {getStatusLabel(props.status as string)}
          </div>
        </div>
      );
    }

    // Schedule rendering
    return (
      <div className="flex flex-col gap-0.5 p-1 overflow-hidden text-white">
        <div className="font-medium text-xs truncate leading-tight">
          {eventInfo.event.title}
        </div>
        {props.assetName && (
          <div className="text-[10px] opacity-90 truncate leading-tight">
            {props.assetName as string}
          </div>
        )}
        {props.completionRate !== undefined && (
          <div className="text-[10px] opacity-75 leading-tight">
            {(props.completionRate as number).toFixed(0)}% completado
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
      onEventDrop={handleEventDrop}
      onDatesSet={handleDatesSet}
      renderEventContent={renderEventContent}
      editable={true}
      selectable={true}
    />
  )
}

/**
 * CalendarLegend Component
 * Reusable legend component for displaying color-coded information
 * Optimized for space efficiency
 */

import type { LegendItem } from '@/lib/calendar-constants';

interface CalendarLegendProps {
  title?: string;
  items: readonly LegendItem[];
}

/**
 * Displays a compact legend with color-coded items
 * Used for showing status or recurrence type information in calendars
 * Optimized for minimal vertical space usage
 */
export function CalendarLegend({ title, items }: CalendarLegendProps): JSX.Element {
  return (
    <div className="space-y-1.5">
      {title && <p className="text-xs font-medium text-muted-foreground">{title}</p>}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        {items.map((item) => (
          <div key={item.value} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${item.color} shrink-0`} />
            <span className="whitespace-nowrap">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

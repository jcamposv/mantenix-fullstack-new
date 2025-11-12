import { Skeleton } from "@/components/ui/skeleton"

export function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-2 text-center border-r last:border-r-0">
              <Skeleton className="h-4 w-12 mx-auto" />
            </div>
          ))}
        </div>

        {/* Calendar days */}
        {Array.from({ length: 5 }).map((_, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
            {Array.from({ length: 7 }).map((_, dayIndex) => (
              <div
                key={dayIndex}
                className="min-h-[100px] p-2 border-r last:border-r-0 space-y-1"
              >
                <Skeleton className="h-4 w-6" />
                {/* Random events in some cells */}
                {(weekIndex * 7 + dayIndex) % 3 === 0 && (
                  <>
                    <Skeleton className="h-6 w-full" />
                    {(weekIndex + dayIndex) % 5 === 0 && (
                      <Skeleton className="h-6 w-full" />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

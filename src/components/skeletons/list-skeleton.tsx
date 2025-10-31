import { Skeleton } from "@/components/ui/skeleton"

interface ListItemSkeletonProps {
  showAvatar?: boolean
  showSecondaryText?: boolean
  showActions?: boolean
}

export function ListItemSkeleton({
  showAvatar = false,
  showSecondaryText = true,
  showActions = false
}: ListItemSkeletonProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3 flex-1">
        {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          {showSecondaryText && <Skeleton className="h-3 w-1/2" />}
        </div>
      </div>
      {showActions && (
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      )}
    </div>
  )
}

interface ListSkeletonProps {
  items?: number
  showAvatar?: boolean
  showSecondaryText?: boolean
  showActions?: boolean
}

export function ListSkeleton({
  items = 5,
  showAvatar = false,
  showSecondaryText = true,
  showActions = false
}: ListSkeletonProps) {
  return (
    <div className="rounded-md border">
      {Array.from({ length: items }).map((_, i) => (
        <ListItemSkeleton
          key={i}
          showAvatar={showAvatar}
          showSecondaryText={showSecondaryText}
          showActions={showActions}
        />
      ))}
    </div>
  )
}

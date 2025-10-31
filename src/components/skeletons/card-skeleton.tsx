import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface CardSkeletonProps {
  showFooter?: boolean
  showHeader?: boolean
}

export function CardSkeleton({
  showFooter = false,
  showHeader = true
}: CardSkeletonProps) {
  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
      {showFooter && (
        <CardFooter className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      )}
    </Card>
  )
}

interface CardListSkeletonProps {
  count?: number
  showFooter?: boolean
  showHeader?: boolean
}

export function CardListSkeleton({
  count = 3,
  showFooter = false,
  showHeader = true
}: CardListSkeletonProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} showFooter={showFooter} showHeader={showHeader} />
      ))}
    </div>
  )
}

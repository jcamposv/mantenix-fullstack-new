import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

interface FormSkeletonProps {
  fields?: number
  showTitle?: boolean
  showFooter?: boolean
}

export function FormSkeleton({
  fields = 4,
  showTitle = true,
  showFooter = true
}: FormSkeletonProps) {
  return (
    <Card className="shadow-none border-none">
      {showTitle && (
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </CardContent>
      {showFooter && (
        <CardFooter className="flex gap-2 justify-end">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      )}
    </Card>
  )
}

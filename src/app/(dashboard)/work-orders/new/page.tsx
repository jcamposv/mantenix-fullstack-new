import { Suspense } from "react"
import { NewWorkOrderContent } from "@/components/work-orders/new-work-order-content"

function LoadingFallback() {
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-32 bg-muted rounded" />
        <div className="h-24 bg-muted rounded" />
      </div>
    </div>
  )
}

export default function NewWorkOrderPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewWorkOrderContent />
    </Suspense>
  )
}
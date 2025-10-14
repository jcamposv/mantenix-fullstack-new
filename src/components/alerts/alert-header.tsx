import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { getPriorityBadge, getStatusBadge } from "./alert-badges"
import type { Alert } from "./alert-detail-types"

interface AlertHeaderProps {
  alert: Alert
}

export function AlertHeader({ alert }: AlertHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/alerts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a alertas
          </Button>
        </Link>
        <Link href={`/alerts/${alert.id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {getPriorityBadge(alert.priority)}
          {getStatusBadge(alert.status)}
        </div>
        <h1 className="text-2xl font-bold">{alert.title}</h1>
        <p className="text-muted-foreground">{alert.description}</p>
      </div>
    </div>
  )
}
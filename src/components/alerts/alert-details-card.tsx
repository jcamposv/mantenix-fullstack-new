import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import type { Alert } from "./alert-detail-types"

interface AlertDetailsCardProps {
  alert: Alert
}

export function AlertDetailsCard({ alert }: AlertDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Sede:</span>
            <span>{alert.site.name}</span>
          </div>

          {alert.location && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Ubicación:</span>
              <span>{alert.location}</span>
            </div>
          )}

          {alert.equipmentId && (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 text-muted-foreground">🔧</div>
              <span className="font-medium">Equipo:</span>
              <span>{alert.equipmentId}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Reportada:</span>
            <span>{format(new Date(alert.reportedAt), "dd/MM/yyyy HH:mm")}</span>
          </div>

          {alert.resolvedAt && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium">Resuelta:</span>
              <span>{format(new Date(alert.resolvedAt), "dd/MM/yyyy HH:mm")}</span>
            </div>
          )}

          {alert.estimatedResolutionTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Tiempo estimado:</span>
              <span>{alert.estimatedResolutionTime}h</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
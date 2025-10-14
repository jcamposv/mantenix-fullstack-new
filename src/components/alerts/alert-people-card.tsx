import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/components/sidebar/sidebar-utils"
import type { Alert } from "./alert-detail-types"

interface AlertPeopleCardProps {
  alert: Alert
}

export function AlertPeopleCard({ alert }: AlertPeopleCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {getInitials(alert.reportedBy.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">{alert.reportedBy.name}</p>
              <p className="text-xs text-muted-foreground">Reportó la alerta</p>
            </div>
          </div>

          {alert.assignedTo && (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {getInitials(alert.assignedTo.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-sm">{alert.assignedTo.name}</p>
                <p className="text-xs text-muted-foreground">Asignado</p>
              </div>
            </div>
          )}

          {alert.resolvedBy && (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {getInitials(alert.resolvedBy.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-sm">{alert.resolvedBy.name}</p>
                <p className="text-xs text-muted-foreground">Resolvió la alerta</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
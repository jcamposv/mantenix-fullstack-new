import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Building,
  Box,
  ClipboardList,
  Calendar,
  MapPin
} from "lucide-react"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

interface WorkOrderDetailsProps {
  workOrder: WorkOrderWithRelations
}

export function WorkOrderDetails({ workOrder }: WorkOrderDetailsProps) {

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Site Information */}
      {workOrder.site && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Información de la Sede</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="text-sm font-medium">{workOrder.site.name}</p>
            </div>
            {workOrder.site.address && (
              <div>
                <p className="text-xs text-muted-foreground">Dirección</p>
                <p className="text-sm font-medium flex items-start gap-2">
                  <MapPin className="h-3 w-3 mt-1 text-muted-foreground" />
                  {workOrder.site.address}
                </p>
              </div>
            )}
            {workOrder.site.clientCompany && (
              <div>
                <p className="text-xs text-muted-foreground">Empresa</p>
                <p className="text-sm font-medium">
                  {workOrder.site.clientCompany.name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Asset Information */}
      {workOrder.asset && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Box className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Activo/Equipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="text-sm font-medium">{workOrder.asset.name}</p>
            </div>
            {workOrder.asset.code && (
              <div>
                <p className="text-xs text-muted-foreground">Código</p>
                <p className="text-sm font-medium">{workOrder.asset.code}</p>
              </div>
            )}
            {workOrder.asset.manufacturer && (
              <div>
                <p className="text-xs text-muted-foreground">Fabricante</p>
                <p className="text-sm font-medium">{workOrder.asset.manufacturer}</p>
              </div>
            )}
            {workOrder.asset.model && (
              <div>
                <p className="text-xs text-muted-foreground">Modelo</p>
                <p className="text-sm font-medium">{workOrder.asset.model}</p>
              </div>
            )}
            {workOrder.asset.status && (
              <div>
                <p className="text-xs text-muted-foreground">Estado</p>
                <Badge variant="outline">{workOrder.asset.status}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {workOrder.instructions && (
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Instrucciones de Trabajo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {workOrder.instructions}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Completion Notes */}
      {workOrder.completionNotes && (
        <Card className="md:col-span-2 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-green-900">
              Notas de Finalización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-900/80 whitespace-pre-wrap">
              {workOrder.completionNotes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Observations */}
      {workOrder.observations && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {workOrder.observations}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dates */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Fechas Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Creada</p>
            <p className="text-sm font-medium">
              {new Date(workOrder.createdAt).toLocaleString('es-ES')}
            </p>
          </div>
          {workOrder.scheduledDate && (
            <div>
              <p className="text-xs text-muted-foreground">Programada</p>
              <p className="text-sm font-medium">
                {new Date(workOrder.scheduledDate).toLocaleString('es-ES')}
              </p>
            </div>
          )}
          {workOrder.startedAt && (
            <div>
              <p className="text-xs text-muted-foreground">Iniciada</p>
              <p className="text-sm font-medium">
                {new Date(workOrder.startedAt).toLocaleString('es-ES')}
              </p>
            </div>
          )}
          {workOrder.completedAt && (
            <div>
              <p className="text-xs text-muted-foreground">Completada</p>
              <p className="text-sm font-medium">
                {new Date(workOrder.completedAt).toLocaleString('es-ES')}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Última Actualización</p>
            <p className="text-sm font-medium">
              {new Date(workOrder.updatedAt).toLocaleString('es-ES')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

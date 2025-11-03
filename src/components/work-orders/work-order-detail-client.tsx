"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Printer } from "lucide-react"
import { WorkOrderConsolidatedInfo } from "./work-order-consolidated-info"
import { WorkOrderToolsMaterials } from "./work-order-tools-materials"
import { WorkOrderCustomFieldsDisplay } from "./work-order-custom-fields-display"
import { PrintableWorkOrder } from "./printable-work-order"
import type { WorkOrderWithRelations } from "@/types/work-order.types"
import type { CustomFieldsConfig } from "@/schemas/work-order-template"

interface WorkOrderDetailClientProps {
  workOrder: WorkOrderWithRelations
  companyInfo?: {
    name: string
    logo: string | null
  }
}

export function WorkOrderDetailClient({ workOrder, companyInfo }: WorkOrderDetailClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const printRef = useRef<HTMLDivElement>(null)
  const shouldPrint = searchParams.get('print') === 'true'

  // Auto-print when shouldPrint is true
  useEffect(() => {
    if (shouldPrint) {
      setTimeout(() => {
        window.print()
      }, 1000)
    }
  }, [shouldPrint])

  const handlePrint = () => {
    window.print()
  }

  const customFieldValues = workOrder.customFieldValues as Record<string, unknown> || {}

  return (
    <div className="py-6">
      <div className="mb-6 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{workOrder.number}</h1>
            <p className="text-muted-foreground">{workOrder.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button onClick={() => router.push(`/work-orders/${workOrder.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 print:hidden">
        {/* Consolidated Info Card */}
        <WorkOrderConsolidatedInfo workOrder={workOrder} />

        <WorkOrderToolsMaterials workOrder={workOrder} />

        {/* Custom Fields - Each field has its own card */}
        {Object.keys(customFieldValues).length > 0 && (
          <WorkOrderCustomFieldsDisplay
            customFields={workOrder.template?.customFields as { fields: NonNullable<CustomFieldsConfig['fields']> }}
            customFieldValues={customFieldValues}
          />
        )}

        {/* Metadata */}
        <Card className="shadow-none">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg font-semibold">Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Creado por</label>
                <p className="text-sm font-medium">{workOrder.creator?.name || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fecha de creación</label>
                <p className="text-sm font-medium">
                  {new Date(workOrder.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Última actualización</label>
                <p className="text-sm font-medium">
                  {new Date(workOrder.updatedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              {workOrder.completedAt && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Completado</label>
                  <p className="text-sm font-medium">
                    {new Date(workOrder.completedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Printable Version - Hidden on screen, shown when printing */}
      <PrintableWorkOrder ref={printRef} workOrder={workOrder} companyInfo={companyInfo} />
    </div>
  )
}

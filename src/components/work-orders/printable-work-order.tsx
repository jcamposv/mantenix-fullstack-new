"use client"

import { forwardRef, useState, useEffect } from "react"
import { Building, Wrench, Clock, DollarSign, Users } from "lucide-react"
import { WorkOrderStatusBadge } from "./work-order-status-badge"
import { WorkOrderPriorityBadge } from "./work-order-priority-badge"
import { WorkOrderTypeBadge } from "./work-order-type-badge"
import { CustomFieldValue } from "./custom-field-value"
import { UserAvatar } from "@/components/common/user-avatar"
import type { WorkOrderWithRelations } from "@/types/work-order.types"
import type { CustomFieldsConfig, CustomField } from "@/types/work-order-template.types"
import Image from "next/image"

interface CompanyInfo {
  name: string
  logo: string | null
}

interface PrintableWorkOrderProps {
  workOrder: WorkOrderWithRelations
  companyInfo?: CompanyInfo
}

export const PrintableWorkOrder = forwardRef<HTMLDivElement, PrintableWorkOrderProps>(
  ({ workOrder, companyInfo }, ref) => {
    const [generatedDate, setGeneratedDate] = useState<string>("")
    
    useEffect(() => {
      // Set date only on client side after hydration
      setGeneratedDate(new Date().toLocaleString('es-ES'))
    }, [])

    const customFieldValues = workOrder.customFieldValues as Record<string, unknown> || {}
    const customFields = (workOrder.template?.customFields as CustomFieldsConfig | null)?.fields || []
    const fieldMap = new Map(customFields.map((field: CustomField) => [field.id, field]))
      

    return (
      <div ref={ref} className="hidden print:block print:bg-white print:text-black print:max-w-full">
        <style jsx global>{`
          @media print {
            @page {
              size: A4;
              margin: 1.5cm;
            }

            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        `}</style>

        {/* Header with Company Branding */}
        <div className="print:border-b-2 print:border-gray-200 print:pb-4 print:mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="mb-2">
                <div className="flex items-center gap-3">
                 
                    <Image
                      src={companyInfo?.logo || '/images/mantenix-logo-black.svg'}
                      alt={companyInfo?.name || 'Mantenix logo'}
                      className="print:max-h-[50px] print:max-w-[180px] print:object-contain"
                      width={160}
                      height={160}
                    />
                
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-primary">{workOrder.number}</h2>
              <p className="text-sm text-gray-600">Orden de Trabajo</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2">{workOrder.title}</h3>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Estado:</span>
              <WorkOrderStatusBadge status={workOrder.status} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Prioridad:</span>
              <WorkOrderPriorityBadge priority={workOrder.priority} showIcon />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Tipo:</span>
              <WorkOrderTypeBadge type={workOrder.type} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="print:mb-5 print:break-inside-avoid">
            <h4 className="text-sm font-bold uppercase text-gray-700 mb-2 border-b pb-1">
              Información General
            </h4>
            <div className="print:grid print:grid-cols-2 print:gap-4 text-sm">
              <div>
                <label className="font-semibold">Descripción:</label>
                <p>{workOrder.description || "Sin descripción"}</p>
              </div>
              <div>
                <label className="font-semibold flex items-center gap-1">
                  <Building className="h-3 w-3" /> Sede:
                </label>
                <p>{workOrder.site?.name || "N/A"}</p>
              </div>
              {workOrder.asset && (
                <>
                  <div>
                    <label className="font-semibold flex items-center gap-1">
                      <Wrench className="h-3 w-3" /> Activo:
                    </label>
                    <p>{workOrder.asset.name}</p>
                  </div>
                  <div>
                    <label className="font-semibold">Código:</label>
                    <p>{workOrder.asset.code}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Technicians */}
          {workOrder.assignments && workOrder.assignments.length > 0 && (
            <div className="print:mb-5 print:break-inside-avoid">
              <h4 className="text-sm font-bold uppercase text-muted-foreground mb-3 border-b pb-1 flex items-center gap-2">
                <Users className="h-3 w-3" /> Técnicos Asignados
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {workOrder.assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center gap-2">
                    <UserAvatar
                      name={assignment.user?.name || "Usuario"}
                      image={assignment.user?.image}
                      size="sm"
                      className="print:w-8 print:h-8 print:text-xs"
                    />
                    <div className="min-w-0">
                      <p className="font-medium">{assignment.user?.name || "Usuario"}</p>
                      {assignment.user?.email && (
                        <p className="text-xs text-muted-foreground truncate">{assignment.user.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule */}
          {(workOrder.scheduledDate || workOrder.estimatedDuration || workOrder.estimatedCost) && (
            <div className="print:mb-5 print:break-inside-avoid">
              <h4 className="text-sm font-bold uppercase text-muted-foreground mb-3 border-b pb-1">
                Programación y Estimaciones
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {workOrder.scheduledDate && (
                  <div>
                    <label className="font-semibold flex items-center gap-2">
                      <Clock className="h-3 w-3" /> Fecha Programada:
                    </label>
                    <p>{new Date(workOrder.scheduledDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                )}
                {workOrder.estimatedDuration && (
                  <div>
                    <label className="font-semibold flex items-center gap-2">
                      <Clock className="h-3 w-3" /> Duración Estimada:
                    </label>
                    <p>{workOrder.estimatedDuration} {workOrder.estimatedDuration === 1 ? 'hora' : 'horas'}</p>
                  </div>
                )}
                {workOrder.estimatedCost && (
                  <div>
                    <label className="font-semibold flex items-center gap-2">
                      <DollarSign className="h-3 w-3" /> Costo Estimado:
                    </label>
                    <p>${workOrder.estimatedCost.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          {workOrder.instructions && (
            <div className="print:mb-5 print:break-inside-avoid">
              <h4 className="text-sm font-bold uppercase text-muted-foreground mb-3 border-b pb-1">
                Instrucciones de Trabajo
              </h4>
              <p className="text-sm whitespace-pre-wrap">{workOrder.instructions}</p>
            </div>
          )}

          {/* Safety Notes */}
          {workOrder.safetyNotes && (
            <div className="print:mb-5 print:break-inside-avoid print:bg-amber-50 print:border-l-4 print:border-amber-500 print:p-3">
              <h4 className="text-sm font-bold uppercase text-amber-900 mb-2">
                ⚠️ Notas de Seguridad
              </h4>
              <p className="text-sm whitespace-pre-wrap text-amber-900">{workOrder.safetyNotes}</p>
            </div>
          )}

          {/* Tools and Materials */}
          {((workOrder.tools && workOrder.tools.length > 0) || (workOrder.materials && workOrder.materials.length > 0)) && (
            <div className="print:mb-5 print:break-inside-avoid">
              <h4 className="text-sm font-bold uppercase text-muted-foreground mb-3 border-b pb-1">
                Herramientas y Materiales
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {workOrder.tools && workOrder.tools.length > 0 && (
                  <div>
                    <label className="font-semibold mb-2 block">Herramientas Requeridas:</label>
                    <ul className="space-y-1">
                      {workOrder.tools.map((tool, index) => (
                        <li key={index}>• {tool}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {workOrder.materials && workOrder.materials.length > 0 && (
                  <div>
                    <label className="font-semibold mb-2 block">Materiales Necesarios:</label>
                    <ul className="space-y-1">
                      {workOrder.materials.map((material, index) => (
                        <li key={index}>• {material}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Custom Fields - Integrated natively */}
          {Object.keys(customFieldValues).length > 0 && Object.entries(customFieldValues).map(([key, value]) => {
            const field = fieldMap.get(key)
            const label = field?.label || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())

            return (
              <div key={key} className="print:mb-5 print:break-inside-avoid">
                <h4 className="text-sm font-bold uppercase text-gray-700 mb-2 border-b pb-1">{label}</h4>
                <div className="text-sm">
                  {field ? (
                    <CustomFieldValue field={field} value={value} />
                  ) : (
                    <span>{value?.toString() || 'N/A'}</span>
                  )}
                </div>
              </div>
            )
          })}

          {/* Metadata */}
          <div className="print-section mt-8 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
              {workOrder.creator?.name && (
                <div>
                  <label className="font-semibold">Creado por:</label>
                  <p>{workOrder.creator.name}</p>
                </div>
              )}
              <div>
                <label className="font-semibold">Fecha de creación:</label>
                <p>{new Date(workOrder.createdAt).toLocaleDateString('es-ES')}</p>
              </div>
              <div>
                <label className="font-semibold">Última actualización:</label>
                <p>{new Date(workOrder.updatedAt).toLocaleDateString('es-ES')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-xs text-center text-muted-foreground">
          <p>Documento generado por MantenIX{generatedDate && ` - ${generatedDate}`}</p>
        </div>
      </div>
    )
  }
)

PrintableWorkOrder.displayName = "PrintableWorkOrder"

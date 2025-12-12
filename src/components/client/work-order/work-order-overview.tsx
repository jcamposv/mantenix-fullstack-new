import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Wrench,
  Package,
  FileText,
  AlertTriangle,
  ClipboardList,
  Square,
  CheckSquare,
  ListChecks,
  Type,
  Hash,
  Calendar as CalendarIcon,
  AlignLeft,
  ToggleLeft,
  ChevronDown,
  Image as ImageIcon
} from "lucide-react"
import type { WorkOrderWithRelations } from "@/types/work-order.types"
import type { CustomFieldsConfig, CustomField } from "@/schemas/work-order-template"

interface WorkOrderOverviewProps {
  workOrder: WorkOrderWithRelations
}

function getFieldIcon(type: string) {
  switch (type) {
    case "CHECKLIST": return ListChecks
    case "TEXT": return Type
    case "NUMBER": return Hash
    case "DATE":
    case "DATETIME": return CalendarIcon
    case "TEXTAREA": return AlignLeft
    case "CHECKBOX": return ToggleLeft
    case "SELECT":
    case "RADIO": return ChevronDown
    case "IMAGE_BEFORE":
    case "IMAGE_AFTER": return ImageIcon
    default: return FileText
  }
}

function renderCustomFieldValue(value: unknown): string {
  if (value === null || value === undefined) return "N/A"
  if (typeof value === "boolean") return value ? "Sí" : "No"
  if (Array.isArray(value)) return value.join(", ")
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

function renderFieldDisplay(field: CustomField, value: unknown) {
  const hasValue = value !== undefined && value !== null && value !== ""

  switch (field.type) {
    case "CHECKLIST":
      const selectedValues = Array.isArray(value) ? value : []
      const totalOptions = field.options?.length || 0
      const selectedCount = selectedValues.length

      return (
        <div className="space-y-3">
          {/* Progress bar if items are checked */}
          {selectedCount > 0 && (
            <div className="space-y-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Completado</span>
                <span className="text-sm font-bold text-primary">
                  {selectedCount}/{totalOptions}
                </span>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(selectedCount / totalOptions) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Checklist items en columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto pr-1">
            {field.options?.map((option, index) => {
              const isChecked = selectedValues.includes(option)
              return (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 p-2.5 rounded-md border transition-all ${
                    isChecked
                      ? 'bg-primary/5 border-primary/30 shadow-sm'
                      : 'bg-background border-border/50'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={`text-xs leading-tight ${
                    isChecked ? 'font-semibold text-foreground' : 'text-muted-foreground'
                  }`}>
                    {option}
                  </span>
                </div>
              )
            })}
          </div>

          {(!field.options || field.options.length === 0) && (
            <p className="text-sm text-muted-foreground italic py-8 text-center">
              Sin opciones definidas
            </p>
          )}
        </div>
      )

    case "CHECKBOX":
      return (
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border ${
          value === true
            ? 'bg-primary/5 border-primary/30'
            : 'bg-muted/30 border-border'
        }`}>
          {value === true ? (
            <CheckSquare className="h-4 w-4 text-primary" />
          ) : (
            <Square className="h-4 w-4 text-muted-foreground/60" />
          )}
          <span className="text-sm font-medium">
            {value === true ? "Sí" : "No"}
          </span>
        </div>
      )

    case "SELECT":
    case "RADIO":
      return (
        <div className="space-y-2">
          <div className={`p-2.5 rounded-md border ${
            hasValue ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border'
          }`}>
            {hasValue ? (
              <p className="text-sm font-medium">{String(value)}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">—</p>
            )}
          </div>

          {field.options && field.options.length > 1 && (
            <details className="group">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 select-none px-1">
                <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
                {field.options.length} opciones
              </summary>
              <div className="mt-2 p-2 rounded-md bg-muted/20 border border-dashed">
                <div className="flex flex-wrap gap-1.5">
                  {field.options.map((option, idx) => (
                    <span
                      key={idx}
                      className={`text-xs py-1 px-2 rounded ${
                        option === value
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'bg-background text-muted-foreground'
                      }`}
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            </details>
          )}
        </div>
      )

    case "TEXTAREA":
      return (
        <div className="w-full min-h-[80px] p-3 rounded-md border bg-background">
          {hasValue ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{String(value)}</p>
          ) : (
            <div className="space-y-2">
              <div className="h-2.5 bg-muted/50 rounded w-full"></div>
              <div className="h-2.5 bg-muted/50 rounded w-5/6"></div>
              <div className="h-2.5 bg-muted/50 rounded w-3/4"></div>
            </div>
          )}
        </div>
      )

    case "TEXT":
      return (
        <div className="w-full p-2.5 rounded-md border bg-background">
          {hasValue ? (
            <p className="text-sm font-medium">{String(value)}</p>
          ) : (
            <div className="h-2.5 bg-muted/50 rounded w-3/4"></div>
          )}
        </div>
      )

    case "NUMBER":
      return (
        <div className="w-full p-2.5 rounded-md border bg-background">
          {hasValue ? (
            <p className="text-base font-bold tabular-nums text-primary">{String(value)}</p>
          ) : (
            <div className="h-3 bg-muted/50 rounded w-20"></div>
          )}
        </div>
      )

    case "DATE":
    case "DATETIME":
      return (
        <div className="flex items-center gap-2.5 p-2.5 rounded-md border bg-background">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          {hasValue ? (
            <p className="text-sm font-medium">{String(value)}</p>
          ) : (
            <div className="h-2.5 bg-muted/50 rounded w-28"></div>
          )}
        </div>
      )

    case "IMAGE_BEFORE":
    case "IMAGE_AFTER":
      const images = Array.isArray(value) ? value : value ? [value] : []
      return (
        <div>
          {images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-md border bg-primary/5 border-primary/20"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span className="text-xs font-medium truncate">{String(img)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-6 px-4 rounded-md border-2 border-dashed bg-muted/20">
              <div className="text-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground/50 mx-auto mb-1.5" />
                <p className="text-xs text-muted-foreground">Sin imagen</p>
              </div>
            </div>
          )}
        </div>
      )

    default:
      return (
        <div className="p-2.5 rounded-md border bg-background">
          {hasValue ? (
            <p className="text-sm font-medium">{renderCustomFieldValue(value)}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">—</p>
          )}
        </div>
      )
  }
}

export function WorkOrderOverview({ workOrder }: WorkOrderOverviewProps) {
  const hasTools = workOrder.tools && workOrder.tools.length > 0
  const hasMaterials = workOrder.materials && workOrder.materials.length > 0

  const customFieldValues = (workOrder.customFieldValues as Record<string, unknown>) || {}
  const customFields = workOrder.template?.customFields as CustomFieldsConfig | null

  // Check if template has custom fields defined
  const templateHasFields = customFields?.fields && customFields.fields.length > 0
  const workOrderHasValues = customFieldValues && Object.keys(customFieldValues).length > 0

  return (
    <div className="space-y-6">
      {/* Custom Fields - Most Important for Client */}
      {templateHasFields ? (
        <Card className="shadow-none overflow-hidden">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg  ring-2 ring-primary/20">
                <ClipboardList className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Formulario de Trabajo
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {workOrder.template?.category || workOrder.template?.name || 'Detalles de la orden'}
                </p>
              </div>
              {!workOrderHasValues && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs ml-auto">
                  ⏳ Pendiente
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {customFields.fields?.map((field) => {
                const value = customFieldValues[field.id]
                const hasValue = value !== undefined && value !== null && value !== ""
                const FieldIcon = getFieldIcon(field.type)

                // Los campos grandes ocupan todo el ancho
                const isFullWidth = ['CHECKLIST', 'TEXTAREA', 'IMAGE_BEFORE', 'IMAGE_AFTER'].includes(field.type)

                return (
                  <div
                    key={field.id}
                    className={`space-y-3 ${isFullWidth ? 'lg:col-span-2' : ''}`}
                  >
                    {/* Field Header */}
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded ${
                        hasValue ? 'bg-primary/10' : 'bg-muted/50'
                      }`}>
                        <FieldIcon className={`h-4 w-4 ${
                          hasValue ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground truncate">
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </h4>
                      </div>
                      {!hasValue && (
                        <Badge variant="outline" className="text-xs text-muted-foreground/70 shrink-0">
                          Vacío
                        </Badge>
                      )}
                    </div>

                    {/* Field Value */}
                    <div>
                      {renderFieldDisplay(field, value)}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-muted">
          <CardHeader className="flex flex-row items-center gap-2">
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">Detalles del Trabajo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No hay campos personalizados definidos para esta orden de trabajo.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Additional Information Grid */}
      {(workOrder.description || hasTools || hasMaterials || workOrder.safetyNotes) && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Description */}
          {workOrder.description && (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader className="flex flex-row items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {workOrder.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tools */}
          {hasTools && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Herramientas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {workOrder.tools!.map((tool, index) => (
                    <Badge key={index} variant="outline">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Materials */}
          {hasMaterials && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Materiales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {workOrder.materials!.map((material, index) => (
                    <Badge key={index} variant="outline">
                      {material}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Safety Notes */}
          {workOrder.safetyNotes && (
            <Card className="border-orange-200 bg-orange-50/50 md:col-span-2 lg:col-span-3">
              <CardHeader className="flex flex-row items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <CardTitle className="text-sm font-medium text-orange-900">
                  Notas de Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-900/80 whitespace-pre-wrap">
                  {workOrder.safetyNotes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

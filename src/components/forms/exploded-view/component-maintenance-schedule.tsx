/**
 * Component Maintenance Schedule Form Fields
 *
 * Hybrid maintenance scheduling (manufacturer + predictive)
 * Following Next.js Expert standards:
 * - Under 200 lines
 * - Type-safe props
 * - Reusable form components
 */

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Wrench } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import type { ComponentFormData } from "@/schemas/exploded-view-form"

interface WorkOrderTemplate {
  id: string
  name: string
  category: string | null
}

interface ComponentMaintenanceScheduleProps {
  form: UseFormReturn<ComponentFormData>
  templates: WorkOrderTemplate[]
  loadingTemplates: boolean
}

/**
 * Get strategy label and description
 */
function getStrategyInfo(criticality: "A" | "B" | "C" | null) {
  if (!criticality) {
    return {
      label: "Sin estrategia definida",
      description: "Configure la criticidad del componente primero",
    }
  }

  const strategies = {
    A: {
      label: "Dual (Time-Based + Predictive)",
      description: "Programado + Alertas MTBF - Máxima prevención",
    },
    B: {
      label: "Time-Based + Alert",
      description: "Programado principal + Alerta MTBF secundaria",
    },
    C: {
      label: "Run-to-Failure",
      description: "Opcional programado o correctivo cuando falle",
    },
  }

  return strategies[criticality]
}

export function ComponentMaintenanceSchedule({
  form,
  templates,
  loadingTemplates,
}: ComponentMaintenanceScheduleProps) {
  const autoCreateSchedule = form.watch("autoCreateSchedule")
  const criticality = form.watch("criticality") || null
  const strategyInfo = getStrategyInfo(criticality)

  return (
    <div className="space-y-4">
      {/* Maintenance Scheduling Section */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-orange-600" />
          <h3 className="text-sm font-medium">
            Mantenimiento Programado Híbrido
          </h3>
        </div>

        {/* Strategy Info Alert */}
        <Alert>
          <Wrench className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">{strategyInfo.label}</p>
              <p className="text-xs text-muted-foreground">
                {strategyInfo.description}
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Auto-create Schedule Toggle */}
        <FormField
          control={form.control}
          name="autoCreateSchedule"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Crear Schedule Automáticamente</FormLabel>
                <FormDescription>
                  Genera automáticamente órdenes de trabajo programadas según el
                  intervalo del fabricante
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Schedule Configuration (only if enabled) */}
        {autoCreateSchedule && (
          <div className="space-y-4 pl-4 border-l-2 border-orange-200">
            {/* Manufacturer Interval */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="manufacturerMaintenanceInterval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Intervalo de Mantenimiento{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ej: 90"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(val === "" ? null : parseInt(val))
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Cada cuánto tiempo se debe hacer mantenimiento
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="manufacturerMaintenanceIntervalUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Unidad <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione unidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HOURS">Horas</SelectItem>
                        <SelectItem value="DAYS">Días</SelectItem>
                        <SelectItem value="WEEKS">Semanas</SelectItem>
                        <SelectItem value="MONTHS">Meses</SelectItem>
                        <SelectItem value="YEARS">Años</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Template Selection */}
            <FormField
              control={form.control}
              name="workOrderTemplateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Template de OT <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? null : value)
                    }
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sin template</SelectItem>
                      {loadingTemplates ? (
                        <SelectItem value="loading" disabled>
                          Cargando...
                        </SelectItem>
                      ) : (
                        templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                            {template.category && ` (${template.category})`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Template a usar para las OTs generadas automáticamente
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </div>
  )
}

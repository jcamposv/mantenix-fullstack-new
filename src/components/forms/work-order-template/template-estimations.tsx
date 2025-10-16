"use client"

import { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Clock, DollarSign } from "lucide-react"
import { type WorkOrderTemplateFormData } from "@/schemas/work-order-template"

interface TemplateEstimationsProps {
  form: UseFormReturn<WorkOrderTemplateFormData>
}

export function TemplateEstimations({ form }: TemplateEstimationsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Duración Estimada */}
      <FormField
        control={form.control}
        name="estimatedDuration"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duración Estimada (minutos)
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="120"
                min="1"
                {...field}
                value={field.value ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  field.onChange(value === "" ? null : parseInt(value))
                }}
              />
            </FormControl>
            <FormDescription>
              Tiempo estimado en minutos para completar la orden de trabajo
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Costo Estimado */}
      <FormField
        control={form.control}
        name="estimatedCost"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Costo Estimado (CRC)
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="50000"
                min="0"
                step="100"
                {...field}
                value={field.value ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  field.onChange(value === "" ? null : parseFloat(value))
                }}
              />
            </FormControl>
            <FormDescription>
              Costo estimado en colones para materiales y mano de obra
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Preview de estimaciones */}
      {(form.watch("estimatedDuration") || form.watch("estimatedCost")) && (
        <div className="md:col-span-2 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Vista previa de estimaciones:</h4>
          <div className="flex gap-6">
            {form.watch("estimatedDuration") && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {(() => {
                    const duration = form.watch("estimatedDuration")!
                    const hours = Math.floor(duration / 60)
                    const minutes = duration % 60
                    
                    if (hours > 0) {
                      return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
                    }
                    return `${minutes}m`
                  })()}
                </span>
              </div>
            )}
            {form.watch("estimatedCost") && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Intl.NumberFormat('es-CR', {
                    style: 'currency',
                    currency: 'CRC'
                  }).format(form.watch("estimatedCost")!)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
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
import { Textarea } from "@/components/ui/textarea"
import { FileText, ShieldAlert } from "lucide-react"
import { type WorkOrderTemplateFormData } from "@/schemas/work-order-template"

interface TemplateInstructionsProps {
  form: UseFormReturn<WorkOrderTemplateFormData>
}

export function TemplateInstructions({ form }: TemplateInstructionsProps) {
  return (
    <div className="space-y-6">
      {/* Instrucciones Generales */}
      <FormField
        control={form.control}
        name="instructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Instrucciones Generales
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Detalle los pasos y procedimientos que deben seguirse para completar esta orden de trabajo..."
                className="min-h-[120px]"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription>
              Proporcione instrucciones claras y detalladas que guíen al técnico en la ejecución del trabajo
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Notas de Seguridad */}
      <FormField
        control={form.control}
        name="safetyNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-orange-500" />
              Notas de Seguridad
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enumere las precauciones de seguridad, equipos de protección personal requeridos, y riesgos a considerar..."
                className="min-h-[100px] border-orange-200 focus:border-orange-400"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormDescription>
              <span className="text-orange-600">
                Especifique todas las medidas de seguridad necesarias para prevenir accidentes
              </span>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Preview de las instrucciones */}
      {(form.watch("instructions") || form.watch("safetyNotes")) && (
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-3">Vista previa:</h4>
          <div className="space-y-4">
            {form.watch("instructions") && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Instrucciones</span>
                </div>
                <div className="text-sm text-muted-foreground bg-background p-3 rounded border">
                  {form.watch("instructions")?.split('\n').map((line, index) => (
                    <div key={index}>{line || <br />}</div>
                  ))}
                </div>
              </div>
            )}
            
            {form.watch("safetyNotes") && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-sm">Seguridad</span>
                </div>
                <div className="text-sm text-muted-foreground bg-orange-50 border-orange-200 p-3 rounded border">
                  {form.watch("safetyNotes")?.split('\n').map((line, index) => (
                    <div key={index}>{line || <br />}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
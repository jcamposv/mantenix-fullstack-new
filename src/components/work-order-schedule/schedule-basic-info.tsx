"use client"

import { UseFormReturn } from "react-hook-form"
import { WorkOrderScheduleFormData } from "@/schemas/work-order-schedule"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ScheduleBasicInfoProps {
  form: UseFormReturn<WorkOrderScheduleFormData>
  templates: Array<{ id: string; name: string }>
}

export function ScheduleBasicInfo({ form, templates }: ScheduleBasicInfoProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-4">Información Básica</h3>
      </div>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre de la Programación</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Mantenimiento Preventivo Mensual" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción (Opcional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descripción de la programación"
                className="resize-none"
                rows={3}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="templateId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Template de Orden de Trabajo</FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? undefined}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar template" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Template que se usará para generar las órdenes de trabajo
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

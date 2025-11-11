"use client"

import { UseFormReturn } from "react-hook-form"
import { WorkOrderScheduleFormData, getMeterTypeLabel } from "@/schemas/work-order-schedule"
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

interface MeterConfigProps {
  form: UseFormReturn<WorkOrderScheduleFormData>
}

export function MeterConfig({ form }: MeterConfigProps) {
  const recurrenceType = form.watch("recurrenceType")

  if (recurrenceType !== "METER_BASED") {
    return null
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-4">Configuración de Medidor</h3>
      </div>

      <FormField
        control={form.control}
        name="meterType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Medidor</FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? undefined}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="HOURS_RUN">{getMeterTypeLabel("HOURS_RUN")}</SelectItem>
                <SelectItem value="KILOMETERS">{getMeterTypeLabel("KILOMETERS")}</SelectItem>
                <SelectItem value="MILES">{getMeterTypeLabel("MILES")}</SelectItem>
                <SelectItem value="TEMPERATURE">{getMeterTypeLabel("TEMPERATURE")}</SelectItem>
                <SelectItem value="PRESSURE">{getMeterTypeLabel("PRESSURE")}</SelectItem>
                <SelectItem value="CYCLES">{getMeterTypeLabel("CYCLES")}</SelectItem>
                <SelectItem value="VIBRATION">{getMeterTypeLabel("VIBRATION")}</SelectItem>
                <SelectItem value="CUSTOM">{getMeterTypeLabel("CUSTOM")}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="meterThreshold"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Umbral del Medidor</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 1000"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormDescription>
              Se generará una orden cuando el medidor alcance este valor
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

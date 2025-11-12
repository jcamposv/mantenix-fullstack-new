"use client"

import { UseFormReturn } from "react-hook-form"
import { WorkOrderScheduleFormData, getRecurrenceEndTypeLabel } from "@/schemas/work-order-schedule"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RecurrenceEndConfigProps {
  form: UseFormReturn<WorkOrderScheduleFormData>
}

export function RecurrenceEndConfig({ form }: RecurrenceEndConfigProps) {
  const recurrenceEndType = form.watch("recurrenceEndType")

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-4">Fin de Recurrencia</h3>
      </div>

      <FormField
        control={form.control}
        name="recurrenceEndType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Terminar</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="NEVER">{getRecurrenceEndTypeLabel("NEVER")}</SelectItem>
                <SelectItem value="AFTER_OCCURRENCES">{getRecurrenceEndTypeLabel("AFTER_OCCURRENCES")}</SelectItem>
                <SelectItem value="ON_DATE">{getRecurrenceEndTypeLabel("ON_DATE")}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {recurrenceEndType === "AFTER_OCCURRENCES" && (
        <FormField
          control={form.control}
          name="recurrenceEndValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Ocurrencias</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="Ej: 12"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {recurrenceEndType === "ON_DATE" && (
        <FormField
          control={form.control}
          name="recurrenceEndDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de Fin</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}

"use client"

import { UseFormReturn } from "react-hook-form"
import { WorkOrderScheduleFormData, getRecurrenceTypeLabel, WEEK_DAYS } from "@/schemas/work-order-schedule"
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
import { Checkbox } from "@/components/ui/checkbox"

interface RecurrenceConfigProps {
  form: UseFormReturn<WorkOrderScheduleFormData>
}

export function RecurrenceConfig({ form }: RecurrenceConfigProps) {
  const recurrenceType = form.watch("recurrenceType")

  const getIntervalLabel = () => {
    switch (recurrenceType) {
      case "DAILY":
        return "Cada cuántos días"
      case "WEEKLY":
        return "Cada cuántas semanas"
      case "MONTHLY":
        return "Cada cuántos meses"
      case "YEARLY":
        return "Cada cuántos años"
      default:
        return "Intervalo"
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-4">Configuración de Recurrencia</h3>
      </div>

      <FormField
        control={form.control}
        name="recurrenceType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Recurrencia</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="DAILY">{getRecurrenceTypeLabel("DAILY")}</SelectItem>
                <SelectItem value="WEEKLY">{getRecurrenceTypeLabel("WEEKLY")}</SelectItem>
                <SelectItem value="MONTHLY">{getRecurrenceTypeLabel("MONTHLY")}</SelectItem>
                <SelectItem value="YEARLY">{getRecurrenceTypeLabel("YEARLY")}</SelectItem>
                <SelectItem value="METER_BASED">{getRecurrenceTypeLabel("METER_BASED")}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {recurrenceType !== "METER_BASED" && (
        <>
          <FormField
            control={form.control}
            name="recurrenceInterval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{getIntervalLabel()}</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {recurrenceType === "WEEKLY" && (
            <FormField
              control={form.control}
              name="weekDays"
              render={() => (
                <FormItem>
                  <FormLabel>Días de la Semana</FormLabel>
                  <div className="grid grid-cols-4 gap-3 mt-2">
                    {WEEK_DAYS.map((day) => (
                      <FormField
                        key={day.value}
                        control={form.control}
                        name="weekDays"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(day.value)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || []
                                  if (checked) {
                                    field.onChange([...current, day.value])
                                  } else {
                                    field.onChange(
                                      current.filter((v) => v !== day.value)
                                    )
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer text-sm">
                              {day.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Inicio</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  )
}

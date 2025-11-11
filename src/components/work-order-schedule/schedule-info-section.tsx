"use client"

import { UseFormReturn } from "react-hook-form"
import { Package, MapPin, Calendar, Repeat, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  type ScheduleDetailFormData,
  recurrenceLabels,
  recurrenceColors,
} from "@/schemas/schedule-detail.schema"

interface ScheduleInfoSectionProps {
  form: UseFormReturn<ScheduleDetailFormData>
  schedule: {
    recurrenceType: string
    recurrenceInterval: number
    nextGenerationDate: string | null
    completionRate: number
    template: { name: string }
    asset?: { name: string; code: string }
    site?: { name: string }
  } | null
}

/**
 * ScheduleInfoSection
 * Displays and allows editing of schedule information
 * Outlook-style: all fields inline editable
 * Max 200 lines per nextjs-expert standards
 */
export function ScheduleInfoSection({ form, schedule }: ScheduleInfoSectionProps) {
  if (!schedule) return null

  return (
    <div className="space-y-6">
      {/* Header with recurrence type */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="h-5 w-5 text-muted-foreground" />
          <Badge className={recurrenceColors[schedule.recurrenceType]}>
            {recurrenceLabels[schedule.recurrenceType]}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4" />
          {schedule.completionRate.toFixed(0)}% completado
        </div>
      </div>

      {/* Template & Asset/Site Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">Plantilla: {schedule.template.name}</p>
            {schedule.nextGenerationDate && (
              <p className="text-xs text-muted-foreground">
                Próxima generación:{" "}
                {new Date(schedule.nextGenerationDate).toLocaleDateString("es-ES")}
              </p>
            )}
          </div>
        </div>

        {schedule.asset && (
          <div className="flex items-center gap-3 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{schedule.asset.name}</p>
              <p className="text-xs text-muted-foreground">{schedule.asset.code}</p>
            </div>
          </div>
        )}

        {schedule.site && (
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <p className="font-medium">{schedule.site.name}</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Editable Fields */}
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="recurrenceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Recurrencia *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(recurrenceLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="interval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Intervalo *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <FormLabel>Estado de la Programación</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    {field.value ? "Activa - Generando órdenes" : "Inactiva - No genera órdenes"}
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

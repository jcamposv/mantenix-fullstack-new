"use client"

import { UseFormReturn } from "react-hook-form"
import { Package, MapPin, Calendar, Clock } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import {
  type WorkOrderDetailFormData,
  priorityLabels,
  statusLabels,
  statusColors,
} from "@/schemas/work-order-detail.schema"

interface WorkOrderInfoSectionProps {
  form: UseFormReturn<WorkOrderDetailFormData>
  workOrder: {
    number: string
    status: string
    asset?: { name: string; code: string }
    site?: { name: string }
  } | null
}

/**
 * WorkOrderInfoSection
 * Displays and allows editing of basic work order information
 * Outlook-style: all fields inline editable
 * Max 200 lines per nextjs-expert standards
 */
export function WorkOrderInfoSection({ form, workOrder }: WorkOrderInfoSectionProps) {
  if (!workOrder) return null

  return (
    <div className="space-y-6">
      {/* Header with number and status */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{workOrder.number}</h3>
        <Badge className={statusColors[workOrder.status]}>
          {statusLabels[workOrder.status]}
        </Badge>
      </div>

      {/* Asset & Site Info */}
      {(workOrder.asset || workOrder.site) && (
        <>
          <div className="space-y-3">
            {workOrder.asset && (
              <div className="flex items-center gap-3 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{workOrder.asset.name}</p>
                  <p className="text-xs text-muted-foreground">{workOrder.asset.code}</p>
                </div>
              </div>
            )}
            {workOrder.site && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{workOrder.site.name}</p>
              </div>
            )}
          </div>
          <Separator />
        </>
      )}

      {/* Editable Fields */}
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título *</FormLabel>
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
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridad *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(priorityLabels).map(([value, label]) => (
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="scheduledDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha Programada
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimatedDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Duración (hrs)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.5"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}

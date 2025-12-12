"use client"

import { UseFormReturn } from "react-hook-form"
import { WorkOrderScheduleFormData } from "@/schemas/work-order-schedule"
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

interface ScheduleAssignmentsProps {
  form: UseFormReturn<WorkOrderScheduleFormData>
  assets: Array<{ id: string; name: string; code?: string }>
  sites: Array<{ id: string; name: string }>
}

export function ScheduleAssignments({ form, assets, sites }: ScheduleAssignmentsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-4">Asignación (Opcional)</h3>
      </div>

      <FormField
        control={form.control}
        name="assetId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Activo (Opcional)</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(value || undefined)}
              value={field.value || ""}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sin activo específico" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name} {asset.code && `(${asset.code})`}
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
        name="siteId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sede (Opcional)</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(value || undefined)}
              value={field.value || ""}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sin sede específica" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PERMIT_TYPES, getPermitTypeLabel } from "@/schemas/work-permit.schema"
import type { UseFormReturn } from "react-hook-form"
import type { WorkPermitFormData } from "@/schemas/work-permit.schema"

interface WorkPermitBasicInfoProps {
  form: UseFormReturn<WorkPermitFormData>
  workOrders: Array<{ id: string; code: string; title: string }>
  loadingWorkOrders: boolean
  defaultWorkOrderId?: string
}

export function WorkPermitBasicInfo({
  form,
  workOrders,
  loadingWorkOrders,
  defaultWorkOrderId
}: WorkPermitBasicInfoProps) {
  return (
    <div className="space-y-4">
      {!defaultWorkOrderId && (
        <FormField
          control={form.control}
          name="workOrderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orden de Trabajo *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingWorkOrders}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una OT" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {workOrders.map((wo) => (
                    <SelectItem key={wo.id} value={wo.id}>
                      {wo.code} - {wo.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="permitType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Permiso *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {PERMIT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getPermitTypeLabel(type)}
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
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ubicación *</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Planta 2, Zona de soldadura" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="validFrom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Válido Desde *</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="validUntil"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Válido Hasta *</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="emergencyContact"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contacto de Emergencia *</FormLabel>
            <FormControl>
              <Input placeholder="Nombre y teléfono" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

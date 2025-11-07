"use client"

import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { z } from "zod"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { InventoryItemSearchMobile } from "@/components/inventory/inventory-item-search-mobile"
import { InventorySourceLocationSelect } from "@/components/inventory/inventory-source-location-select"
import { createInventoryRequestSchema } from "@/app/api/schemas/inventory-schemas"

type CreateInventoryRequestFormData = z.infer<typeof createInventoryRequestSchema>

interface InventoryRequestFieldsProps {
  form: UseFormReturn<CreateInventoryRequestFormData>
  disabled?: boolean
}

export function InventoryRequestFields({
  form,
  disabled = false
}: InventoryRequestFieldsProps) {
  const [selectedItem, setSelectedItem] = useState<{
    id: string
    code: string
    name: string
    unit: string
    company: { name: string }
  } | null>(null)

  return (
    <>
      {/* Item Selection with Search */}
      <FormField
        control={form.control}
        name="inventoryItemId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm">Repuesto *</FormLabel>
            <FormControl>
              <InventoryItemSearchMobile
                value={field.value}
                onValueChange={field.onChange}
                onItemSelect={setSelectedItem}
                disabled={disabled}
                placeholder="Buscar por código o nombre..."
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {/* Quantity */}
      <FormField
        control={form.control}
        name="requestedQuantity"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm">Cantidad *</FormLabel>
            <FormControl>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  disabled={disabled}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                  className="flex-1 text-sm"
                />
                {selectedItem && (
                  <span className="text-sm text-muted-foreground">
                    {selectedItem.unit}
                  </span>
                )}
              </div>
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {/* Source Location - Smart selector based on stock availability */}
      <InventorySourceLocationSelect
        inventoryItemId={form.watch('inventoryItemId') || ''}
        locationTypeValue={form.watch('sourceLocationType')}
        locationIdValue={form.watch('sourceLocationId')}
        onLocationTypeChange={(value) => form.setValue('sourceLocationType', value as "WAREHOUSE" | "VEHICLE" | "SITE")}
        onLocationIdChange={(value) => form.setValue('sourceLocationId', value)}
        disabled={disabled}
      />
      {form.formState.errors.sourceLocationId && (
        <p className="text-xs text-destructive mt-1">
          {String(form.formState.errors.sourceLocationId.message)}
        </p>
      )}
      {form.formState.errors.sourceLocationType && (
        <p className="text-xs text-destructive mt-1">
          {String(form.formState.errors.sourceLocationType.message)}
        </p>
      )}

      {/* Urgency */}
      <FormField
        control={form.control}
        name="urgency"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm">Urgencia</FormLabel>
            <Select
              disabled={disabled}
              onValueChange={field.onChange}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="LOW">Baja</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="CRITICAL">Crítica</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {/* Notes */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm">Notas (opcional)</FormLabel>
            <FormControl>
              <Textarea
                disabled={disabled}
                placeholder="Detalles adicionales..."
                className="resize-none text-sm"
                rows={2}
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </>
  )
}

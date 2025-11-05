"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Resolver } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { inventoryItemSchema, type InventoryItemFormData } from "@/schemas/inventory"
import { Loader2 } from "lucide-react"
import { BasicInfoFields } from "./basic-info-fields"
import { TechnicalDetailsFields } from "./technical-details-fields"
import { StockCostsFields } from "./stock-costs-fields"

interface InventoryItemFormProps {
  initialData?: Partial<InventoryItemFormData>
  onSubmit: (data: InventoryItemFormData) => Promise<void>
  isLoading?: boolean
  mode?: "create" | "edit"
}

export function InventoryItemForm({
  initialData,
  onSubmit,
  isLoading = false,
  mode = "create"
}: InventoryItemFormProps) {
  const form = useForm<InventoryItemFormData>({
    resolver: zodResolver(inventoryItemSchema) as Resolver<InventoryItemFormData>,
    defaultValues: {
      code: initialData?.code || "",
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      subcategory: initialData?.subcategory || "",
      manufacturer: initialData?.manufacturer || "",
      model: initialData?.model || "",
      partNumber: initialData?.partNumber || "",
      unit: initialData?.unit || "UN",
      minStock: initialData?.minStock || 0,
      maxStock: initialData?.maxStock || undefined,
      reorderPoint: initialData?.reorderPoint || 0,
      unitCost: initialData?.unitCost || undefined,
      lastPurchasePrice: initialData?.lastPurchasePrice || undefined,
      images: initialData?.images || [],
      companyId: initialData?.companyId || "",
    },
  })

  const handleSubmit = async (data: InventoryItemFormData) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <BasicInfoFields form={form} />
        <TechnicalDetailsFields form={form} />
        <StockCostsFields form={form} />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Crear Ítem" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

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
import { InventoryImageUpload } from "@/components/inventory/inventory-image-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
      minStock: initialData?.minStock ?? 0,
      maxStock: initialData?.maxStock,
      reorderPoint: initialData?.reorderPoint ?? 0,
      leadTime: initialData?.leadTime ?? 7,
      unitCost: initialData?.unitCost ?? 0,
      lastPurchasePrice: initialData?.lastPurchasePrice,
      images: initialData?.images || [],
      companyId: initialData?.companyId || "",
    },
  })

  const handleSubmit = async (data: InventoryItemFormData) => {
    await onSubmit(data)
  }

  const companyId = form.watch("companyId")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <BasicInfoFields form={form} />
        <TechnicalDetailsFields form={form} />
        <StockCostsFields form={form} />

        {/* Images Section */}
        <Card className="w-full shadow-none">
          <CardHeader>
            <CardTitle>Imágenes del Producto</CardTitle>
            <CardDescription>
              Sube imágenes del producto para facilitar su identificación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryImageUpload
              images={form.watch("images") || []}
              companyId={companyId}
              onImagesChange={(images) => form.setValue("images", images)}
              maxImages={5}
            />
          </CardContent>
        </Card>

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

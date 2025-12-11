"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { InventoryItemForm } from "@/components/forms/inventory/inventory-item-form"
import { type InventoryItemFormData } from "@/schemas/inventory"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInventoryItem } from "@/hooks/useInventoryItem"

export default function EditInventoryItemPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use the new useInventoryItem hook with SWR
  const { item, loading: isLoadingData, error } = useInventoryItem(id)

  // Handle error state
  useEffect(() => {
    if (error) {
      toast.error('Error al cargar el ítem')
      router.push('/admin/inventory/items')
    }
  }, [error, router])

  // Transform item data to form format
  const initialData = useMemo<Partial<InventoryItemFormData> | null>(() => {
    if (!item) return null

    return {
      code: item.code,
      name: item.name,
      description: item.description ?? undefined,
      category: item.category ?? undefined,
      subcategory: item.subcategory ?? undefined,
      manufacturer: item.manufacturer ?? undefined,
      model: item.model ?? undefined,
      partNumber: item.partNumber ?? undefined,
      unit: item.unit,
      minStock: item.minStock,
      maxStock: item.maxStock ?? undefined,
      reorderPoint: item.reorderPoint,
      leadTime: (item as { leadTime?: number }).leadTime ?? 7,
      unitCost: item.unitCost ?? undefined,
      lastPurchasePrice: item.lastPurchasePrice ?? undefined,
      images: item.images || [],
      companyId: item.companyId,
    }
  }, [item])

  const handleSubmit = async (data: InventoryItemFormData) => {
    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/admin/inventory/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar el ítem')
      }

      toast.success('Ítem actualizado exitosamente')
      router.push('/admin/inventory/items')
      router.refresh()
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el ítem')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!initialData) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Editar Ítem de Inventario</h2>
          <p className="text-muted-foreground">
            Modifica la información del ítem
          </p>
        </div>
      </div>

      <InventoryItemForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        mode="edit"
      />
    </div>
  )
}

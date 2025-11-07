"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { InventoryItemForm } from "@/components/forms/inventory/inventory-item-form"
import { type InventoryItemFormData } from "@/schemas/inventory"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EditInventoryItemPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [initialData, setInitialData] = useState<Partial<InventoryItemFormData> | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchItemData()
  }, [id])

  const fetchItemData = async () => {
    try {
      const response = await fetch(`/api/admin/inventory/items/${id}`)
      if (!response.ok) throw new Error('Error al cargar el ítem')

      const data = await response.json()
      setInitialData({
        code: data.code,
        name: data.name,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        manufacturer: data.manufacturer,
        model: data.model,
        partNumber: data.partNumber,
        unit: data.unit,
        minStock: data.minStock,
        maxStock: data.maxStock,
        reorderPoint: data.reorderPoint,
        unitCost: data.unitCost,
        lastPurchasePrice: data.lastPurchasePrice,
        images: data.images || [],
        companyId: data.companyId,
      })
    } catch (error) {
      console.error('Error fetching item:', error)
      toast.error('Error al cargar el ítem')
      router.push('/admin/inventory/items')
    } finally {
      setIsLoadingData(false)
    }
  }

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

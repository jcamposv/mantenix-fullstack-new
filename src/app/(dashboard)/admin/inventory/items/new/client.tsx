"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { InventoryItemForm } from "@/components/forms/inventory/inventory-item-form"
import { type InventoryItemFormData } from "@/schemas/inventory"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NewInventoryItemClientProps {
  currentCompanyId: string | null
}

export function NewInventoryItemClient({ currentCompanyId }: NewInventoryItemClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: InventoryItemFormData) => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/admin/inventory/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear el ítem')
      }

      toast.success('Ítem de inventario creado exitosamente')
      router.push('/admin/inventory/items')
      router.refresh()
    } catch (error) {
      console.error('Error creating inventory item:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear el ítem')
    } finally {
      setIsLoading(false)
    }
  }

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
          <h2 className="text-2xl font-bold tracking-tight">Nuevo Ítem de Inventario</h2>
          <p className="text-muted-foreground">
            Crea un nuevo ítem en el catálogo de inventario
          </p>
        </div>
      </div>

      <InventoryItemForm
        initialData={{ companyId: currentCompanyId || "" }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        mode="create"
      />
    </div>
  )
}

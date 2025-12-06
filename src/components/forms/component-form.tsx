/**
 * Component Form
 *
 * Main form for creating/editing exploded view components.
 * Follows project patterns: React Hook Form + Zod + shadcn/ui.
 */

"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { componentFormSchema, type ComponentFormData } from "@/schemas/exploded-view-form"
import { ComponentBasicInfo } from "./exploded-view/component-basic-info"
import { ComponentTechnicalInfo } from "./exploded-view/component-technical-info"

interface InventoryItem {
  id: string
  name: string
  code: string
}

interface ExplodedViewComponent {
  id: string
  name: string
  partNumber: string | null
  hierarchyLevel: number
}

interface ComponentFormProps {
  onSubmit: (data: ComponentFormData) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<ComponentFormData>
}

export function ComponentForm({
  onSubmit,
  onCancel,
  loading,
  initialData,
}: ComponentFormProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loadingInventory, setLoadingInventory] = useState(true)
  const [components, setComponents] = useState<ExplodedViewComponent[]>([])
  const [loadingComponents, setLoadingComponents] = useState(true)

  const form = useForm<ComponentFormData>({
    resolver: zodResolver(componentFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      partNumber: initialData?.partNumber || null,
      description: initialData?.description || null,
      manufacturer: initialData?.manufacturer || null,
      parentComponentId: initialData?.parentComponentId || null,
      hierarchyLevel: initialData?.hierarchyLevel || 4,
      criticality: initialData?.criticality || null,
      lifeExpectancy: initialData?.lifeExpectancy || null,
      mtbf: initialData?.mtbf || null,
      mttr: initialData?.mttr || null,
      specifications: initialData?.specifications || null,
      manualUrl: initialData?.manualUrl || null,
      installationUrl: initialData?.installationUrl || null,
      imageUrl: initialData?.imageUrl || null,
      inventoryItemId: initialData?.inventoryItemId || null,
    },
  })

  useEffect(() => {
    fetchInventoryItems()
    fetchComponents()
  }, [])

  const fetchInventoryItems = async () => {
    try {
      setLoadingInventory(true)
      const response = await fetch("/api/admin/inventory/items?limit=1000")
      if (response.ok) {
        const data = await response.json()
        setInventoryItems(data.items || [])
      }
    } catch (error) {
      console.error("Error fetching inventory items:", error)
    } finally {
      setLoadingInventory(false)
    }
  }

  const fetchComponents = async () => {
    try {
      setLoadingComponents(true)
      const response = await fetch("/api/exploded-view-components?limit=1000")
      if (response.ok) {
        const data = await response.json()
        setComponents(data.items || [])
      }
    } catch (error) {
      console.error("Error fetching components:", error)
    } finally {
      setLoadingComponents(false)
    }
  }

  const handleSubmit = (data: ComponentFormData) => {
    // Clean up null/empty values before submitting
    const cleanedData = {
      ...data,
      partNumber: data.partNumber || undefined,
      description: data.description || undefined,
      manufacturer: data.manufacturer || undefined,
      parentComponentId: data.parentComponentId || undefined,
      criticality: data.criticality || undefined,
      lifeExpectancy: data.lifeExpectancy || undefined,
      mtbf: data.mtbf || undefined,
      mttr: data.mttr || undefined,
      manualUrl: data.manualUrl || undefined,
      installationUrl: data.installationUrl || undefined,
      imageUrl: data.imageUrl || undefined,
      inventoryItemId: data.inventoryItemId || undefined,
    }
    onSubmit(cleanedData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {initialData ? "Editar Componente" : "Nuevo Componente"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ComponentBasicInfo
              form={form}
              inventoryItems={inventoryItems}
              loadingInventory={loadingInventory}
            />

            <ComponentTechnicalInfo
              form={form}
              components={components}
              loadingComponents={loadingComponents}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

/**
 * Component Form
 *
 * Main form for creating/editing exploded view components.
 * Follows project patterns: React Hook Form + Zod + shadcn/ui.
 */

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { componentFormSchema, type ComponentFormData } from "@/schemas/exploded-view-form"
import { ComponentBasicInfo } from "./exploded-view/component-basic-info"
import { ComponentTechnicalInfo } from "./exploded-view/component-technical-info"
import useSWR from "swr"

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
  componentId?: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export function ComponentForm({
  onSubmit,
  onCancel,
  loading,
  initialData,
  componentId,
}: ComponentFormProps) {
  // Use SWR for inventory items with caching and deduplication
  const { data: inventoryData, isLoading: loadingInventory } = useSWR<{ items: InventoryItem[] }>(
    '/api/admin/inventory/items?limit=1000',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Dedupe requests within 30 seconds
    }
  )

  // Use SWR for components with caching and deduplication
  const { data: componentsData, isLoading: loadingComponents } = useSWR<{ items: ExplodedViewComponent[] }>(
    '/api/exploded-view-components?limit=1000',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Dedupe requests within 30 seconds
    }
  )

  const inventoryItems = inventoryData?.items || []
  const components = componentsData?.items || []

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
              componentId={componentId}
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

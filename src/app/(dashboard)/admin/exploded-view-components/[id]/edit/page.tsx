/**
 * Edit Component Page
 *
 * Page for editing an existing exploded view component.
 * Follows pattern from asset edit page.
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { ComponentForm } from "@/components/forms/component-form"
import type { ComponentFormData } from "@/schemas/exploded-view-form"
import { FormSkeleton } from "@/components/skeletons"

export default function EditComponentPage() {
  const [loading, setLoading] = useState(false)
  const [initialData, setInitialData] = useState<Partial<ComponentFormData> | null>(null)
  const [fetchLoading, setFetchLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    fetchComponent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchComponent = async () => {
    try {
      setFetchLoading(true)
      const response = await fetch(`/api/exploded-view-components/${id}`)

      if (response.ok) {
        const component = await response.json()
        // Transform the data to match form format
        const formData: Partial<ComponentFormData> = {
          name: component.name,
          description: component.description,
          partNumber: component.partNumber,
          manufacturer: component.manufacturer,
          inventoryItemId: component.inventoryItemId,
          manualUrl: component.manualUrl,
          installationUrl: component.installationUrl,
          imageUrl: component.imageUrl,
          isActive: component.isActive,
          // Jerarquía ISO 14224
          parentComponentId: component.parentComponentId,
          hierarchyLevel: component.hierarchyLevel,
          criticality: component.criticality,
          // Datos técnicos
          lifeExpectancy: component.lifeExpectancy,
          mtbf: component.mtbf,
          mttr: component.mttr,
        }
        setInitialData(formData)
      } else {
        toast.error('Error al cargar el componente')
        router.push('/admin/exploded-view-components')
      }
    } catch (error) {
      console.error('Error fetching component:', error)
      toast.error('Error al cargar el componente')
      router.push('/admin/exploded-view-components')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (data: ComponentFormData) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/exploded-view-components/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Componente actualizado exitosamente')
        router.push(`/admin/exploded-view-components/${id}`)
      } else {
        console.error('Error updating component:', result)

        // Extract detailed validation error messages
        if (result.details && Array.isArray(result.details) && result.details.length > 0) {
          // Show each validation error
          result.details.forEach((detail: { message: string }) => {
            toast.error(detail.message)
          })
        } else {
          // Fallback to generic error message
          toast.error(result.error || 'Error al actualizar el componente')
        }
      }
    } catch (error) {
      console.error('Error updating component:', error)
      toast.error('Error al actualizar el componente')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <FormSkeleton fields={8} showTitle={true} showFooter={true} />
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p>Componente no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Componente</h1>
        <p className="text-muted-foreground mt-2">
          Modifica los detalles del componente
        </p>
      </div>

      <ComponentForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        initialData={initialData}
        componentId={id}
      />
    </div>
  )
}

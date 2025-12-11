/**
 * Edit Exploded View Page
 *
 * Page for editing an existing exploded view.
 * Follows pattern from asset edit page.
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { ExplodedViewForm } from "@/components/forms/exploded-view-form"
import type { ExplodedViewFormData } from "@/schemas/exploded-view-form"
import { FormSkeleton } from "@/components/skeletons"

export default function EditExplodedViewPage() {
  const [loading, setLoading] = useState(false)
  const [initialData, setInitialData] = useState<Partial<ExplodedViewFormData> | null>(null)
  const [fetchLoading, setFetchLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    fetchView()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchView = async () => {
    try {
      setFetchLoading(true)
      const response = await fetch(`/api/exploded-views/${id}`)

      if (response.ok) {
        const view = await response.json()
        // Transform the data to match form format
        const formData: Partial<ExplodedViewFormData> = {
          name: view.name,
          description: view.description,
          imageUrl: view.imageUrl,
          imageWidth: view.imageWidth,
          imageHeight: view.imageHeight,
          order: view.order,
          assetId: view.assetId,
          isActive: view.isActive,
        }
        setInitialData(formData)
      } else {
        toast.error('Error al cargar la vista explosionada')
        router.push('/admin/exploded-views')
      }
    } catch (error) {
      console.error('Error fetching view:', error)
      toast.error('Error al cargar la vista explosionada')
      router.push('/admin/exploded-views')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (data: ExplodedViewFormData) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/exploded-views/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Vista explosionada actualizada exitosamente')
        router.push(`/admin/exploded-views/${id}`)
      } else {
        console.error('Error updating view:', result)
        toast.error(result.error || 'Error al actualizar la vista explosionada')
      }
    } catch (error) {
      console.error('Error updating view:', error)
      toast.error('Error al actualizar la vista explosionada')
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
        <FormSkeleton fields={6} showTitle={true} showFooter={true} />
      </div>
    )
  }

  if (!initialData) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p>Vista explosionada no encontrada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Vista Explosionada</h1>
        <p className="text-muted-foreground mt-2">
          Modifica los detalles de la vista explosionada
        </p>
      </div>

      <ExplodedViewForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        initialData={initialData}
      />
    </div>
  )
}

/**
 * New Exploded View Page
 *
 * Page for creating a new exploded view.
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ExplodedViewForm } from "@/components/forms/exploded-view-form"
import type { ExplodedViewFormData } from "@/schemas/exploded-view-form"

export default function NewExplodedViewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: ExplodedViewFormData) => {
    try {
      setLoading(true)

      const response = await fetch('/api/exploded-views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear vista explosionada')
      }

      toast.success('Vista explosionada creada exitosamente')
      router.push(`/admin/exploded-views/${result.id}`)
    } catch (error) {
      console.error('Error creating exploded view:', error)
      toast.error(
        error instanceof Error ? error.message : 'Error al crear vista explosionada'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/exploded-views')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nueva Vista Explosionada</h1>
        <p className="text-muted-foreground mt-2">
          Crea una nueva vista explosionada para un activo
        </p>
      </div>

      <ExplodedViewForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  )
}

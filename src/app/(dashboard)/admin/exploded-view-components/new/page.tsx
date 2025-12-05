/**
 * New Component Page
 *
 * Page for creating a new exploded view component.
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ComponentForm } from "@/components/forms/component-form"
import type { ComponentFormData } from "@/schemas/exploded-view-form"

export default function NewComponentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: ComponentFormData) => {
    try {
      setLoading(true)

      const response = await fetch('/api/exploded-view-components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear componente')
      }

      toast.success('Componente creado exitosamente')
      router.push(`/admin/exploded-view-components/${result.id}`)
    } catch (error) {
      console.error('Error creating component:', error)
      toast.error(
        error instanceof Error ? error.message : 'Error al crear componente'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/exploded-view-components')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Componente</h1>
        <p className="text-muted-foreground mt-2">
          Agrega un nuevo componente a la biblioteca
        </p>
      </div>

      <ComponentForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  )
}

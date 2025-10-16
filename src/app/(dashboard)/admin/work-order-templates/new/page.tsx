"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { WorkOrderTemplateForm } from "@/components/forms/work-order-template-form"
import { toast } from "sonner"
import type { WorkOrderTemplateFormData } from "@/schemas/work-order-template"

export default function NewWorkOrderTemplatePage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: WorkOrderTemplateFormData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/work-order-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Template creado exitosamente')
        router.push('/admin/work-order-templates')
      } else {
        const error = await response.json()
        console.error('Error creating template:', error)
        toast.error(error.error || 'Error al crear el template')
      }
    } catch (error) {
      console.error('Error creating template:', error)
      toast.error('Error al crear el template')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <WorkOrderTemplateForm
      mode="create"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={loading}
    />
  )
}
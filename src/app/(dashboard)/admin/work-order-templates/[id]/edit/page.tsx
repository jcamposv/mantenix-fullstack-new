"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { WorkOrderTemplateForm } from "@/components/forms/mobile/work-order-complete/work-order-template-form"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import type { WorkOrderTemplateFormData } from "@/schemas/work-order-template"
import type { WorkOrderTemplateWithRelations } from "@/types/work-order-template.types"
import { FormSkeleton } from "@/components/skeletons"

interface EditWorkOrderTemplatePageProps {
  params: Promise<{ id: string }>
}

export default function EditWorkOrderTemplatePage({ params }: EditWorkOrderTemplatePageProps) {
  const [loading, setLoading] = useState(false)
  const [fetchingTemplate, setFetchingTemplate] = useState(true)
  const [template, setTemplate] = useState<WorkOrderTemplateWithRelations | null>(null)
  const [templateId, setTemplateId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setTemplateId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) return
      
      try {
        setFetchingTemplate(true)
        const response = await fetch(`/api/work-order-templates/${templateId}`)
        
        if (response.ok) {
          const templateData = await response.json()
          setTemplate(templateData)
        } else {
          const error = await response.json()
          toast.error(error.error || 'Error al cargar el template')
          router.push('/admin/work-order-templates')
        }
      } catch (error) {
        console.error('Error fetching template:', error)
        toast.error('Error al cargar el template')
        router.push('/admin/work-order-templates')
      } finally {
        setFetchingTemplate(false)
      }
    }

    fetchTemplate()
  }, [templateId, router])

  const handleSubmit = async (data: WorkOrderTemplateFormData) => {
    if (!templateId) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/work-order-templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Template actualizado exitosamente')
        router.push('/admin/work-order-templates')
      } else {
        const error = await response.json()
        console.error('Error updating template:', error)
        toast.error(error.error || 'Error al actualizar el template')
      }
    } catch (error) {
      console.error('Error updating template:', error)
      toast.error('Error al actualizar el template')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (fetchingTemplate) {
    return (
      <div className="container mx-auto py-0 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded animate-pulse" />
          <div className="h-4 w-96 bg-muted rounded animate-pulse" />
        </div>
        <FormSkeleton fields={4} showTitle={true} showFooter={true} />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="container mx-auto py-0">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <span>Template no encontrado</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Transform template data to match form schema
  const formData = template ? {
    name: template.name,
    description: template.description,
    category: template.category,
    status: template.status,
    customFields: template.customFields
  } : undefined

  return (
    <WorkOrderTemplateForm
      mode="edit"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={loading}
      initialData={formData}
    />
  )
}
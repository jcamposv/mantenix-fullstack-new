"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { CompanyGroupForm } from "@/components/forms/company-group/company-group-form"
import { type CompanyGroupFormData } from "@/schemas/inventory"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EditCompanyGroupPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [initialData, setInitialData] = useState<Partial<CompanyGroupFormData> | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchGroupData()
  }, [id])

  const fetchGroupData = async () => {
    try {
      const response = await fetch(`/api/admin/company-groups/${id}`)
      if (!response.ok) throw new Error('Error al cargar el grupo')

      const data = await response.json()
      setInitialData({
        name: data.name,
        description: data.description,
        shareInventory: data.shareInventory,
        autoApproveTransfers: data.autoApproveTransfers,
      })
    } catch (error) {
      console.error('Error fetching group:', error)
      toast.error('Error al cargar el grupo')
      router.push('/admin/company-groups')
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSubmit = async (data: CompanyGroupFormData) => {
    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/admin/company-groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar el grupo')
      }

      toast.success('Grupo actualizado exitosamente')
      router.push('/admin/company-groups')
      router.refresh()
    } catch (error) {
      console.error('Error updating group:', error)
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el grupo')
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
          <h2 className="text-3xl font-bold tracking-tight">Editar Grupo Corporativo</h2>
          <p className="text-muted-foreground">
            Modifica la información del grupo
          </p>
        </div>
      </div>

      <CompanyGroupForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        mode="edit"
      />
    </div>
  )
}

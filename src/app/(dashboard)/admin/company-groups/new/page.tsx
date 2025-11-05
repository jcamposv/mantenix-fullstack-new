"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CompanyGroupForm } from "@/components/forms/company-group/company-group-form"
import { type CompanyGroupFormData } from "@/schemas/inventory"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NewCompanyGroupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: CompanyGroupFormData) => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/admin/company-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear el grupo')
      }

      toast.success('Grupo corporativo creado exitosamente')
      router.push('/admin/company-groups')
      router.refresh()
    } catch (error) {
      console.error('Error creating company group:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear el grupo')
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
          <h2 className="text-2xl font-bold tracking-tight">Nuevo Grupo Corporativo</h2>
          <p className="text-muted-foreground">
            Crea un nuevo grupo de empresas hermanas
          </p>
        </div>
      </div>

      <CompanyGroupForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        mode="create"
      />
    </div>
  )
}

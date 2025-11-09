"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { CompanyForm } from "@/components/forms/company/company-form"
import type { CompanySubmitData } from "@/schemas/company"
import type { CompanyWithRelations } from "@/types/company.types"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function EditCompanyPage() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [company, setCompany] = useState<CompanyWithRelations | null>(null)
  const router = useRouter()
  const params = useParams()
  const companyId = params.id as string

  useEffect(() => {
    fetchCompany()
  }, [companyId])

  const fetchCompany = async () => {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}`)

      if (!response.ok) {
        toast.error("Error al cargar la compañía")
        router.push('/super-admin/companies')
        return
      }

      const companyData = await response.json()

      // El planId viene desde la subscripción incluida
      if (companyData.subscription?.plan?.id) {
        companyData.planId = companyData.subscription.plan.id
      }

      setCompany(companyData)
    } catch (error) {
      console.error('Error fetching company:', error)
      toast.error("Error al cargar la compañía")
      router.push('/super-admin/companies')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (data: CompanySubmitData) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Compañía actualizada correctamente")
        router.push('/super-admin/companies')
      } else {
        const error = await response.json()
        console.error('Error updating company:', error)
        toast.error(error.error || "Error al actualizar la compañía")
      }
    } catch (error) {
      console.error('Error updating company:', error)
      toast.error("Error al actualizar la compañía")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/super-admin/companies')
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-muted-foreground">Compañía no encontrada</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-0">
      <CompanyForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        initialData={{
          ...company,
          logo: company.logo ?? undefined,
        }}
        mode="edit"
      />
    </div>
  )
}

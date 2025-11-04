"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ClientCompanyForm } from "@/components/forms/client-company/client-company-form"
import { toast } from "sonner"
import type { ClientCompanySubmitData } from "@/schemas/client-company"

export default function NewClientCompanyPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: ClientCompanySubmitData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/client-companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Client company created successfully:', result)
        toast.success('Empresa cliente creada exitosamente')
        router.push('/admin/client-companies')
      } else {
        const error = await response.json()
        console.error('Error creating client company:', error)
        toast.error(error.error || 'Error al crear la empresa cliente')
      }
    } catch (error) {
      console.error('Error creating client company:', error)
      toast.error('Error al crear la empresa cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-0">
      <ClientCompanyForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        mode="create"
      />
    </div>
  )
}
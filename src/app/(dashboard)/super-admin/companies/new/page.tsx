"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CompanyForm } from "@/components/forms/company/company-form"
import type { CompanySubmitData } from "@/schemas/company"

export default function NewCompanyPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: CompanySubmitData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        router.push('/super-admin/companies')
      } else {
        const error = await response.json()
        console.error('Error creating company:', error)
        // TODO: Show error toast/notification
      }
    } catch (error) {
      console.error('Error creating company:', error)
      // TODO: Show error toast/notification
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-6">
      <CompanyForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  )
}
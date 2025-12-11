"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ApprovalRuleForm } from "@/components/workflow/approval-rule-form"
import { toast } from "sonner"

export default function NewApprovalRulePage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/approval-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Regla de aprobación creada exitosamente')
        router.push('/admin/approval-rules')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear la regla de aprobación')
      }
    } catch (error) {
      console.error('Error creating approval rule:', error)
      toast.error('Error al crear la regla de aprobación')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-0">
      <ApprovalRuleForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SubscriptionPlanForm } from "@/components/forms/subscription-plan-form"
import type { CreatePlanInput } from "@/app/api/schemas/subscription-schemas"
import { toast } from "sonner"

export default function NewSubscriptionPlanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: CreatePlanInput) => {
    try {
      setLoading(true)

      const response = await fetch("/api/super-admin/subscription-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al crear plan")
      }

      toast.success("Plan de subscripción creado exitosamente")
      router.push("/super-admin/subscription-plans")
      router.refresh()
    } catch (error) {
      console.error("Error creating plan:", error)
      toast.error(error instanceof Error ? error.message : "Error al crear plan")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/super-admin/subscription-plans")
  }

  return (
    <div className="space-y-6">
      <SubscriptionPlanForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        mode="create"
      />
    </div>
  )
}

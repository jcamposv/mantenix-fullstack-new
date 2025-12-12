"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { SubscriptionPlanForm } from "@/components/forms/subscription-plan-form"
import type { CreatePlanInput } from "@/app/api/schemas/subscription-schemas"
import type { SubscriptionPlanWithDetails } from "@/types/subscription.types"
import { toast } from "sonner"

export default function EditSubscriptionPlanPage() {
  const params = useParams()
  const router = useRouter()
  const [plan, setPlan] = useState<SubscriptionPlanWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchPlan()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchPlan = async () => {
    try {
      const response = await fetch(`/api/super-admin/subscription-plans/${params.id}`)
      if (!response.ok) throw new Error("Error al cargar plan")
      const data = await response.json()
      setPlan(data)
    } catch (error) {
      console.error("Error fetching plan:", error)
      toast.error("Error al cargar el plan")
      router.push("/super-admin/subscription-plans")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: CreatePlanInput) => {
    try {
      setSaving(true)

      const response = await fetch(`/api/super-admin/subscription-plans/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al actualizar plan")
      }

      toast.success("Plan actualizado exitosamente")
      router.push("/super-admin/subscription-plans")
      router.refresh()
    } catch (error) {
      console.error("Error updating plan:", error)
      toast.error(error instanceof Error ? error.message : "Error al actualizar plan")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push("/super-admin/subscription-plans")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!plan) {
    return null
  }

  return (
    <div className="space-y-6">
      <SubscriptionPlanForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={saving}
        mode="edit"
        initialData={{
          ...plan,
          features: plan.features?.map(f => f.module),
        }}
      />
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Control } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { CompanyFormData } from "@/schemas/company"
import { Loader2 } from "lucide-react"
import type { SubscriptionPlanWithDetails } from "@/types/subscription.types"

interface CompanyTierSelectionProps {
  control: Control<CompanyFormData>
}

export function CompanyTierSelection({ control }: CompanyTierSelectionProps) {
  const [plans, setPlans] = useState<SubscriptionPlanWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/super-admin/subscription-plans")
      if (response.ok) {
        const data = await response.json()
        // Solo mostrar planes activos
        setPlans(data.filter((p: SubscriptionPlanWithDetails) => p.isActive))
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormField
      control={control}
      name="planId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Plan de Subscripción *</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={loading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Cargando planes..." : "Seleccione un plan"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ${plan.monthlyPrice}/mes • {plan.maxUsers} usuarios • {plan.maxWorkOrdersPerMonth} OT/mes
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
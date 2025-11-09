"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, DollarSign, Users, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SubscriptionPlanWithDetails } from "@/types/subscription.types"
import { AVAILABLE_FEATURES } from "@/types/attendance.types"
import { toast } from "sonner"
import Link from "next/link"

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlanWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/super-admin/subscription-plans")
      if (!response.ok) throw new Error("Error al cargar planes")
      const data = await response.json()
      setPlans(data)
    } catch (error) {
      console.error("Error fetching plans:", error)
      toast.error("Error al cargar los planes")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Planes de Subscripción</h2>
          <p className="text-muted-foreground">
            Gestiona los planes y precios de subscripción
          </p>
        </div>
        <Link href="/super-admin/subscription-plans/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Plan
          </Button>
        </Link>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                {plan.isActive ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Activo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    Inactivo
                  </Badge>
                )}
              </div>
              <CardDescription>
                <Badge variant="secondary" className="mt-2">
                  {plan.tier}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">${plan.monthlyPrice}</span>
                  <span className="text-sm text-muted-foreground">/mes</span>
                </div>
                <div className="flex items-baseline gap-2 text-sm">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">${plan.annualPrice}</span>
                  <span className="text-muted-foreground">/año</span>
                </div>
              </div>

              {/* Limits */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    Usuarios
                  </span>
                  <span className="font-medium">{plan.maxUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Package className="h-3 w-3" />
                    Órdenes/mes
                  </span>
                  <span className="font-medium">{plan.maxWorkOrdersPerMonth}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Almacenamiento</span>
                  <span className="font-medium">{plan.maxStorageGB} GB</span>
                </div>
              </div>

              {/* Features */}
              <div className="pt-2 border-t space-y-1 text-xs">
                <div className="font-medium text-foreground mb-2">Features incluidos:</div>
                {plan.features && plan.features.length > 0 ? (
                  plan.features.slice(0, 4).map((feature) => {
                    const featureInfo = AVAILABLE_FEATURES[feature.module]
                    return (
                      <div key={feature.id} className="flex items-center gap-2 text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        {featureInfo?.name || feature.module}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-muted-foreground italic">Sin features configurados</div>
                )}
                {plan.features && plan.features.length > 4 && (
                  <div className="text-muted-foreground italic">
                    +{plan.features.length - 4} más...
                  </div>
                )}
              </div>

              {/* Subscriptions Count */}
              {plan._count && (
                <div className="pt-2 text-xs text-muted-foreground border-t">
                  {plan._count.subscriptions} compañía(s) con este plan
                </div>
              )}

              {/* Actions */}
              <div className="pt-2">
                <Link href={`/super-admin/subscription-plans/${plan.id}`}>
                  <Button variant="outline" className="w-full" size="sm">
                    Editar Plan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No hay planes de subscripción configurados</p>
          <Link href="/super-admin/subscription-plans/new">
            <Button variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Plan
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

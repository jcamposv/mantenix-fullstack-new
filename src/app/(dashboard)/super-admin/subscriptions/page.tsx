"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SubscriptionWithRelations } from "@/types/subscription.types"
import { toast } from "sonner"
import Link from "next/link"
import { SubscriptionStatus } from "@prisma/client"

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/super-admin/subscriptions?limit=100")
      if (!response.ok) throw new Error("Error al cargar subscripciones")
      const data = await response.json()
      setSubscriptions(data.subscriptions || [])
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
      toast.error("Error al cargar las subscripciones")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: SubscriptionStatus) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle2 className="h-4 w-4" />
      case "TRIALING":
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-50 text-green-700 border-green-200"
      case "TRIALING":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "PAST_DUE":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "CANCELED":
        return "bg-gray-50 text-gray-700 border-gray-200"
      case "INCOMPLETE":
        return "bg-red-50 text-red-700 border-red-200"
      case "PAUSED":
        return "bg-orange-50 text-orange-700 border-orange-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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
          <h2 className="text-2xl font-bold tracking-tight">Subscripciones</h2>
          <p className="text-muted-foreground">
            Gestiona las subscripciones de las compañías
          </p>
        </div>
        <Link href="/super-admin/subscriptions/assign">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Asignar Plan
          </Button>
        </Link>
      </div>

      {/* Subscriptions List */}
      <div className="grid gap-4">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id} className="shadow-none">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">
                    {subscription.company.name}
                  </CardTitle>
                  <CardDescription>
                    Plan: <span className="font-medium text-foreground">{subscription.plan.name}</span>
                  </CardDescription>
                </div>
                <Badge variant="outline" className={getStatusColor(subscription.status)}>
                  <span className="flex items-center gap-1.5">
                    {getStatusIcon(subscription.status)}
                    {subscription.status}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {/* Pricing */}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Precio Actual</p>
                  <p className="text-lg font-bold">${subscription.currentPrice}</p>
                  <p className="text-xs text-muted-foreground">
                    {subscription.billingInterval === "MONTHLY" ? "mensual" : "anual"}
                  </p>
                </div>

                {/* Period */}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Período Actual</p>
                  <p className="text-sm font-medium">
                    {formatDate(subscription.currentPeriodStart)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    hasta {formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>

                {/* Usage Summary */}
                {subscription.usageMetrics && (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Usuarios</p>
                      <p className="text-lg font-bold">
                        {subscription.usageMetrics.currentUsers}
                        <span className="text-sm text-muted-foreground font-normal">
                          {" "}/ {subscription.plan.maxUsers}
                        </span>
                      </p>
                      {subscription.usageMetrics.overageUsers > 0 && (
                        <p className="text-xs text-yellow-600">
                          +{subscription.usageMetrics.overageUsers} extra
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Órdenes/Mes</p>
                      <p className="text-lg font-bold">
                        {subscription.usageMetrics.currentWorkOrdersThisMonth}
                        <span className="text-sm text-muted-foreground font-normal">
                          {" "}/ {subscription.plan.maxWorkOrdersPerMonth}
                        </span>
                      </p>
                      {subscription.usageMetrics.overageWorkOrders > 0 && (
                        <p className="text-xs text-yellow-600">
                          +{subscription.usageMetrics.overageWorkOrders} extra
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Link href={`/super-admin/subscriptions/${subscription.id}`}>
                  <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {subscriptions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No hay subscripciones configuradas</p>
          <Link href="/super-admin/subscriptions/assign">
            <Button variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Asignar Primer Plan
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Edit,
  Printer,
  ChevronRight,
  Home,
  Clock,
  DollarSign,
  Activity,
  Package,
  MessageSquare,
  Info,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  ShieldAlert,
  Lock,
  HardHat,
  Search
} from "lucide-react"
import { WorkOrderConsolidatedInfo } from "./work-order-consolidated-info"
import { WorkOrderCostBreakdownCard } from "./cost-breakdown-card"
import { WorkOrderToolsMaterials } from "./work-order-tools-materials"
import { WorkOrderCustomFieldsDisplay } from "./work-order-custom-fields-display"
import { WorkOrderCommentsSection } from "./work-order-comments-section"
import { TimeTrackerCard } from "./time-tracking/time-tracker-card"
import { TimeSummaryCard } from "./time-tracking/time-summary-card"
import { PrintableWorkOrder } from "./printable-work-order"
import { WorkOrderStatusBadge } from "./work-order-status-badge"
import { WorkOrderPriorityBadge } from "./work-order-priority-badge"
import { MaintenanceComponentCard } from "./maintenance-component-card"
import { WorkflowSection } from "./workflow/workflow-section"
import { SafetyBriefingSignaturesCard } from "./safety-briefing-signatures-card"
import { useTimeTracker } from "@/hooks/use-time-tracker"
import { useCompanyFeatures } from "@/hooks/useCompanyFeatures"
import type { WorkOrderWithRelations } from "@/types/work-order.types"
import type { CustomFieldsConfig } from "@/schemas/work-order-template"

interface WorkOrderDetailClientProps {
  workOrder: WorkOrderWithRelations
  companyInfo?: {
    name: string
    logo: string | null
  }
}

export function WorkOrderDetailClient({ workOrder, companyInfo }: WorkOrderDetailClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const printRef = useRef<HTMLDivElement>(null)
  const shouldPrint = searchParams.get('print') === 'true'
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("general")

  // Get time summary for dynamic metrics
  const { summary } = useTimeTracker({ workOrderId: workOrder.id })

  // Get company features for predictive maintenance
  const { hasPredictiveMaintenance } = useCompanyFeatures()

  // Check if user can edit costs (JEFE_MANTENIMIENTO, ADMIN_EMPRESA, ADMIN_GRUPO, SUPER_ADMIN)
  const user = session?.user as { role?: string } | undefined
  const canEditCosts = Boolean(user?.role && [
    "JEFE_MANTENIMIENTO",
    "ADMIN_EMPRESA",
    "ADMIN_GRUPO",
    "SUPER_ADMIN"
  ].includes(user.role))

  // Auto-print when shouldPrint is true
  useEffect(() => {
    if (shouldPrint) {
      setTimeout(() => {
        window.print()
      }, 1000)
    }
  }, [shouldPrint])

  const handlePrint = () => {
    window.print()
  }

  const customFieldValues = workOrder.customFieldValues as Record<string, unknown> || {}
  const isCompleted = workOrder.status === "COMPLETED"
  const isActive = workOrder.status !== "COMPLETED" && workOrder.status !== "CANCELLED"

  // Calculate dynamic values from time summary
  // Use summary if available and has valid data, otherwise fall back to work order fields
  const displayTime = (summary && summary.totalElapsedMinutes > 0)
    ? summary.totalElapsedMinutes
    : (workOrder.actualDuration || 0)

  const displayActiveTime = (summary && summary.activeWorkMinutes > 0)
    ? summary.activeWorkMinutes
    : (workOrder.activeWorkTime || 0)

  // Calculate dynamic cost - if actualCost is 0 but we have time, estimate it
  const calculateEstimatedCost = () => {
    if (workOrder.actualCost && workOrder.actualCost > 0) {
      return workOrder.actualCost
    }

    // If completed but cost is 0, estimate based on time
    if (displayActiveTime > 0) {
      // Use a more realistic hourly rate for Costa Rica (₡8000/hora ≈ $13/hora)
      const DEFAULT_HOURLY_RATE = 8000
      const hours = displayActiveTime / 60
      const laborCost = hours * DEFAULT_HOURLY_RATE
      const partsCost = workOrder.partsCost || 0
      const otherCosts = workOrder.otherCosts || 0
      const totalEstimated = laborCost + partsCost + otherCosts

      return totalEstimated
    }

    return workOrder.estimatedCost || 0
  }

  const displayCost = calculateEstimatedCost()

  // Format currency
  const formatCurrency = (amount: number | null): string => {
    if (amount === null || amount === undefined) return "₡0"

    // For small amounts (less than 1), show with decimals
    if (amount > 0 && amount < 1) {
      return new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "CRC",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    }

    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format time
  const formatTime = (minutes: number | null): string => {
    if (!minutes || minutes === 0) return "0m"

    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    const secs = Math.round((minutes % 1) * 60)

    if (hours > 0) {
      return `${hours}h ${mins}m`
    }

    if (mins > 0) {
      return `${mins}m`
    }

    // Less than 1 minute - show seconds
    return `${secs}s`
  }

  return (
    <div className="pb-6">
      {/* Breadcrumbs */}
      <div className="mb-4 print:hidden">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => router.push('/')}
          >
            <Home className="h-4 w-4" />
          </Button>
          <ChevronRight className="h-4 w-4" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => router.push('/work-orders')}
          >
            Órdenes de Trabajo
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">{workOrder.number}</span>
        </nav>
      </div>

      {/* Header with Title and Actions */}
      <div className="mb-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{workOrder.number}</h1>
              <WorkOrderStatusBadge status={workOrder.status} />
              <WorkOrderPriorityBadge priority={workOrder.priority} showIcon />
            </div>
            <p className="text-lg text-muted-foreground">{workOrder.title}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button size="sm" onClick={() => router.push(`/work-orders/${workOrder.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>
      </div>

      {/* Sticky Metrics Bar */}
      <div className="sticky top-16 z-10 mb-6 print:hidden">
        <Card className="shadow-none bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardContent className="py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Status */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Estado</p>
                  <p className="text-sm font-semibold">{workOrder.status}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {isCompleted ? 'Duración Total' : 'Tiempo Activo'}
                  </p>
                  <p className="text-sm font-semibold">
                    {formatTime(isCompleted ? displayTime : displayActiveTime)}
                  </p>
                </div>
              </div>

              {/* Cost */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {isCompleted && workOrder.actualCost && workOrder.actualCost > 0 ? 'Costo Total' : 'Costo Estimado'}
                  </p>
                  <p className="text-sm font-semibold">
                    {formatCurrency(displayCost)}
                  </p>
                </div>
              </div>

              {/* Asset/Site */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/10">
                  <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {workOrder.asset ? 'Activo' : 'Sede'}
                  </p>
                  <p className="text-sm font-semibold truncate">
                    {workOrder.asset?.name || workOrder.site?.name || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px] print:hidden">
        {/* Left Column - Main Content with Tabs */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general" className="gap-2">
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="time-costs" className="gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Tiempo & Costos</span>
              </TabsTrigger>
              <TabsTrigger value="materials" className="gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Materiales</span>
              </TabsTrigger>
              <TabsTrigger value="workflow" className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Workflow</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Actividad</span>
              </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-4 mt-6">
              <WorkOrderConsolidatedInfo workOrder={workOrder} />

              {/* Safety Briefing Signatures - ISO 45001 Compliance */}
              <SafetyBriefingSignaturesCard workOrderId={workOrder.id} />

              {/* Maintenance Component Card - Only for PREDICTIVE_MAINTENANCE feature */}
              {workOrder.maintenanceComponent && hasPredictiveMaintenance && (
                <MaintenanceComponentCard component={workOrder.maintenanceComponent} />
              )}

              {/* Maintenance Alerts - Only show if there are resolved alerts */}
              {workOrder.maintenanceAlerts && workOrder.maintenanceAlerts.length > 0 && hasPredictiveMaintenance && (
                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Alertas de Mantenimiento Resueltas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {workOrder.maintenanceAlerts.map((alert) => {
                      const severityColors = {
                        CRITICAL: 'destructive',
                        WARNING: 'outline',
                        INFO: 'secondary',
                      } as const

                      return (
                        <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
                          <AlertCircle className="h-5 w-5 mt-0.5 text-muted-foreground" />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-sm">{alert.componentName}</p>
                                {alert.partNumber && (
                                  <p className="text-xs text-muted-foreground">P/N: {alert.partNumber}</p>
                                )}
                              </div>
                              <Badge variant={severityColors[alert.severity]}>{alert.severity}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                            {alert.resolutionNotes && (
                              <div className="pt-2 border-t">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Notas de resolución:</p>
                                <p className="text-sm">{alert.resolutionNotes}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                              <span>
                                Creada: {new Date(alert.createdAt).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              {alert.resolvedAt && (
                                <span>
                                  Resuelta: {new Date(alert.resolvedAt).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              )}
                              {alert.resolvedBy && (
                                <span>Por: {alert.resolvedBy.name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Custom Fields */}
              {Object.keys(customFieldValues).length > 0 && (
                <WorkOrderCustomFieldsDisplay
                  customFields={workOrder.template?.customFields as { fields: NonNullable<CustomFieldsConfig['fields']> }}
                  customFieldValues={customFieldValues}
                />
              )}
            </TabsContent>

            {/* Time & Costs Tab */}
            <TabsContent value="time-costs" className="space-y-4 mt-6">
              {/* Time Summary - Always show */}
              <TimeSummaryCard workOrderId={workOrder.id} />

              {/* Cost Breakdown */}
              <WorkOrderCostBreakdownCard
                workOrderId={workOrder.id}
                laborCost={workOrder.laborCost}
                partsCost={workOrder.partsCost}
                otherCosts={workOrder.otherCosts}
                downtimeCost={workOrder.downtimeCost}
                actualCost={workOrder.actualCost}
                status={workOrder.status}
                canEdit={canEditCosts}
              />
            </TabsContent>

            {/* Materials Tab */}
            <TabsContent value="materials" className="space-y-4 mt-6">
              <WorkOrderToolsMaterials workOrder={workOrder} />
            </TabsContent>

            {/* Workflow Tab */}
            <TabsContent value="workflow" className="space-y-4 mt-6">
              <WorkflowSection workOrder={workOrder} />
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-4 mt-6">
              <WorkOrderCommentsSection workOrderId={workOrder.id} />

              {/* System Metadata */}
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg">Información del Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Creado por
                      </label>
                      <p className="text-sm font-medium">{workOrder.creator?.name || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Fecha de creación
                      </label>
                      <p className="text-sm font-medium">
                        {new Date(workOrder.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Última actualización
                      </label>
                      <p className="text-sm font-medium">
                        {new Date(workOrder.updatedAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    {workOrder.completedAt && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Completado
                        </label>
                        <p className="text-sm font-medium">
                          {new Date(workOrder.completedAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sticky Sidebar */}
        <div className="space-y-4">
          {/* Time Tracker - Always visible and sticky */}
          <div className="sticky top-48">
            <div className="space-y-4">
              {isActive ? (
                <TimeTrackerCard
                  workOrderId={workOrder.id}
                  workOrderStatus={workOrder.status}
                  onActionComplete={() => router.refresh()}
                />
              ) : (
                <Card className="shadow-none border-dashed">
                  <CardContent className="py-8 text-center">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Orden de trabajo {isCompleted ? 'completada' : 'no activa'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isCompleted ? 'Ver pestaña Tiempo & Costos para detalles' : 'No se puede realizar seguimiento de tiempo'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setActiveTab("workflow")}
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Ver Workflow
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setActiveTab("activity")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Ver Comentarios
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setActiveTab("time-costs")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Ver Tiempo & Costos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setActiveTab("materials")}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Ver Materiales
                  </Button>
                </CardContent>
              </Card>

              {/* Workflow Documents - Create New */}
              <Card className="shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Documentos de Seguridad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => router.push(`/safety/work-permits/new?workOrderId=${workOrder.id}`)}
                  >
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Crear Permiso
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => router.push(`/safety/loto-procedures/new?workOrderId=${workOrder.id}`)}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Crear LOTO
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => router.push(`/safety/job-safety-analyses/new?workOrderId=${workOrder.id}`)}
                  >
                    <HardHat className="mr-2 h-4 w-4" />
                    Crear JSA
                  </Button>
                  {workOrder.type === "CORRECTIVO" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => router.push(`/quality/root-cause-analyses/new?workOrderId=${workOrder.id}`)}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Crear RCA
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Version - Hidden on screen, shown when printing */}
      <PrintableWorkOrder ref={printRef} workOrder={workOrder} companyInfo={companyInfo} />
    </div>
  )
}

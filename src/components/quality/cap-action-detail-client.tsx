/**
 * CAP Action Detail Client Component
 *
 * Client component for interactive CAPA (Corrective and Preventive Action) details.
 * Following Next.js Expert standards:
 * - Client component for interactivity
 * - Under 200 lines
 * - Type-safe props
 * - Component composition
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  CheckCircle,
  Clock,
  ArrowLeft,
  ShieldCheck,
  User,
  Calendar,
  AlertTriangle
} from 'lucide-react'
import type { CAPActionWithRelations } from '@/types/cap-action.types'

interface CAPActionDetailClientProps {
  action: CAPActionWithRelations
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  IMPLEMENTED: 'bg-green-100 text-green-800',
  VERIFIED: 'bg-emerald-100 text-emerald-800',
  CLOSED: 'bg-gray-100 text-gray-800',
}

const statusLabels = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Progreso',
  IMPLEMENTED: 'Implementado',
  VERIFIED: 'Verificado',
  CLOSED: 'Cerrado',
}

const actionTypeLabels = {
  CORRECTIVE: 'Correctiva',
  PREVENTIVE: 'Preventiva',
}

const priorityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
}

export function CAPActionDetailClient({ action }: CAPActionDetailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cap-actions/${action.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al completar acción')
      }

      toast.success('Acción completada exitosamente')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al completar acción')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cap-actions/${action.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ effectiveness: 5 }), // Default effectiveness
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al verificar acción')
      }

      toast.success('Acción verificada exitosamente')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al verificar acción')
    } finally {
      setLoading(false)
    }
  }

  const isOverdue = action.dueDate && new Date(action.dueDate) < new Date() && action.status !== 'VERIFIED' && action.status !== 'CLOSED'

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Acción {actionTypeLabels[action.actionType]}
            </h1>
            <p className="text-muted-foreground mt-1">
              {action.rca?.workOrder?.code} - {action.rca?.failureMode}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={statusColors[action.status]}>
            {statusLabels[action.status]}
          </Badge>
          <Badge className={priorityColors[action.priority]}>
            {action.priority}
          </Badge>
        </div>
      </div>

      {isOverdue && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-sm font-medium text-red-800">Esta acción está vencida</span>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalles de la Acción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                <p className="text-sm">{action.description}</p>
              </div>

              {action.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notas</p>
                  <p className="text-sm">{action.notes}</p>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Asignado a</p>
                  <p className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {action.assigned?.name}
                  </p>
                </div>
                {action.dueDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha Límite</p>
                    <p className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(action.dueDate), 'PPp', { locale: es })}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">RCA Relacionado</p>
                <div className="border rounded-lg p-3 space-y-2">
                  <p className="text-sm font-medium">{action.rca?.failureMode}</p>
                  {action.rca?.rootCause && (
                    <p className="text-xs text-muted-foreground">Causa Raíz: {action.rca.rootCause}</p>
                  )}
                  {action.rca?.workOrder && (
                    <p className="text-xs text-muted-foreground">
                      OT: {action.rca.workOrder.code} - {action.rca.workOrder.title}
                    </p>
                  )}
                </div>
              </div>

              {action.effectiveness !== null && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Efectividad</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(action.effectiveness / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{action.effectiveness}/10</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Status Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Estado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Creado</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(action.createdAt), 'PPp', { locale: es })}
                  </p>
                </div>
              </div>

              {action.completedAt && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Implementado</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(action.completedAt), 'PPp', { locale: es })}
                    </p>
                  </div>
                </div>
              )}

              {action.verifiedAt && action.verifier && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Verificado</p>
                    <p className="text-xs text-muted-foreground">
                      {action.verifier.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(action.verifiedAt), 'PPp', { locale: es })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          {(action.status === 'PENDING' || action.status === 'IN_PROGRESS') && (
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-full"
                >
                  Marcar como Implementado
                </Button>
              </CardContent>
            </Card>
          )}

          {action.status === 'IMPLEMENTED' && (
            <Card>
              <CardHeader>
                <CardTitle>Verificación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={handleVerify}
                  disabled={loading}
                  className="w-full"
                >
                  Verificar Acción
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

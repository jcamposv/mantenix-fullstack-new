/**
 * Work Permit Detail Client Component
 *
 * Client component for interactive work permit details.
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
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react'
import type { WorkPermitWithRelations } from '@/types/work-permit.types'

interface WorkPermitDetailClientProps {
  permit: WorkPermitWithRelations
}

const permitTypeLabels = {
  HOT_WORK: 'Trabajo en Caliente',
  CONFINED_SPACE: 'Espacio Confinado',
  ELECTRICAL: 'Eléctrico',
  HEIGHT_WORK: 'Trabajo en Altura',
  EXCAVATION: 'Excavación',
  CHEMICAL: 'Químico',
  RADIATION: 'Radiación',
  GENERAL: 'General',
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING_AUTHORIZATION: 'bg-yellow-100 text-yellow-800',
  AUTHORIZED: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  SUSPENDED: 'bg-orange-100 text-orange-800',
  EXPIRED: 'bg-orange-100 text-orange-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export function WorkPermitDetailClient({ permit }: WorkPermitDetailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleAuthorize = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/work-permits/${permit.id}/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al autorizar permiso')
      }

      toast.success('Permiso autorizado exitosamente')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al autorizar permiso')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/work-permits/${permit.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al cerrar permiso')
      }

      toast.success('Permiso cerrado exitosamente')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cerrar permiso')
    } finally {
      setLoading(false)
    }
  }

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
              {permitTypeLabels[permit.permitType]}
            </h1>
            <p className="text-muted-foreground mt-1">
              Permiso de Trabajo #{permit.id.slice(-8)}
            </p>
          </div>
        </div>
        <Badge className={statusColors[permit.status]}>
          {permit.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orden de Trabajo</p>
                <p className="text-sm">{permit.workOrder?.number} - {permit.workOrder?.title}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Inicio</p>
                  <p className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(permit.validFrom), 'PPp', { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Expiración</p>
                  <p className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(permit.validUntil), 'PPp', { locale: es })}
                  </p>
                </div>
              </div>

              {permit.hazards && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Peligros Identificados</p>
                    <div className="flex flex-wrap gap-2">
                      {permit.hazards.map((hazard, index) => (
                        <Badge key={index} variant="outline">{hazard}</Badge>
                      ))}
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
              {/* Issued */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Emitido</p>
                  <p className="text-xs text-muted-foreground">
                    {permit.issuer?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(permit.createdAt), 'PPp', { locale: es })}
                  </p>
                </div>
              </div>

              {/* Authorized */}
              {permit.authorizedBy && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Autorizado</p>
                    <p className="text-xs text-muted-foreground">
                      {permit.authorizer?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(permit.authorizedAt!), 'PPp', { locale: es })}
                    </p>
                  </div>
                </div>
              )}

              {/* Closed */}
              {permit.closedAt && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <XCircle className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Cerrado</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(permit.closedAt), 'PPp', { locale: es })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          {permit.status === 'PENDING_AUTHORIZATION' && (
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={handleAuthorize}
                  disabled={loading}
                  className="w-full"
                >
                  Autorizar Permiso
                </Button>
              </CardContent>
            </Card>
          )}

          {permit.status === 'ACTIVE' && (
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={handleClose}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  Cerrar Permiso
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

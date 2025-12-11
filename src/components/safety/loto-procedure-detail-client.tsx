/**
 * LOTO Procedure Detail Client Component
 *
 * Client component for interactive LOTO procedure details.
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
  ShieldCheck,
  Lock,
  Tag
} from 'lucide-react'
import type { LOTOProcedureWithRelations } from '@/types/loto-procedure.types'

interface LOTOProcedureDetailClientProps {
  procedure: LOTOProcedureWithRelations
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPLIED: 'bg-blue-100 text-blue-800',
  VERIFIED: 'bg-green-100 text-green-800',
  REMOVED: 'bg-gray-100 text-gray-800',
}

const statusLabels = {
  PENDING: 'Pendiente',
  APPLIED: 'Aplicado',
  VERIFIED: 'Verificado',
  REMOVED: 'Removido',
}

export function LOTOProcedureDetailClient({ procedure }: LOTOProcedureDetailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleApply = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/loto-procedures/${procedure.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lockSerialNumbers: procedure.lockSerialNumbers,
          tagNumbers: procedure.tagNumbers,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al aplicar LOTO')
      }

      toast.success('LOTO aplicado exitosamente')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al aplicar LOTO')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/loto-procedures/${procedure.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al verificar LOTO')
      }

      toast.success('LOTO verificado exitosamente')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al verificar LOTO')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/loto-procedures/${procedure.id}/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al remover LOTO')
      }

      toast.success('LOTO removido exitosamente')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al remover LOTO')
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
              Procedimiento LOTO
            </h1>
            <p className="text-muted-foreground mt-1">
              {procedure.workOrder?.code} - {procedure.asset?.name}
            </p>
          </div>
        </div>
        <Badge className={statusColors[procedure.status]}>
          {statusLabels[procedure.status]}
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
                Información del Procedimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orden de Trabajo</p>
                <p className="text-sm">{procedure.workOrder?.code} - {procedure.workOrder?.title}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Activo</p>
                <p className="text-sm">{procedure.asset?.assetTag} - {procedure.asset?.name}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Puntos de Aislamiento</p>
                <div className="flex flex-wrap gap-2">
                  {procedure.isolationPoints.map((point, index) => (
                    <Badge key={index} variant="outline">{point}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Fuentes de Energía</p>
                <div className="flex flex-wrap gap-2">
                  {procedure.energySources.map((source, index) => (
                    <Badge key={index} variant="outline">{source}</Badge>
                  ))}
                </div>
              </div>

              {procedure.lockSerialNumbers.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Números de Serie de Candados
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {procedure.lockSerialNumbers.map((serial, index) => (
                      <Badge key={index} variant="secondary">{serial}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {procedure.tagNumbers.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Números de Etiquetas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {procedure.tagNumbers.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
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
                Estado del Procedimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Authorized */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Autorizado</p>
                  <p className="text-xs text-muted-foreground">
                    {procedure.authorized?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(procedure.createdAt), 'PPp', { locale: es })}
                  </p>
                </div>
              </div>

              {/* Applied */}
              {procedure.appliedAt && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Lock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Aplicado</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(procedure.appliedAt), 'PPp', { locale: es })}
                    </p>
                  </div>
                </div>
              )}

              {/* Verified */}
              {procedure.verifiedAt && procedure.verifier && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Verificado</p>
                    <p className="text-xs text-muted-foreground">
                      {procedure.verifier.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(procedure.verifiedAt), 'PPp', { locale: es })}
                    </p>
                  </div>
                </div>
              )}

              {/* Removed */}
              {procedure.removedAt && procedure.removalAuthorizer && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <XCircle className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Removido</p>
                    <p className="text-xs text-muted-foreground">
                      {procedure.removalAuthorizer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(procedure.removedAt), 'PPp', { locale: es })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          {procedure.status === 'PENDING' && (
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={handleApply}
                  disabled={loading}
                  className="w-full"
                >
                  Aplicar LOTO
                </Button>
              </CardContent>
            </Card>
          )}

          {procedure.status === 'APPLIED' && (
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={handleVerify}
                  disabled={loading}
                  className="w-full"
                >
                  Verificar LOTO
                </Button>
              </CardContent>
            </Card>
          )}

          {procedure.status === 'VERIFIED' && (
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={handleRemove}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  Remover LOTO
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

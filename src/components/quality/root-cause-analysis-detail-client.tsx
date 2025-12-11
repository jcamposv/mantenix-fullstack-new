/**
 * Root Cause Analysis Detail Client Component
 *
 * Client component for interactive RCA details.
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
  Send,
  AlertTriangle
} from 'lucide-react'
import type { RootCauseAnalysisWithRelations } from '@/types/root-cause-analysis.types'

interface RootCauseAnalysisDetailClientProps {
  rca: RootCauseAnalysisWithRelations
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  IN_ANALYSIS: 'bg-yellow-100 text-yellow-800',
  PENDING_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  IMPLEMENTING: 'bg-purple-100 text-purple-800',
  IMPLEMENTED: 'bg-teal-100 text-teal-800',
  VERIFIED: 'bg-emerald-100 text-emerald-800',
}

const statusLabels = {
  DRAFT: 'Borrador',
  IN_ANALYSIS: 'En Análisis',
  PENDING_REVIEW: 'Pendiente de Revisión',
  APPROVED: 'Aprobado',
  IMPLEMENTING: 'Implementando',
  IMPLEMENTED: 'Implementado',
  VERIFIED: 'Verificado',
}

const analysisTypeLabels = {
  FIVE_WHY: '5 Por Qués',
  FISHBONE: 'Diagrama de Ishikawa',
  FAULT_TREE: 'Árbol de Fallas',
  PARETO: 'Análisis de Pareto',
}

export function RootCauseAnalysisDetailClient({ rca }: RootCauseAnalysisDetailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmitForReview = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/root-cause-analyses/${rca.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al enviar RCA')
      }

      toast.success('RCA enviado para revisión')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al enviar RCA')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (approved: boolean) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/root-cause-analyses/${rca.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al revisar RCA')
      }

      toast.success(approved ? 'RCA aprobado' : 'RCA devuelto a análisis')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al revisar RCA')
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
              Análisis de Causa Raíz (RCA)
            </h1>
            <p className="text-muted-foreground mt-1">
              {rca.workOrder?.code} - {rca.failureMode}
            </p>
          </div>
        </div>
        <Badge className={statusColors[rca.status]}>
          {statusLabels[rca.status]}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información del Análisis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo de Análisis</p>
                <p className="text-sm">{analysisTypeLabels[rca.analysisType]}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Modo de Falla</p>
                <p className="text-sm">{rca.failureMode}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Síntoma Inmediato</p>
                <p className="text-sm">{rca.immediateSymptom}</p>
              </div>

              {rca.asset && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Activo</p>
                  <p className="text-sm">{rca.asset.assetTag} - {rca.asset.name}</p>
                </div>
              )}

              {rca.analysisType === 'FIVE_WHY' && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <p className="font-medium">Análisis 5 Por Qués</p>
                    {rca.why1 && <div><Badge variant="outline">Por qué 1:</Badge> <span className="text-sm ml-2">{rca.why1}</span></div>}
                    {rca.why2 && <div><Badge variant="outline">Por qué 2:</Badge> <span className="text-sm ml-2">{rca.why2}</span></div>}
                    {rca.why3 && <div><Badge variant="outline">Por qué 3:</Badge> <span className="text-sm ml-2">{rca.why3}</span></div>}
                    {rca.why4 && <div><Badge variant="outline">Por qué 4:</Badge> <span className="text-sm ml-2">{rca.why4}</span></div>}
                    {rca.why5 && <div><Badge variant="outline">Por qué 5:</Badge> <span className="text-sm ml-2">{rca.why5}</span></div>}
                  </div>
                </>
              )}

              {rca.rootCause && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Causa Raíz Identificada
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm font-medium">{rca.rootCause}</p>
                    </div>
                  </div>
                </>
              )}

              {rca.capActions && rca.capActions.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Acciones Correctivas (CAPA)</p>
                    <div className="space-y-2">
                      {rca.capActions.map((action) => (
                        <div key={action.id} className="flex items-center justify-between border rounded-lg p-2">
                          <span className="text-sm">{action.description}</span>
                          <Badge variant="secondary">{action.status}</Badge>
                        </div>
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
                Estado del RCA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Analyzed */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Analizado por</p>
                  <p className="text-xs text-muted-foreground">
                    {rca.analyzer?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(rca.createdAt), 'PPp', { locale: es })}
                  </p>
                </div>
              </div>

              {/* Reviewed */}
              {rca.reviewedAt && rca.reviewer && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Revisado</p>
                    <p className="text-xs text-muted-foreground">
                      {rca.reviewer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(rca.reviewedAt), 'PPp', { locale: es })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          {(rca.status === 'DRAFT' || rca.status === 'IN_ANALYSIS') && (
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={handleSubmitForReview}
                  disabled={loading}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar para Revisión
                </Button>
              </CardContent>
            </Card>
          )}

          {rca.status === 'PENDING_REVIEW' && (
            <Card>
              <CardHeader>
                <CardTitle>Acciones de Revisión</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => handleReview(true)}
                  disabled={loading}
                  className="w-full"
                >
                  Aprobar RCA
                </Button>
                <Button
                  onClick={() => handleReview(false)}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  Devolver a Análisis
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

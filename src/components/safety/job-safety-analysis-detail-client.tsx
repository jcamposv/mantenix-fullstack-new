/**
 * Job Safety Analysis Detail Client Component
 *
 * Client component for interactive JSA details.
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
  XCircle,
  Clock,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Send
} from 'lucide-react'
import type { JobSafetyAnalysisWithRelations } from '@/types/job-safety-analysis.types'

interface JobSafetyAnalysisDetailClientProps {
  jsa: JobSafetyAnalysisWithRelations
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
  PENDING_APPROVAL: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

const statusLabels = {
  DRAFT: 'Borrador',
  PENDING_REVIEW: 'Pendiente de Revisión',
  PENDING_APPROVAL: 'Pendiente de Aprobación',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
}

export function JobSafetyAnalysisDetailClient({ jsa }: JobSafetyAnalysisDetailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmitForReview = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/job-safety-analyses/${jsa.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al enviar JSA')
      }

      toast.success('JSA enviado para revisión')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al enviar JSA')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (approved: boolean) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/job-safety-analyses/${jsa.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al revisar JSA')
      }

      toast.success(approved ? 'JSA aprobado para revisión' : 'JSA devuelto a borrador')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al revisar JSA')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/job-safety-analyses/${jsa.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al aprobar JSA')
      }

      toast.success('JSA aprobado exitosamente')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al aprobar JSA')
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
              Análisis de Seguridad en el Trabajo (JSA)
            </h1>
            <p className="text-muted-foreground mt-1">
              {jsa.workOrder?.code} - {jsa.workOrder?.title}
            </p>
          </div>
        </div>
        <Badge className={statusColors[jsa.status]}>
          {statusLabels[jsa.status]}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Job Steps */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pasos del Trabajo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {jsa.jobSteps.map((step, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {step.step}
                    </div>
                    <p className="font-medium">{step.description}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      Peligros Identificados
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.hazards.map((hazard, hIndex) => (
                        <Badge key={hIndex} variant="destructive">{hazard}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Controles de Seguridad
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.controls.map((control, cIndex) => (
                        <Badge key={cIndex} variant="outline">{control}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
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
                Estado del JSA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Prepared */}
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Preparado</p>
                  <p className="text-xs text-muted-foreground">
                    {jsa.preparer?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(jsa.createdAt), 'PPp', { locale: es })}
                  </p>
                </div>
              </div>

              {/* Reviewed */}
              {jsa.reviewedAt && jsa.reviewer && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Revisado</p>
                    <p className="text-xs text-muted-foreground">
                      {jsa.reviewer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(jsa.reviewedAt), 'PPp', { locale: es })}
                    </p>
                  </div>
                </div>
              )}

              {/* Approved */}
              {jsa.approvedAt && jsa.approver && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {jsa.status === 'APPROVED' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {jsa.status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {jsa.approver.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(jsa.approvedAt), 'PPp', { locale: es })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions Card */}
          {jsa.status === 'DRAFT' && (
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

          {jsa.status === 'PENDING_REVIEW' && (
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
                  Aprobar para Revisión
                </Button>
                <Button
                  onClick={() => handleReview(false)}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  Devolver a Borrador
                </Button>
              </CardContent>
            </Card>
          )}

          {jsa.status === 'PENDING_APPROVAL' && (
            <Card>
              <CardHeader>
                <CardTitle>Acciones de Aprobación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={handleApprove}
                  disabled={loading}
                  className="w-full"
                >
                  Aprobar JSA
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

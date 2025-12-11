/**
 * Digital Signature Card Component
 *
 * Displays digital signature audit trail for work orders (ISO compliance).
 * Shows who signed, when, their role, and optional comments.
 *
 * Following Next.js Expert standards:
 * - Client component for SWR data fetching
 * - Single Responsibility: Only displays signature audit trail
 * - Type-safe with explicit interfaces
 * - Under 200 lines
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileCheck, Shield, CheckCircle2, AlertCircle, type LucideIcon } from 'lucide-react'
import useSWR from 'swr'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { DigitalSignatureWithRelations, SignatureType } from '@/types/digital-signature.types'

interface DigitalSignatureCardProps {
  workOrderId: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Signature type labels and icons
const signatureTypeConfig: Record<
  SignatureType,
  {
    label: string
    icon: LucideIcon
    color: string
  }
> = {
  CREATED: {
    label: 'Creada',
    icon: FileCheck,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  },
  APPROVED: {
    label: 'Aprobada',
    icon: CheckCircle2,
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  },
  REJECTED: {
    label: 'Rechazada',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
  AUTHORIZED: {
    label: 'Autorizada',
    icon: Shield,
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  },
  EXECUTED: {
    label: 'Ejecutada',
    icon: FileCheck,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  VERIFIED: {
    label: 'Verificada',
    icon: CheckCircle2,
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  },
  COMPLETED: {
    label: 'Completada',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  QA_SIGNOFF: {
    label: 'Aprobación QA',
    icon: Shield,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
  CLOSED: {
    label: 'Cerrada',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
}

function SignatureItem({ signature }: { signature: DigitalSignatureWithRelations }) {
  const config = signatureTypeConfig[signature.signatureType]

  const Icon = config.icon

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={config.color}>
                {config.label}
              </Badge>
              <span className="text-sm font-medium">{signature.signer?.name || 'Usuario desconocido'}</span>
              <span className="text-xs text-muted-foreground">
                ({signature.signer?.role || signature.role})
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(signature.signedAt), "PPpp", { locale: es })}
            </div>
            {signature.comments && (
              <div className="text-sm mt-2 p-2 rounded-md bg-muted">
                <p className="text-muted-foreground italic">&quot;{signature.comments}&quot;</p>
              </div>
            )}
            {(signature.ipAddress || signature.userAgent) && (
              <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                {signature.ipAddress && (
                  <div>IP: {signature.ipAddress}</div>
                )}
                {signature.userAgent && (
                  <div className="truncate" title={signature.userAgent}>
                    Navegador: {signature.userAgent}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DigitalSignatureCard({ workOrderId }: DigitalSignatureCardProps) {
  const { data, error, isLoading } = useSWR(
    `/api/work-orders/${workOrderId}/signatures`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const signatures = data?.signatures as DigitalSignatureWithRelations[] | undefined

  // Don't show card if no signatures
  if (!isLoading && (!signatures || signatures.length === 0)) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Firmas Digitales (ISO)
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Registro de auditoría de firmas digitales según normativa ISO 9001/55001
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            Cargando firmas digitales...
          </div>
        ) : error ? (
          <div className="text-sm text-destructive text-center py-8">
            Error al cargar firmas digitales
          </div>
        ) : signatures && signatures.length > 0 ? (
          <div className="space-y-4">
            {signatures.map((signature, index) => (
              <div key={signature.id}>
                <SignatureItem signature={signature} />
                {index < signatures.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

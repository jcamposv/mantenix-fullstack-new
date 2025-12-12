/**
 * Safety Briefing Signatures Card Component
 * Container for displaying all safety briefing confirmations
 *
 * Following Next.js Expert standards:
 * - Client component with 'use client'
 * - SWR for data fetching
 * - Proper loading/error states
 * - Composition with SafetyBriefingSignatureItem
 * - Under 150 lines
 */

"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck } from "lucide-react"
import { SafetyBriefingSignatureItem } from "./safety-briefing-signature-item"
import type { SafetyBriefingWithRelations } from "@/types/safety-briefing.types"

interface SafetyBriefingSignaturesCardProps {
  workOrderId: string
}

interface ApiBriefingsResponse {
  briefings: SafetyBriefingWithRelations[]
}

const fetcher = (url: string): Promise<ApiBriefingsResponse> =>
  fetch(url).then((r) => r.json())

export function SafetyBriefingSignaturesCard({ workOrderId }: SafetyBriefingSignaturesCardProps) {
  const { data, error, isLoading } = useSWR<ApiBriefingsResponse>(
    `/api/work-orders/${workOrderId}/safety-briefings`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const briefings = data?.briefings

  // Don't render if no briefings exist
  if (!isLoading && (!briefings || briefings.length === 0)) {
    return null
  }

  return (
    <Card className="shadow-none border-green-200 bg-green-50/30">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green-600" />
          Confirmaciones de Seguridad
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Técnicos que confirmaron haber revisado los documentos de seguridad (ISO 45001)
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            Cargando confirmaciones...
          </div>
        ) : error ? (
          <div className="text-sm text-destructive text-center py-8">
            Error al cargar confirmaciones
          </div>
        ) : briefings && briefings.length > 0 ? (
          <div className="space-y-4">
            {briefings.map((briefing, index) => (
              <div key={briefing.id}>
                <SafetyBriefingSignatureItem briefing={briefing} />
                {index < briefings.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

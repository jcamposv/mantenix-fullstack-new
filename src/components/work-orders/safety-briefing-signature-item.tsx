/**
 * Safety Briefing Signature Item Component
 * Displays a single safety briefing confirmation with signature
 *
 * Following Next.js Expert standards:
 * - Single Responsibility: Display one briefing
 * - Pure presentation component
 * - Type-safe props interface
 * - Under 100 lines
 */

import { Badge } from "@/components/ui/badge"
import { CheckCircle2, User, Calendar, FileText } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { SafetyBriefingWithRelations } from "@/types/safety-briefing.types"

interface SafetyBriefingSignatureItemProps {
  briefing: SafetyBriefingWithRelations
}

export function SafetyBriefingSignatureItem({ briefing }: SafetyBriefingSignatureItemProps) {
  return (
    <div className="space-y-3">
      {/* User Info Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
            <User className="h-5 w-5 text-green-700" />
          </div>
          <div>
            <p className="font-medium text-sm">{briefing.user?.name || 'Usuario desconocido'}</p>
            <p className="text-xs text-muted-foreground">{briefing.user?.email}</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Confirmado
        </Badge>
      </div>

      {/* Confirmed Documents Badges */}
      <div className="grid grid-cols-3 gap-2">
        {briefing.confirmedWorkPermits && (
          <div className="flex items-center gap-1.5 text-xs p-2 rounded bg-blue-50 border border-blue-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
            <span className="text-blue-900 font-medium">Permisos</span>
          </div>
        )}
        {briefing.confirmedLOTO && (
          <div className="flex items-center gap-1.5 text-xs p-2 rounded bg-orange-50 border border-orange-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-orange-600 flex-shrink-0" />
            <span className="text-orange-900 font-medium">LOTO</span>
          </div>
        )}
        {briefing.confirmedJSA && (
          <div className="flex items-center gap-1.5 text-xs p-2 rounded bg-purple-50 border border-purple-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
            <span className="text-purple-900 font-medium">JSA</span>
          </div>
        )}
      </div>

      {/* Confirmation Timestamp */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span>
          Confirmado el {format(new Date(briefing.confirmedAt), "PPpp", { locale: es })}
        </span>
      </div>

      {/* Digital Signature Image */}
      {briefing.signature && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            Firma Digital
          </div>
          <div className="relative bg-white border rounded-lg p-3 overflow-hidden">
            <img
              src={briefing.signature}
              alt={`Firma de ${briefing.user?.name}`}
              className={cn(
                "max-w-full h-auto",
                "max-h-24 object-contain"
              )}
            />
            <div className="absolute bottom-1 right-1 bg-white/90 px-2 py-0.5 rounded text-[10px] text-muted-foreground border">
              ISO 45001
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

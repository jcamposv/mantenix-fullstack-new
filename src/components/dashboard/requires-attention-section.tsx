/**
 * Requires Attention Section Component
 *
 * Displays critical items that need immediate action.
 * Includes work orders, alerts, and inventory issues.
 *
 * Following Next.js Expert standards:
 * - Small focused component (< 200 lines)
 * - Type-safe
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle,
  Clock,
  Package,
  ArrowRight,
  Wrench,
} from 'lucide-react'
import Link from 'next/link'

interface CriticalItem {
  id: string
  type: 'alert' | 'work_order' | 'inventory' | 'maintenance'
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium'
  actionUrl: string
  actionLabel: string
}

interface RequiresAttentionSectionProps {
  items: CriticalItem[]
}

const typeConfig = {
  alert: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  work_order: {
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  inventory: {
    icon: Package,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  maintenance: {
    icon: Wrench,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
}

const severityConfig = {
  critical: {
    label: 'Crítico',
    variant: 'destructive' as const,
  },
  high: {
    label: 'Alto',
    variant: 'default' as const,
  },
  medium: {
    label: 'Medio',
    variant: 'secondary' as const,
  },
}

export function RequiresAttentionSection({
  items,
}: RequiresAttentionSectionProps) {
  if (items.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-green-700">
            <div className="p-2 rounded-full bg-green-100">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Todo bajo control</p>
              <p className="text-sm text-green-600">
                No hay items críticos que requieran atención inmediata
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg">
              Requiere Atención Inmediata
            </CardTitle>
            <Badge variant="secondary">{items.length}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => {
          const config = typeConfig[item.type]
          const Icon = config.icon
          const severityInfo = severityConfig[item.severity]

          return (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 bg-background rounded-lg border"
            >
              <div className={`p-2 rounded-lg ${config.bgColor}`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-medium text-sm leading-tight">
                    {item.title}
                  </p>
                  <Badge variant={severityInfo.variant} className="text-xs">
                    {severityInfo.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              </div>

              <Button size="sm" variant="ghost" asChild>
                <Link href={item.actionUrl}>
                  <span className="text-xs">{item.actionLabel}</span>
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

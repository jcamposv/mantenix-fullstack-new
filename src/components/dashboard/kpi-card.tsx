"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string | number
  change?: {
    value: number
    period: string
  }
  icon: LucideIcon
  description?: string
  trend?: "up" | "down" | "neutral"
  className?: string
}

export function KPICard({
  title,
  value,
  change,
  icon: Icon,
  description,
  trend = "neutral",
  className
}: KPICardProps) {
  const getTrendBadgeVariant = () => {
    switch (trend) {
      case "up": return "default"
      case "down": return "destructive"
      default: return "secondary"
    }
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        
        <div className="flex items-center justify-between mt-2">
          {description && (
            <p className="text-xs text-muted-foreground flex-1">
              {description}
            </p>
          )}
          
          {change && (
            <Badge variant={getTrendBadgeVariant()} className="text-xs">
              {change.value > 0 ? "+" : ""}{change.value}% {change.period}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
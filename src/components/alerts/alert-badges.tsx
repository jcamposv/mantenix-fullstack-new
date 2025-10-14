import { Badge } from "@/components/ui/badge"
import { alertPriorities } from "@/schemas/alert"

export const getPriorityBadge = (priority: string) => {
  const priorityConfig = alertPriorities.find(p => p.value === priority)
  if (!priorityConfig) return null

  const variants = {
    LOW: "secondary",
    MEDIUM: "default", 
    HIGH: "warning",
    CRITICAL: "destructive"
  } as const

  return (
    <Badge variant={variants[priority as keyof typeof variants] || "default"}>
      {priorityConfig.label}
    </Badge>
  )
}

export const getStatusBadge = (status: string) => {
  const variants = {
    OPEN: "destructive",
    IN_PROGRESS: "default",
    RESOLVED: "secondary",
    CLOSED: "outline"
  } as const

  const labels = {
    OPEN: "Abierta",
    IN_PROGRESS: "En Progreso", 
    RESOLVED: "Resuelta",
    CLOSED: "Cerrada"
  } as const

  return (
    <Badge variant={variants[status as keyof typeof variants] || "default"}>
      {labels[status as keyof typeof labels] || status}
    </Badge>
  )
}

export const getStatusIcon = (status: string) => {
  const icons = {
    OPEN: "🔴",
    IN_PROGRESS: "🟡",
    RESOLVED: "🟢", 
    CLOSED: "⚫"
  } as const

  return icons[status as keyof typeof icons] || "❓"
}
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, CheckCircle2, Clock, Briefcase, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AttendanceReportsStatsProps {
  stats: {
    month: number
    year: number
    totalDays: number
    daysPresent: number
    daysOnTime: number
    daysLate: number
    daysAbsent: number
    totalWorkHours: number
    averageLateMinutes: number
  }
}

export const AttendanceReportsStats = ({ stats }: AttendanceReportsStatsProps) => {
  // Valores seguros (manejar undefined/null)
  const safeDaysPresent = stats.daysPresent ?? 0
  const safeDaysOnTime = stats.daysOnTime ?? 0
  const safeDaysLate = stats.daysLate ?? 0
  const safeTotalWorkHours = stats.totalWorkHours ?? 0
  const safeAverageLateMinutes = stats.averageLateMinutes ?? 0

  // Calcular puntualidad (porcentaje de días a tiempo sobre días presentes)
  const punctualityRate = safeDaysPresent > 0
    ? Math.round((safeDaysOnTime / safeDaysPresent) * 100)
    : 0

  // Calcular tasa de asistencia (días presentes sobre días del mes hasta hoy)
  const today = new Date()
  const isCurrentMonth = stats.month === (today.getMonth() + 1) && stats.year === today.getFullYear()
  const daysUntilToday = isCurrentMonth ? today.getDate() : stats.totalDays
  const attendanceRate = daysUntilToday > 0
    ? Math.round((safeDaysPresent / daysUntilToday) * 100)
    : 0

  // Formatear horas trabajadas
  const totalHours = Math.floor(safeTotalWorkHours)
  const avgHoursPerDay = safeDaysPresent > 0
    ? (safeTotalWorkHours / safeDaysPresent).toFixed(1)
    : "0"

  // Formatear retraso promedio
  const avgLateTime = safeAverageLateMinutes > 0
    ? safeAverageLateMinutes >= 60
      ? `${Math.floor(safeAverageLateMinutes / 60)}h ${Math.round(safeAverageLateMinutes % 60)}m`
      : `${Math.round(safeAverageLateMinutes)} min`
    : "0 min"

  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {/* Tasa de Asistencia */}
      <Card className={cn(
        "shadow-none",
        attendanceRate >= 90 ? "border-success/30" : attendanceRate >= 70 ? "border-info/30" : "border-warning/30"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              "p-1.5 rounded-md",
              attendanceRate >= 90 ? "bg-success/10" : attendanceRate >= 70 ? "bg-info/10" : "bg-warning/10"
            )}>
              <User className={cn(
                "h-4 w-4",
                attendanceRate >= 90 ? "text-success" : attendanceRate >= 70 ? "text-info" : "text-warning"
              )} />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Asistencia</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className={cn(
              "text-2xl font-bold",
              attendanceRate >= 90 ? "text-success" : attendanceRate >= 70 ? "text-info" : "text-warning"
            )}>{attendanceRate}%</p>
            <span className="text-xs text-muted-foreground">
              {safeDaysPresent}/{isCurrentMonth ? daysUntilToday : stats.totalDays}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Puntualidad */}
      <Card className={cn(
        "shadow-none",
        punctualityRate >= 90 ? "border-success/30" : punctualityRate >= 70 ? "border-warning/30" : "border-destructive/30"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              "p-1.5 rounded-md",
              punctualityRate >= 90 ? "bg-success/10" : punctualityRate >= 70 ? "bg-warning/10" : "bg-destructive/10"
            )}>
              <CheckCircle2 className={cn(
                "h-4 w-4",
                punctualityRate >= 90 ? "text-success" : punctualityRate >= 70 ? "text-warning" : "text-destructive"
              )} />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Puntualidad</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className={cn(
              "text-2xl font-bold",
              punctualityRate >= 90 ? "text-success" : punctualityRate >= 70 ? "text-warning" : "text-destructive"
            )}>{punctualityRate}%</p>
            <Badge variant="secondary" className={cn(
              "text-xs px-1.5 py-0",
              punctualityRate >= 90 ? "bg-success/10 text-success" :
              punctualityRate >= 70 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
            )}>
              {safeDaysOnTime}/{safeDaysPresent}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Días a Tiempo */}
      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">A Tiempo</p>
          </div>
          <p className="text-2xl font-bold text-success">{safeDaysOnTime}</p>
        </CardContent>
      </Card>

      {/* Retrasos */}
      <Card className={cn(
        "shadow-none",
        safeDaysLate > 0 && "border-warning/30"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-warning/10">
              <Clock className="h-4 w-4 text-warning" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Retrasos</p>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-warning">{safeDaysLate}</p>
            <span className="text-xs text-muted-foreground">{avgLateTime}</span>
          </div>
        </CardContent>
      </Card>

      {/* Ausencias */}
      <Card className={cn(
        "shadow-none",
        stats.daysAbsent > 0 && "border-destructive/30"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-destructive/10">
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Ausencias</p>
          </div>
          <p className="text-2xl font-bold text-destructive">{stats.daysAbsent}</p>
        </CardContent>
      </Card>

      {/* Horas Trabajadas */}
      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Horas</p>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-primary">{totalHours}h</p>
            <span className="text-xs text-muted-foreground">{avgHoursPerDay}h/día</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

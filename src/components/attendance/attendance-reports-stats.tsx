"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, CheckCircle2, Clock, Briefcase } from "lucide-react"

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Tasa de Asistencia */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Asistencia</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{attendanceRate}%</div>
          <p className="text-xs text-muted-foreground">
            {safeDaysPresent} de {isCurrentMonth ? `${daysUntilToday} días` : `${stats.totalDays} días`}
          </p>
        </CardContent>
      </Card>

      {/* Puntualidad */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Puntualidad</CardTitle>
          <CheckCircle2 className={`h-4 w-4 ${punctualityRate >= 90 ? 'text-green-600' : punctualityRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${punctualityRate >= 90 ? 'text-green-600' : punctualityRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
            {punctualityRate}%
          </div>
          <p className="text-xs text-muted-foreground">
            {safeDaysOnTime} días a tiempo de {safeDaysPresent}
          </p>
        </CardContent>
      </Card>

      {/* Horas Trabajadas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Horas Trabajadas</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalHours}h</div>
          <p className="text-xs text-muted-foreground">
            Promedio: {avgHoursPerDay}h/día
          </p>
        </CardContent>
      </Card>

      {/* Retrasos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Retrasos</CardTitle>
          <Clock className={`h-4 w-4 ${safeDaysLate === 0 ? 'text-green-600' : 'text-yellow-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${safeDaysLate === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
            {safeDaysLate}
          </div>
          <p className="text-xs text-muted-foreground">
            Promedio: {avgLateTime}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

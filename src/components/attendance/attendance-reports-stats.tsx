"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, CheckCircle2, Clock, AlertCircle } from "lucide-react"

interface MonthlyReportStats {
  totalDays: number
  daysPresent: number
  daysOnTime: number
  daysLate: number
  daysAbsent: number
  averageMinutesLate: number
}

interface AttendanceReportsStatsProps {
  stats: MonthlyReportStats
}

export const AttendanceReportsStats = ({ stats }: AttendanceReportsStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Días Presente</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.daysPresent}</div>
          <p className="text-xs text-muted-foreground">
            de {stats.totalDays} días laborales
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">A Tiempo</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.daysOnTime}</div>
          <p className="text-xs text-muted-foreground">
            {stats.daysPresent > 0
              ? Math.round((stats.daysOnTime / stats.daysPresent) * 100)
              : 0}% de asistencias
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tarde</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.daysLate}</div>
          <p className="text-xs text-muted-foreground">
            {stats.averageMinutesLate > 0
              ? `~${Math.round(stats.averageMinutesLate)} min promedio`
              : "Sin retrasos"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ausente</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.daysAbsent}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalDays > 0
              ? Math.round((stats.daysAbsent / stats.totalDays) * 100)
              : 0}% del mes
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

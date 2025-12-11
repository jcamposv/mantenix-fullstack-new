/**
 * Attendance Section Component
 *
 * Displays today's attendance statistics.
 * Only shown if HR_ATTENDANCE feature is enabled.
 *
 * Following Next.js Expert standards:
 * - Small focused component (< 200 lines)
 * - Type-safe
 */

import { StatCard } from '../stat-card'
import type { AttendanceStats } from '@/server/services/dashboard.service'
import { Users, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'

interface AttendanceSectionProps {
  stats: AttendanceStats
}

export function AttendanceSection({ stats }: AttendanceSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Users className="h-5 w-5" />
        Asistencia (Hoy)
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Presentes"
          value={stats.todayPresent}
          icon={CheckCircle}
          description="Marcaron entrada"
        />
        <StatCard
          title="Ausentes"
          value={stats.todayAbsent}
          icon={AlertTriangle}
          description="Sin marcaje"
        />
        <StatCard
          title="Con Permiso"
          value={stats.onLeave}
          icon={Users}
          description="Vacaciones/permisos"
        />
        <StatCard
          title="Tasa de Asistencia"
          value={`${stats.attendanceRate.toFixed(1)}%`}
          icon={TrendingUp}
          description="Hoy"
        />
      </div>
    </div>
  )
}

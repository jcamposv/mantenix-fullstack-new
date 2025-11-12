"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CheckCircle2, Clock, XCircle } from "lucide-react"

interface DayRecord {
  day: number
  date: string
  status: "ON_TIME" | "LATE" | "ABSENT" | null
  checkInAt?: string
  checkOutAt?: string
  lateMinutes?: number
}

interface AttendanceReportsChartProps {
  records: DayRecord[]
  month: string
  year: number
}

interface TooltipPayload {
  color: string
  name: string
  value: number
  dataKey: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string | number
}

// Custom tooltip component for better UX
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null

  const onTime = payload.find(p => p.dataKey === 'A_Tiempo')?.value || 0
  const late = payload.find(p => p.dataKey === 'Tarde')?.value || 0
  const absent = payload.find(p => p.dataKey === 'Ausente')?.value || 0
  const total = Number(onTime) + Number(late) + Number(absent)

  return (
    <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 min-w-[160px]">
      <p className="text-sm font-semibold mb-2 text-foreground">
        Día {label}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            <span className="text-xs text-muted-foreground">A Tiempo</span>
          </div>
          <span className="text-xs font-semibold text-success">{onTime}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-warning" />
            <span className="text-xs text-muted-foreground">Tarde</span>
          </div>
          <span className="text-xs font-semibold text-warning">{late}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5 text-destructive" />
            <span className="text-xs text-muted-foreground">Ausente</span>
          </div>
          <span className="text-xs font-semibold text-destructive">{absent}</span>
        </div>
        {total > 0 && (
          <>
            <div className="border-t my-1.5" />
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-foreground">Total</span>
              <span className="text-xs font-semibold text-foreground">{total}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export const AttendanceReportsChart = ({ records, month, year }: AttendanceReportsChartProps) => {
  // Agrupar registros por día para evitar duplicados
  const recordsByDay = records.reduce((acc, record) => {
    // Use checkInAt if available, otherwise use date field
    const dateStr = record.checkInAt || record.date
    if (!dateStr) return acc

    const day = new Date(dateStr).getDate()
    if (!acc[day]) {
      acc[day] = { day, onTime: 0, late: 0, absent: 0 }
    }

    if (record.status === "ON_TIME") acc[day].onTime++
    else if (record.status === "LATE") acc[day].late++
    else if (record.status === "ABSENT" || !record.status) acc[day].absent++

    return acc
  }, {} as Record<number, { day: number; onTime: number; late: number; absent: number }>)

  // Convertir a array y ordenar por día
  const chartData = Object.values(recordsByDay)
    .map(({ day, onTime, late, absent }) => ({
      day,
      A_Tiempo: onTime,
      Tarde: late,
      Ausente: absent,
    }))
    .sort((a, b) => a.day - b.day)

  // Calculate summary stats
  const totalOnTime = chartData.reduce((sum, d) => sum + d.A_Tiempo, 0)
  const totalLate = chartData.reduce((sum, d) => sum + d.Tarde, 0)
  const totalAbsent = chartData.reduce((sum, d) => sum + d.Ausente, 0)
  const totalRecords = totalOnTime + totalLate + totalAbsent

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Asistencia del Mes</CardTitle>
            <CardDescription>
              Distribución diaria de {month} {year}
            </CardDescription>
          </div>
          {totalRecords > 0 && (
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-success" />
                <span className="text-muted-foreground">{totalOnTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-warning" />
                <span className="text-muted-foreground">{totalLate}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-destructive" />
                <span className="text-muted-foreground">{totalAbsent}</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorOnTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
            />
            <Legend
              wrapperStyle={{
                fontSize: '12px',
                paddingTop: '16px'
              }}
              iconType="circle"
              iconSize={8}
            />
            <Bar
              dataKey="A_Tiempo"
              fill="url(#colorOnTime)"
              name="A Tiempo"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
            <Bar
              dataKey="Tarde"
              fill="url(#colorLate)"
              name="Tarde"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
            <Bar
              dataKey="Ausente"
              fill="url(#colorAbsent)"
              name="Ausente"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

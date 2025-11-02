"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asistencia del Mes</CardTitle>
        <CardDescription>
          Distribución diaria de {month} {year}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              label={{ value: 'Día del mes', position: 'insideBottom', offset: -5 }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="A_Tiempo" fill="#22c55e" name="A Tiempo" />
            <Bar dataKey="Tarde" fill="#eab308" name="Tarde" />
            <Bar dataKey="Ausente" fill="#ef4444" name="Ausente" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

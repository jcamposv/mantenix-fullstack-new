"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { TrendingUp } from "lucide-react"
import { AttendanceReportsLoading } from "@/components/attendance/attendance-reports-loading"
import { AttendanceReportsFilters } from "@/components/attendance/attendance-reports-filters"
import { AttendanceReportsStats } from "@/components/attendance/attendance-reports-stats"
import { AttendanceReportsChart } from "@/components/attendance/attendance-reports-chart"
import { AttendanceReportsTable } from "@/components/attendance/attendance-reports-table"
import type { MonthlyAttendanceReport } from "@/types/attendance.types"

interface User {
  id: string
  name: string
  email: string
  role: string
}

const MONTHS = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
]

export default function AttendanceReportsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<number>(1)
  const [selectedYear, setSelectedYear] = useState<number>(2024) // Default year, will be updated on client
  
  // Initialize with current date on client side only to avoid hydration mismatch
  useEffect(() => {
    const now = new Date()
    setSelectedMonth(now.getMonth() + 1)
    setSelectedYear(now.getFullYear())
  }, [])
  const [report, setReport] = useState<MonthlyAttendanceReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])

        if (data.users && data.users.length > 0) {
          setSelectedUserId(data.users[0].id)
        }
      } else {
        toast.error("Error al cargar usuarios")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Error al cargar usuarios")
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchReport = useCallback(async () => {
    if (!selectedUserId) {
      toast.error("Selecciona un usuario")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `/api/attendance/monthly-report?userId=${selectedUserId}&month=${selectedMonth}&year=${selectedYear}`
      )

      if (response.ok) {
        const data = await response.json()
        setReport(data)
      } else {
        const error = await response.json()
        toast.error(error.error || "Error al cargar reporte")
        setReport(null)
      }
    } catch (error) {
      console.error("Error fetching report:", error)
      toast.error("Error al cargar reporte")
      setReport(null)
    } finally {
      setLoading(false)
    }
  }, [selectedUserId, selectedMonth, selectedYear])

  useEffect(() => {
    if (selectedUserId && selectedMonth && selectedYear) {
      fetchReport()
    }
  }, [selectedUserId, selectedMonth, selectedYear, fetchReport])

  if (loadingUsers) {
    return (
      <div className="container mx-auto py-6">
        <AttendanceReportsLoading />
      </div>
    )
  }

  const monthLabel = MONTHS.find(m => m.value === selectedMonth)?.label || ""

  // Convert AttendanceRecordBasic[] to DayRecord[] for the chart
  const convertRecordsToDayRecords = () => {
    if (!report) return []

    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
    const today = new Date()
    const isCurrentMonth = selectedMonth === (today.getMonth() + 1) && selectedYear === today.getFullYear()
    const maxDay = isCurrentMonth ? today.getDate() : daysInMonth

    const dayRecords: Array<{
      day: number
      date: string
      status: "ON_TIME" | "LATE" | "ABSENT" | null
      checkInAt?: string
      checkOutAt?: string
      lateMinutes?: number
    }> = []

    // Create a map of records by day
    const recordsByDay = new Map<number, typeof report.records[0]>()
    report.records.forEach((record) => {
      const checkInDate = new Date(record.checkInAt)
      const day = checkInDate.getDate()
      recordsByDay.set(day, record)
    })

    // Create DayRecord only for days that have passed (not future days)
    for (let day = 1; day <= maxDay; day++) {
      const record = recordsByDay.get(day)
      const date = new Date(selectedYear, selectedMonth - 1, day)

      // Only include if it's a record or if we want to show days without records
      if (record) {
        // Convert AttendanceStatus to DayRecord status (handle JUSTIFIED as ON_TIME)
        const status = record.status === "JUSTIFIED" ? "ON_TIME" : (record.status as "ON_TIME" | "LATE" | "ABSENT")
        dayRecords.push({
          day,
          date: date.toISOString(),
          status,
          checkInAt: new Date(record.checkInAt).toISOString(),
          checkOutAt: record.checkOutAt ? new Date(record.checkOutAt).toISOString() : undefined,
          lateMinutes: record.lateMinutes || undefined,
        })
      }
    }

    return dayRecords
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes de Asistencia</h1>
          <p className="text-muted-foreground mt-1">
            Análisis detallado de puntualidad y asistencia del personal
          </p>
        </div>

        {/* Filters */}
        <AttendanceReportsFilters
          users={users}
          selectedUserId={selectedUserId}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onUserChange={setSelectedUserId}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />

        {loading ? (
          <AttendanceReportsLoading />
        ) : report ? (
          <>
            <AttendanceReportsStats
              stats={{
                month: report.month,
                year: report.year,
                totalDays: report.totalDays,
                daysPresent: report.daysPresent,
                daysOnTime: report.daysOnTime,
                daysLate: report.daysLate,
                daysAbsent: report.daysAbsent,
                totalWorkHours: report.totalWorkHours,
                averageLateMinutes: report.averageLateMinutes,
              }}
            />

            <AttendanceReportsChart
              records={convertRecordsToDayRecords()}
              month={monthLabel}
              year={selectedYear}
            />

            <AttendanceReportsTable records={report.records} />
          </>
        ) : (
          <Card className="shadow-none">
            <CardContent className="py-12 text-center text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                Selecciona un usuario para ver su reporte
              </p>
              <p className="text-sm">
                Usa los filtros arriba para seleccionar el usuario, mes y año
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

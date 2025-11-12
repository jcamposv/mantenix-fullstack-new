"use client"

import { useState, useEffect, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DataTable } from "@/components/ui/data-table"
import { Clock, MapPin, LogIn, LogOut } from "lucide-react"
import { AttendanceListFilters } from "@/components/attendance/attendance-list-filters"
import type { AttendanceRecordWithRelations } from "@/types/attendance.types"
import { AttendanceStatus } from "@prisma/client"

const statusConfig = {
  ON_TIME: {
    label: "A Tiempo",
    variant: "default" as const,
  },
  LATE: {
    label: "Tarde",
    variant: "secondary" as const,
  },
  ABSENT: {
    label: "Ausente",
    variant: "destructive" as const,
  },
  JUSTIFIED: {
    label: "Justificado",
    variant: "outline" as const,
  },
  EARLY_DEPARTURE: {
    label: "Salida Temprana",
    variant: "secondary" as const,
  },
}

const formatTime = (date: string | Date) => {
  return new Date(date).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const formatDuration = (minutes: number | null) => {
  if (!minutes) return "-"
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

export default function AttendanceListPage() {
  const [records, setRecords] = useState<AttendanceRecordWithRelations[]>([])
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedUserId, setSelectedUserId] = useState("all")
  const [selectedLocationId, setSelectedLocationId] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Build query params
  const queryParams = useMemo(() => {
    const params = new URLSearchParams()
    if (selectedUserId !== "all") params.append("userId", selectedUserId)
    if (selectedLocationId !== "all") params.append("locationId", selectedLocationId)
    if (selectedStatus !== "all") params.append("status", selectedStatus)
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)
    return params.toString()
  }, [selectedUserId, selectedLocationId, selectedStatus, startDate, endDate])

  // Fetch records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true)
        const url = `/api/attendance${queryParams ? `?${queryParams}` : ""}`
        const response = await fetch(url)

        if (response.ok) {
          const data = await response.json()
          setRecords(data.records || data)
        }
      } catch (error) {
        console.error("Error fetching attendance records:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [queryParams])

  // Fetch users and locations for filters
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [usersRes, locationsRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/admin/locations"),
        ])

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData.users || usersData)
        }

        if (locationsRes.ok) {
          const locationsData = await locationsRes.json()
          setLocations(locationsData)
        }
      } catch (error) {
        console.error("Error fetching filters data:", error)
      }
    }

    fetchFiltersData()
  }, [])

  const handleClearFilters = () => {
    setSelectedUserId("all")
    setSelectedLocationId("all")
    setSelectedStatus("all")
    setStartDate("")
    setEndDate("")
  }

  const columns: ColumnDef<AttendanceRecordWithRelations>[] = [
    {
      id: "user.name",
      accessorKey: "user",
      header: "Usuario",
      cell: ({ row }) => {
        const user = row.original.user
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      id: "checkInDate",
      accessorKey: "checkInAt",
      header: "Fecha",
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {formatDate(row.original.checkInAt)}
          </div>
        )
      },
    },
    {
      id: "checkInTime",
      accessorKey: "checkInAt",
      header: "Entrada",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <LogIn className="h-4 w-4 text-muted-foreground" />
            <span>{formatTime(row.original.checkInAt)}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "checkOutAt",
      header: "Salida",
      cell: ({ row }) => {
        const checkOut = row.original.checkOutAt
        return checkOut ? (
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4 text-muted-foreground" />
            <span>{formatTime(checkOut)}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: "workDurationMinutes",
      header: "Duración",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatDuration(row.original.workDurationMinutes)}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.original.status as AttendanceStatus
        const config = statusConfig[status]
        return <Badge variant={config.variant}>{config.label}</Badge>
      },
    },
    {
      accessorKey: "location",
      header: "Ubicación",
      cell: ({ row }) => {
        const location = row.original.location
        return location ? (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{location.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
  ]

  return (
    <div className="container mx-auto py-0 space-y-4">
      <AttendanceListFilters
        users={users}
        locations={locations}
        selectedUserId={selectedUserId}
        selectedLocationId={selectedLocationId}
        selectedStatus={selectedStatus}
        startDate={startDate}
        endDate={endDate}
        onUserChange={setSelectedUserId}
        onLocationChange={setSelectedLocationId}
        onStatusChange={setSelectedStatus}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClearFilters={handleClearFilters}
      />

      <DataTable
        columns={columns}
        data={records}
        searchKey="user.name"
        searchPlaceholder="Buscar por usuario..."
        title="Registros de Asistencia"
        description="Visualiza y gestiona todos los registros de asistencia de tu equipo"
        loading={loading}
      />
    </div>
  )
}

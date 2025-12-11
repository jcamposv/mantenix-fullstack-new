"use client"

import { useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DataTable } from "@/components/ui/data-table"
import { FilterButton } from "@/components/common/filter-button"
import { AttendanceFilters } from "@/components/attendance/attendance-filters"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, LogIn, LogOut, CheckCircle } from "lucide-react"
import { JustifyAttendanceDialog } from "@/components/attendance/justify-attendance-dialog"
import { usePermissions } from "@/hooks/usePermissions"
import type { AttendanceRecordWithRelations } from "@/types/attendance.types"
import { AttendanceStatus } from "@prisma/client"
import {
  useAttendance,
  type AttendanceFilters as AttendanceFilterType,
} from '@/hooks/use-attendance'

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
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<AttendanceFilterType>({})
  const limit = 20

  const { records, loading, total, totalPages, refetch } = useAttendance({
    page,
    limit,
    search,
    filters,
    autoRefresh: false,
  })

  // Justify dialog
  const [justifyDialogOpen, setJustifyDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecordWithRelations | null>(null)

  // Permissions
  const { hasPermission } = usePermissions()
  const canManageAttendance = hasPermission("attendance.manage")

  const handleJustifyClick = (record: AttendanceRecordWithRelations) => {
    setSelectedRecord(record)
    setJustifyDialogOpen(true)
  }

  const handleJustifySuccess = () => {
    refetch()
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
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const record = row.original
        const canJustify = canManageAttendance && record.status !== "JUSTIFIED"

        return (
          <div className="flex items-center gap-2">
            {canJustify && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleJustifyClick(record)}
                className="h-8 px-2"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Justificar
              </Button>
            )}
            {record.status === "JUSTIFIED" && (
              <Badge variant="outline" className="bg-info/10 text-info border-info/20">
                Justificado
              </Badge>
            )}
          </div>
        )
      },
    },
  ]

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.status) count++
    return count
  }, [filters])

  const hasActiveFilters = activeFiltersCount > 0

  const handleClearFilters = () => {
    setFilters({})
    setPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="container mx-auto py-0 space-y-4">
      <DataTable
        columns={columns}
        data={records}
        searchKey="user.name"
        searchPlaceholder="Buscar por usuario..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        title="Registros de Asistencia"
        description={`${total} registros | Visualiza y gestiona todos los registros de asistencia`}
        loading={loading}
        manualPagination={true}
        pageCount={totalPages}
        pageIndex={page - 1}
        pageSize={limit}
        onPageChange={setPage}
        toolbar={
          <FilterButton
            title="Filtros de Asistencia"
            hasActiveFilters={hasActiveFilters}
            activeFiltersCount={activeFiltersCount}
            onReset={handleClearFilters}
            contentClassName="w-[300px]"
          >
            <AttendanceFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </FilterButton>
        }
      />

      <JustifyAttendanceDialog
        record={selectedRecord}
        open={justifyDialogOpen}
        onOpenChange={setJustifyDialogOpen}
        onSuccess={handleJustifySuccess}
      />
    </div>
  )
}

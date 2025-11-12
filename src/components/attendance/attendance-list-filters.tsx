"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
}

interface Location {
  id: string
  name: string
}

interface AttendanceListFiltersProps {
  users: User[]
  locations: Location[]
  selectedUserId: string
  selectedLocationId: string
  selectedStatus: string
  startDate: string
  endDate: string
  onUserChange: (userId: string) => void
  onLocationChange: (locationId: string) => void
  onStatusChange: (status: string) => void
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onClearFilters: () => void
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "ON_TIME", label: "A Tiempo" },
  { value: "LATE", label: "Tarde" },
  { value: "ABSENT", label: "Ausente" },
  { value: "JUSTIFIED", label: "Justificado" },
  { value: "EARLY_DEPARTURE", label: "Salida Temprana" },
]

export const AttendanceListFilters = ({
  users,
  locations,
  selectedUserId,
  selectedLocationId,
  selectedStatus,
  startDate,
  endDate,
  onUserChange,
  onLocationChange,
  onStatusChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
}: AttendanceListFiltersProps) => {
  const hasActiveFilters =
    selectedUserId !== "all" ||
    selectedLocationId !== "all" ||
    selectedStatus !== "all" ||
    startDate !== "" ||
    endDate !== ""

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-2 lg:px-3"
            >
              <X className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Usuario */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Usuario</label>
            <Select value={selectedUserId} onValueChange={onUserChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los usuarios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Estado</label>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ubicación */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ubicación</label>
            <Select value={selectedLocationId} onValueChange={onLocationChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las ubicaciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las ubicaciones</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha inicio */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Desde</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>

          {/* Fecha fin */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Hasta</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

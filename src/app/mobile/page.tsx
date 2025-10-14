"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertTriangle, Clock, MapPin, Plus, Search, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Alert {
  id: string
  title: string
  description: string
  type: string
  priority: string
  status: string
  location?: string
  reportedAt: string
  site: {
    id: string
    name: string
    clientCompany: {
      name: string
    }
  }
  reportedBy: {
    name: string
  }
  _count: {
    comments: number
  }
}

const priorityColors = {
  LOW: "bg-blue-500",
  MEDIUM: "bg-yellow-500", 
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500"
}

const priorityLabels = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta", 
  CRITICAL: "Crítica"
}

const statusLabels = {
  OPEN: "Abierta",
  ASSIGNED: "Asignada",
  IN_PROGRESS: "En Proceso",
  RESOLVED: "Resuelta",
  CLOSED: "Cerrada"
}

const typeLabels = {
  EQUIPMENT_FAILURE: "Falla de Equipo",
  MAINTENANCE_REQUIRED: "Mantenimiento",
  PREVENTIVE_MAINTENANCE: "Preventivo",
  SAFETY_ISSUE: "Seguridad",
  SUPPLY_SHORTAGE: "Suministros",
  ENVIRONMENTAL_ISSUE: "Ambiental",
  OPERATIONAL_ISSUE: "Operacional",
  OTHER: "Otro"
}

export default function FieldPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (priorityFilter) params.append('priority', priorityFilter)
      
      const response = await fetch(`/api/alerts?${params.toString()}`)
      
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al cargar las alertas')
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
      toast.error('Error al cargar las alertas')
    } finally {
      setLoading(false)
    }
  }

  const filteredAlerts = alerts.filter(alert =>
    alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `hace ${diffInMinutes}m`
    } else if (diffInHours < 24) {
      return `hace ${Math.floor(diffInHours)}h`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `hace ${diffInDays}d`
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="mb-4">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con búsqueda y filtros */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar alertas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => router.push('/mobile/create-alert')}
            size="icon"
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Filtros colapsables */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="OPEN">Abierta</SelectItem>
                <SelectItem value="ASSIGNED">Asignada</SelectItem>
                <SelectItem value="IN_PROGRESS">En Proceso</SelectItem>
                <SelectItem value="RESOLVED">Resuelta</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="CRITICAL">Crítica</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="MEDIUM">Media</SelectItem>
                <SelectItem value="LOW">Baja</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setStatusFilter("")
                setPriorityFilter("")
                fetchAlerts()
              }}
              className="col-span-2"
            >
              Limpiar Filtros
            </Button>
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter(a => a.priority === 'CRITICAL').length}
            </div>
            <div className="text-xs text-muted-foreground">Críticas</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {alerts.filter(a => a.status === 'OPEN').length}
            </div>
            <div className="text-xs text-muted-foreground">Abiertas</div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {alerts.filter(a => a.status === 'RESOLVED').length}
            </div>
            <div className="text-xs text-muted-foreground">Resueltas</div>
          </div>
        </Card>
      </div>

      {/* Lista de alertas */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold mb-2">No hay alertas</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {searchTerm || statusFilter || priorityFilter 
                ? "No se encontraron alertas con los filtros aplicados" 
                : "No hay alertas reportadas en este momento"
              }
            </p>
            <Button onClick={() => router.push('/mobile/create-alert')}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Alerta
            </Button>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card 
              key={alert.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/mobile/alerts/${alert.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Indicador de prioridad */}
                  <div className={`w-1 h-full rounded-full ${priorityColors[alert.priority as keyof typeof priorityColors]} min-h-16`}></div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Header con título y badges */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm leading-tight truncate">
                        {alert.title}
                      </h3>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Badge 
                          variant="secondary" 
                          className="text-xs px-2 py-0.5 h-auto"
                        >
                          {priorityLabels[alert.priority as keyof typeof priorityLabels]}
                        </Badge>
                      </div>
                    </div>

                    {/* Descripción */}
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {alert.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        {alert.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-20">{alert.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(alert.reportedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {alert._count.comments > 0 && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                            {alert._count.comments} comentarios
                          </span>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {statusLabels[alert.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
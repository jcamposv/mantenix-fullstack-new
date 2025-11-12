"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { 
  CheckCircle, 
  Clock, 
  Play, 
  AlertTriangle 
} from "lucide-react"

interface ActivityItem {
  id: string
  type: "completed" | "started" | "assigned" | "overdue"
  workOrderNumber: string
  workOrderTitle: string
  userName: string
  userAvatar?: string
  timestamp: Date
}

interface RecentActivityProps {
  activities: ActivityItem[]
  loading?: boolean
}

const getActivityIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "completed": return CheckCircle
    case "started": return Play
    case "assigned": return Clock
    case "overdue": return AlertTriangle
  }
}

const getActivityColor = (type: ActivityItem["type"]) => {
  switch (type) {
    case "completed": return "text-green-600"
    case "started": return "text-blue-600"
    case "assigned": return "text-yellow-600"
    case "overdue": return "text-red-600"
  }
}

const getActivityText = (activity: ActivityItem) => {
  switch (activity.type) {
    case "completed": return "completó"
    case "started": return "inició"
    case "assigned": return "fue asignado a"
    case "overdue": return "se venció"
  }
}

export function RecentActivity({ activities, loading = false }: RecentActivityProps) {
  if (loading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay actividad reciente
            </p>
          ) : (
            activities.slice(0, 5).map((activity) => {
              const Icon = getActivityIcon(activity.type)
              return (
                <div key={activity.id} className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.userAvatar} />
                    <AvatarFallback>
                      {activity.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${getActivityColor(activity.type)}`} />
                      <div className="text-sm">
                        <span className="font-medium">{activity.userName}</span>
                        {" "}
                        <span className="text-muted-foreground">
                          {getActivityText(activity)}
                        </span>
                        {" "}
                        <Badge variant="outline" className="text-xs">
                          {activity.workOrderNumber}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {activity.workOrderTitle}
                    </p>
                    
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
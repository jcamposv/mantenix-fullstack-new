"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { NotificationItem } from "@/types/notification-ui.types"

interface NotificationBellProps {
  notifications: NotificationItem[]
  unreadCount: number
  isConnected: boolean
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onClear: () => void
}

const priorityColors = {
  CRITICAL: "text-red-600 dark:text-red-400",
  HIGH: "text-orange-600 dark:text-orange-400",
  MEDIUM: "text-yellow-600 dark:text-yellow-400",
  LOW: "text-green-600 dark:text-green-400"
}

const priorityEmojis = {
  CRITICAL: "🔴",
  HIGH: "🟠",
  MEDIUM: "🟡",
  LOW: "🟢"
}

/**
 * Notification Bell Component
 *
 * Displays a bell icon with badge count and dropdown list of notifications
 */
export function NotificationBell({
  notifications,
  unreadCount,
  isConnected,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear
}: NotificationBellProps) {
  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
    // Navigate to alert
    window.location.href = `/alerts/${notification.alertId}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          {!isConnected && (
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-gray-400" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="h-auto p-1 text-xs"
            >
              Marcar todas como leídas
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No hay notificaciones
          </div>
        ) : (
          <>
            <ScrollArea className="h-[400px]">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex flex-col items-start p-3 cursor-pointer",
                    !notification.read && "bg-accent/50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-2 w-full">
                    <span className="text-lg leading-none">
                      {priorityEmojis[notification.priority]}
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className={cn(
                        "text-sm font-medium leading-none",
                        !notification.read && "font-semibold"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp, {
                          addSuffix: true,
                          locale: es
                        })}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="justify-center text-sm text-muted-foreground cursor-pointer"
              onClick={onClear}
            >
              Limpiar todas
            </DropdownMenuItem>
          </>
        )}

        {!isConnected && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
              ⚠️ Desconectado. Intentando reconectar...
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

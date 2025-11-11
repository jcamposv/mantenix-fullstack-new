"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Check, ChevronsUpDown, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface UserAssignmentSelectProps {
  value: string[]
  onChange: (userIds: string[]) => void
  disabled?: boolean
  placeholder?: string
}

/**
 * Reusable User Assignment Component
 * Multi-select component for assigning internal users (excludes clients)
 * Used in work order forms, schedules, and quick previews
 */
export function UserAssignmentSelect({
  value = [],
  onChange,
  disabled = false,
  placeholder = "Seleccionar usuarios..."
}: UserAssignmentSelectProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [userSelectOpen, setUserSelectOpen] = useState(false)

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true)
        const response = await fetch("/api/admin/users?page=1&limit=100")

        if (response.ok) {
          const data = await response.json()
          setUsers(data.users || [])
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

    fetchUsers()
  }, [])

  // Filter out external users (clients) - only show internal users
  const internalUsers = users.filter(user => !user.role.startsWith("CLIENTE"))

  const toggleUserAssignment = (userId: string) => {
    const isAssigned = value.includes(userId)

    if (isAssigned) {
      onChange(value.filter(id => id !== userId))
    } else {
      onChange([...value, userId])
    }
  }

  return (
    <div className="space-y-2">
      <Popover open={userSelectOpen} onOpenChange={setUserSelectOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={userSelectOpen}
            className="w-full justify-between"
            disabled={loadingUsers || disabled}
          >
            {loadingUsers ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando usuarios...
              </>
            ) : value.length === 0 ? (
              placeholder
            ) : (
              `${value.length} usuario(s) seleccionado(s)`
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar usuarios..." />
            <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {internalUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  value={`${user.name} ${user.email}`}
                  onSelect={() => toggleUserAssignment(user.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(user.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {user.role.replace(/_/g, ' ')}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected users display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((userId) => {
            const user = internalUsers.find(u => u.id === userId)
            if (!user) return null
            return (
              <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                {user.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => toggleUserAssignment(userId)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}

      {!loadingUsers && internalUsers.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No hay usuarios internos disponibles para asignar
        </p>
      )}
    </div>
  )
}

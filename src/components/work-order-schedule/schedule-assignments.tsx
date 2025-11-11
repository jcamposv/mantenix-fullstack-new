"use client"

import { useState, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { WorkOrderScheduleFormData } from "@/schemas/work-order-schedule"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

interface ScheduleAssignmentsProps {
  form: UseFormReturn<WorkOrderScheduleFormData>
  assets: Array<{ id: string; name: string; code?: string }>
  sites: Array<{ id: string; name: string }>
}

export function ScheduleAssignments({ form, assets, sites }: ScheduleAssignmentsProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [userSelectOpen, setUserSelectOpen] = useState(false)

  const watchedAssignedUsers = form.watch("assignedUserIds") || []

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
    const currentAssigned = form.getValues("assignedUserIds") || []
    const isAssigned = currentAssigned.includes(userId)

    if (isAssigned) {
      form.setValue("assignedUserIds", currentAssigned.filter(id => id !== userId))
    } else {
      form.setValue("assignedUserIds", [...currentAssigned, userId])
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-4">Asignación (Opcional)</h3>
        <p className="text-xs text-muted-foreground">
          Si asigna usuarios, las órdenes generadas se crearán con estado ASSIGNED
        </p>
      </div>

      {/* User Assignment */}
      <FormField
        control={form.control}
        name="assignedUserIds"
        render={() => (
          <FormItem>
            <FormLabel>Usuarios Asignados (Opcional)</FormLabel>
            <div className="space-y-2">
              <Popover open={userSelectOpen} onOpenChange={setUserSelectOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={userSelectOpen}
                      className="w-full justify-between"
                      disabled={loadingUsers}
                    >
                      {loadingUsers ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cargando usuarios...
                        </>
                      ) : watchedAssignedUsers.length === 0 ? (
                        "Seleccionar usuarios..."
                      ) : (
                        `${watchedAssignedUsers.length} usuario(s) seleccionado(s)`
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
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
                              watchedAssignedUsers.includes(user.id) ? "opacity-100" : "opacity-0"
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
              {watchedAssignedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {watchedAssignedUsers.map((userId) => {
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
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>

            {!loadingUsers && internalUsers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay usuarios internos disponibles para asignar
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="assetId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Activo (Opcional)</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(value || undefined)}
              value={field.value || ""}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sin activo específico" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name} {asset.code && `(${asset.code})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="siteId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sede (Opcional)</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(value || undefined)}
              value={field.value || ""}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sin sede específica" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

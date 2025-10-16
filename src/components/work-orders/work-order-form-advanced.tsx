"use client"

import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { X, Plus, Users, FileText, Shield, Wrench, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CreateWorkOrderData } from "@/types/work-order.types"

interface WorkOrderFormAdvancedProps {
  form: UseFormReturn<CreateWorkOrderData>
  users?: Array<{ id: string; name: string; email: string; role: string }>
}

export function WorkOrderFormAdvanced({ form, users = [] }: WorkOrderFormAdvancedProps) {
  const [newTool, setNewTool] = useState("")
  const [newMaterial, setNewMaterial] = useState("")
  const [userSelectOpen, setUserSelectOpen] = useState(false)

  const watchedTools = form.watch("tools") || []
  const watchedMaterials = form.watch("materials") || []
  const watchedAssignedUsers = form.watch("assignedUserIds") || []

  // Filter out external users (clients)
  const internalUsers = users.filter(user => !user.role.startsWith("CLIENTE"))

  const addTool = () => {
    if (newTool.trim()) {
      const currentTools = form.getValues("tools") || []
      form.setValue("tools", [...currentTools, newTool.trim()])
      setNewTool("")
    }
  }

  const removeTool = (index: number) => {
    const currentTools = form.getValues("tools") || []
    form.setValue("tools", currentTools.filter((_, i) => i !== index))
  }

  const addMaterial = () => {
    if (newMaterial.trim()) {
      const currentMaterials = form.getValues("materials") || []
      form.setValue("materials", [...currentMaterials, newMaterial.trim()])
      setNewMaterial("")
    }
  }

  const removeMaterial = (index: number) => {
    const currentMaterials = form.getValues("materials") || []
    form.setValue("materials", currentMaterials.filter((_, i) => i !== index))
  }

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
    <div className="space-y-6">
      {/* User Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Asignación de Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="assignedUserIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuarios Asignados</FormLabel>
                <div className="space-y-2">
                  <Popover open={userSelectOpen} onOpenChange={setUserSelectOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={userSelectOpen}
                          className="w-full justify-between"
                        >
                          {watchedAssignedUsers.length === 0
                            ? "Seleccionar usuarios..."
                            : `${watchedAssignedUsers.length} usuario(s) seleccionado(s)`
                          }
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
                                {user.role.replace('_', ' ')}
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
                
                {internalUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No hay usuarios internos disponibles para asignar
                  </p>
                )}
                {internalUsers.length > 0 && watchedAssignedUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Debe asignar al menos un usuario
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Instructions and Safety */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Instrucciones y Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instrucciones de Trabajo</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Instrucciones detalladas para realizar el trabajo..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="safetyNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Notas de Seguridad
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Precauciones de seguridad, EPP requerido, riesgos..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Herramientas Requeridas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Agregar herramienta..."
              value={newTool}
              onChange={(e) => setNewTool(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
            />
            <Button type="button" onClick={addTool} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {watchedTools.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {watchedTools.map((tool, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tool}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeTool(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Materials */}
      <Card>
        <CardHeader>
          <CardTitle>Materiales y Repuestos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Agregar material o repuesto..."
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
            />
            <Button type="button" onClick={addMaterial} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {watchedMaterials.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {watchedMaterials.map((material, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {material}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeMaterial(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
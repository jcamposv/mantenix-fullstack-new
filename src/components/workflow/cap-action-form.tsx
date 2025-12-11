"use client"

import { useEffect, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCAPActionSchema, type CAPActionFormData, ACTION_TYPES, getActionTypeLabel } from "@/schemas/cap-action.schema"

interface CAPActionFormProps {
  onSubmit: (data: CAPActionFormData) => void
  onCancel: () => void
  loading?: boolean
  initialData?: Partial<CAPActionFormData>
  defaultRcaId?: string
}

export function CAPActionForm({
  onSubmit,
  onCancel,
  loading,
  initialData,
  defaultRcaId
}: CAPActionFormProps) {
  const [rcas, setRcas] = useState<Array<{ id: string; failureMode: string }>>([])
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [loadingData, setLoadingData] = useState(true)

  const form = useForm<CAPActionFormData>({
    resolver: zodResolver(createCAPActionSchema) as Resolver<CAPActionFormData>,
    defaultValues: {
      rcaId: defaultRcaId || initialData?.rcaId || "",
      actionType: initialData?.actionType || "CORRECTIVE",
      description: initialData?.description || "",
      assignedTo: initialData?.assignedTo || "",
      priority: initialData?.priority || "MEDIUM",
      dueDate: initialData?.dueDate,
      notes: initialData?.notes
    }
  })

  useEffect(() => {
    Promise.all([
      !defaultRcaId ? fetchRCAs() : Promise.resolve(),
      fetchUsers()
    ]).finally(() => setLoadingData(false))
  }, [defaultRcaId])

  const fetchRCAs = async () => {
    try {
      const response = await fetch("/api/root-cause-analyses?limit=100")
      if (response.ok) {
        const data = await response.json()
        setRcas(data.items || [])
      }
    } catch (error) {
      console.error("Error fetching RCAs:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users?limit=100")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.items || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {initialData ? "Editar Acción CAPA" : "Crear Acción CAPA (Correctiva/Preventiva)"}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Información de la Acción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!defaultRcaId && (
                <FormField
                  control={form.control}
                  name="rcaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Análisis RCA *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un RCA" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rcas.map((rca) => (
                            <SelectItem key={rca.id} value={rca.id}>
                              {rca.failureMode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="actionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Acción *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACTION_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {getActionTypeLabel(type)}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describa la acción a realizar..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asignado a *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un responsable" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione la prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Baja</SelectItem>
                        <SelectItem value="MEDIUM">Media</SelectItem>
                        <SelectItem value="HIGH">Alta</SelectItem>
                        <SelectItem value="CRITICAL">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Límite</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value instanceof Date ? field.value.toISOString().slice(0, 10) : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Adicionales</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Información adicional..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading || loadingData}>
              {loading ? "Guardando..." : initialData ? "Actualizar Acción" : "Crear Acción"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

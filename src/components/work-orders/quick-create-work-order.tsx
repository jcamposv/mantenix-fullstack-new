"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/calendar-utils"
import { useCompanyFeatures } from "@/hooks/useCompanyFeatures"
import {
  quickCreateWorkOrderSchema,
  type QuickCreateWorkOrderData
} from "@/schemas/work-order"

interface QuickCreateWorkOrderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: Date | null
  onSuccess?: () => void
}

interface Template {
  id: string
  name: string
  category: string
}

interface User {
  id: string
  name: string
  role: string
}

interface Site {
  id: string
  name: string
}

interface Asset {
  id: string
  name: string
  code: string
}

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Baja" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente" },
] as const

export function QuickCreateWorkOrder({
  open,
  onOpenChange,
  selectedDate,
  onSuccess,
}: QuickCreateWorkOrderProps) {
  const { hasExternalClientMgmt } = useCompanyFeatures()
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loadingData, setLoadingData] = useState(false)

  const form = useForm<QuickCreateWorkOrderData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(quickCreateWorkOrderSchema) as any,
    defaultValues: {
      templateId: "",
      title: "",
      description: "",
      priority: "MEDIUM",
      scheduledDate: selectedDate || undefined,
      siteId: "",
      assetId: "",
      assignedUserIds: [],
    },
  })

  // Update scheduled date when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      form.setValue("scheduledDate", selectedDate)
    }
  }, [selectedDate, form])

  // Load templates, users, and sites
  useEffect(() => {
    if (!open) return

    const fetchData = async () => {
      try {
        setLoadingData(true)

        // Build fetch promises
        const fetchPromises = [
          fetch("/api/work-order-templates?page=1&limit=100"),
          fetch("/api/admin/users"),
          fetch("/api/admin/assets"),
        ]

        // Add sites fetch if feature is enabled
        if (hasExternalClientMgmt) {
          fetchPromises.push(fetch("/api/admin/sites"))
        }

        const responses = await Promise.all(fetchPromises)
        const [templatesRes, usersRes, assetsRes, sitesRes] = responses

        if (templatesRes.ok) {
          const data = await templatesRes.json()
          setTemplates(data.templates || [])
        }

        if (usersRes.ok) {
          const data = await usersRes.json()
          setUsers(data.users || [])
        }

        if (assetsRes.ok) {
          const data = await assetsRes.json()
          setAssets(data.assets || [])
        }

        if (sitesRes && sitesRes.ok) {
          const data = await sitesRes.json()
          setSites(data.sites || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error al cargar los datos")
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [open])

  // Auto-populate title when template is selected
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "templateId" && value.templateId) {
        const template = templates.find((t) => t.id === value.templateId)
        if (template && !form.getValues("title")) {
          form.setValue("title", template.name)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form, templates])

  const handleSubmit = async (data: QuickCreateWorkOrderData) => {
    // Validate site if feature is enabled
    if (hasExternalClientMgmt && !data.siteId) {
      toast.error("Debes seleccionar una sede")
      return
    }

    try {
      setLoading(true)

      const payload = {
        templateId: data.templateId,
        title: data.title,
        description: data.description || undefined,
        priority: data.priority,
        scheduledDate: data.scheduledDate?.toISOString().split("T")[0],
        assignedUserIds: data.assignedUserIds || [],
        ...(hasExternalClientMgmt && data.siteId ? { siteId: data.siteId } : {}),
        ...(data.assetId ? { assetId: data.assetId } : {}),
      }

      const response = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al crear orden de trabajo")
      }

      toast.success("Orden de trabajo creada exitosamente")

      // Reset form
      form.reset()

      onOpenChange(false)

      // Call success callback (will refetch calendar)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating work order:", error)
      toast.error(error instanceof Error ? error.message : "Error al crear orden")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Crear Orden de Trabajo
          </DialogTitle>
          <DialogDescription>
            Crea una orden de trabajo para{" "}
            {selectedDate && <span className="font-medium">{formatDate(selectedDate)}</span>}
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Template Selection */}
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex flex-col">
                              <span>{template.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {template.category}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Título de la orden de trabajo"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción breve (opcional)"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Site Selection - Only if hasExternalClientMgmt */}
              {hasExternalClientMgmt && (
                <FormField
                  control={form.control}
                  name="siteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sede *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una sede" />
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
              )}

              {/* Asset Selection - Always available */}
              <FormField
                control={form.control}
                name="assetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activo (Opcional)</FormLabel>
                    <Select
                      value={field.value || "no-asset"}
                      onValueChange={(value) => {
                        const assetId = value === "no-asset" ? "" : value
                        field.onChange(assetId)
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar activo..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="no-asset">Sin activo específico</SelectItem>
                        {assets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            <div className="flex flex-col">
                              <span>{asset.name}</span>
                              <span className="text-xs text-muted-foreground">
                                Código: {asset.code}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Assigned User */}
                <FormField
                  control={form.control}
                  name="assignedUserIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asignar a</FormLabel>
                      <Select
                        value={field.value?.[0] || ""}
                        onValueChange={(value) => field.onChange(value ? [value] : [])}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sin asignar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Crear Orden
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

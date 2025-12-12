"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Resolver } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { companyGroupSchema, type CompanyGroupFormData } from "@/schemas/inventory"
import { LogoUpload } from "@/components/forms/logo-upload"
import { Loader2, Building2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface Company {
  id: string
  name: string
  subdomain: string
}

interface CompanyGroupFormProps {
  initialData?: Partial<CompanyGroupFormData>
  onSubmit: (data: CompanyGroupFormData) => Promise<void>
  isLoading?: boolean
  mode?: "create" | "edit"
}

export function CompanyGroupForm({
  initialData,
  onSubmit,
  isLoading = false,
  mode = "create"
}: CompanyGroupFormProps) {
  const { user } = useCurrentUser()
  const isSuperAdmin = user?.isSuperAdmin ?? false
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)

  const form = useForm<CompanyGroupFormData>({
    resolver: zodResolver(companyGroupSchema) as Resolver<CompanyGroupFormData>,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      logo: initialData?.logo || "",
      shareInventory: initialData?.shareInventory ?? true,
      autoApproveTransfers: initialData?.autoApproveTransfers ?? false,
      companyIds: initialData?.companyIds || [],
    },
  })

  // Load companies for SUPER_ADMIN
  useEffect(() => {
    if (isSuperAdmin) {
      loadCompanies()
    }
  }, [isSuperAdmin])

  const loadCompanies = async () => {
    setLoadingCompanies(true)
    try {
      const response = await fetch('/api/admin/companies?limit=1000')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.items || [])
      }
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoadingCompanies(false)
    }
  }

  const handleSubmit = async (data: CompanyGroupFormData) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card className="w-full shadow-none">
          <CardHeader>
            <CardTitle>Información del Grupo</CardTitle>
            <CardDescription>
              Datos básicos del grupo corporativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Grupo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Grupo Empresarial ABC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del grupo corporativo"
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
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <LogoUpload
                      value={field.value}
                      onChange={field.onChange}
                      onRemove={() => field.onChange("")}
                      label="Logo del Grupo Corporativo (Opcional)"
                      folder="company-groups/logos"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Multi-select de empresas - Solo para SUPER_ADMIN */}
        {isSuperAdmin && (
          <Card className="w-full shadow-none">
            <CardHeader>
              <CardTitle>Empresas del Grupo</CardTitle>
              <CardDescription>
                Selecciona las empresas que formarán parte de este grupo corporativo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="companyIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresas *</FormLabel>
                    <FormDescription>
                      Selecciona una o más empresas para asociar al grupo
                    </FormDescription>
                    {loadingCompanies ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto border rounded-md p-4">
                        {companies.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No hay empresas disponibles
                          </p>
                        ) : (
                          companies.map((company) => (
                            <div key={company.id} className="flex items-center space-x-3 p-2 hover:bg-accent rounded-md">
                              <Checkbox
                                checked={field.value?.includes(company.id)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || []
                                  if (checked) {
                                    field.onChange([...currentValues, company.id])
                                  } else {
                                    field.onChange(currentValues.filter(id => id !== company.id))
                                  }
                                }}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{company.name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{company.subdomain}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    {field.value && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {field.value.map(companyId => {
                          const company = companies.find(c => c.id === companyId)
                          return company ? (
                            <Badge key={companyId} variant="secondary">
                              {company.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        <Card className="w-full shadow-none">
          <CardHeader>
            <CardTitle>Configuración de Inventario</CardTitle>
            <CardDescription>
              Opciones para el manejo de inventario entre empresas del grupo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="shareInventory"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Compartir Inventario
                    </FormLabel>
                    <FormDescription>
                      Las empresas del grupo pueden ver y usar el inventario compartido
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoApproveTransfers"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Auto-Aprobar Transferencias
                    </FormLabel>
                    <FormDescription>
                      Las transferencias de inventario entre empresas del grupo se aprueban automáticamente
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Crear Grupo" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

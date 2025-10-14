"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { createAdminUserSchema, type AdminUserFormData, EXTERNAL_ROLES } from "@/schemas/admin-user"
import { AdminUserBasicInfo } from "./admin-user/admin-user-basic-info"
import { AdminUserExternal } from "./admin-user/admin-user-external"
import { AdminUserRoleSettings } from "./admin-user/admin-user-role-settings"

interface ClientCompany {
  id: string
  name: string
  companyId: string
  email: string
  contactName: string
}

interface Site {
  id: string
  name: string
  address: string | null
  contactName: string | null
  _count: {
    siteUsers: number
  }
}

interface AdminCompanyUserFormProps {
  onSubmit: (data: AdminUserFormData) => void
  onCancel: () => void
  loading?: boolean
  mode?: "create" | "invite"
}

export function AdminCompanyUserForm({ onSubmit, onCancel, loading, mode = "create" }: AdminCompanyUserFormProps) {
  const [clientCompanies, setClientCompanies] = useState<ClientCompany[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [loadingClientCompanies, setLoadingClientCompanies] = useState(false)
  const [loadingSites, setLoadingSites] = useState(false)
  const { user: currentUser } = useCurrentUser()

  const form = useForm<AdminUserFormData>({
    resolver: zodResolver(createAdminUserSchema(mode)),
    defaultValues: {
      name: "",
      email: "",
      password: mode === "invite" ? undefined : "",
      role: "TECNICO",
      companyId: currentUser?.company?.id,
      isExternalUser: false,
      clientCompanyId: undefined,
      siteId: undefined,
      timezone: "UTC",
      locale: "es",
    },
  })

  const isExternalUser = form.watch("isExternalUser")
  const selectedClientCompanyId = form.watch("clientCompanyId")
  const selectedRole = form.watch("role")

  useEffect(() => {
    if (currentUser?.company?.id) {
      form.setValue("companyId", currentUser.company.id)
    }
  }, [currentUser, form])

  useEffect(() => {
    if (isExternalUser) {
      // Reset role to first external role when switching to external user
      form.setValue("role", "CLIENTE_ADMIN_GENERAL")
      fetchClientCompanies()
    } else {
      // Reset role to first internal role when switching to internal user
      form.setValue("role", "TECNICO")
      form.setValue("clientCompanyId", undefined)
      form.setValue("siteId", undefined)
      setSites([])
    }
  }, [isExternalUser, form])

  useEffect(() => {
    if (selectedClientCompanyId && isExternalUser) {
      fetchSites(selectedClientCompanyId)
    } else {
      form.setValue("siteId", undefined)
      setSites([])
    }
  }, [selectedClientCompanyId, isExternalUser, form])

  // Clear site selection if role doesn't require site
  useEffect(() => {
    const roleRequiresSite = EXTERNAL_ROLES.find((role) => role.value === selectedRole)?.requiresSite || false
    
    if (isExternalUser && !roleRequiresSite) {
      form.setValue("siteId", undefined)
    }
  }, [selectedRole, isExternalUser, form])

  const fetchClientCompanies = async () => {
    setLoadingClientCompanies(true)
    try {
      const response = await fetch('/api/admin/client-companies')
      if (response.ok) {
        const data = await response.json()
        setClientCompanies(data.clientCompanies || data.companies || data.items || data || [])
      }
    } catch (error) {
      console.error('Error fetching client companies:', error)
    } finally {
      setLoadingClientCompanies(false)
    }
  }

  const fetchSites = async (clientCompanyId: string) => {
    setLoadingSites(true)
    try {
      const response = await fetch(`/api/admin/client-companies/${clientCompanyId}/sites`)
      if (response.ok) {
        const data = await response.json()
        setSites(data.sites || data.items || data || [])
      }
    } catch (error) {
      console.error('Error fetching sites:', error)
    } finally {
      setLoadingSites(false)
    }
  }

  const handleSubmit = (data: AdminUserFormData) => {
    // Always set the company to the current user's company for admin company users
    data.companyId = currentUser?.company?.id
    
    // If not external user, remove client company id and site id
    if (!data.isExternalUser) {
      data.clientCompanyId = undefined
      data.siteId = undefined
    }
    
    onSubmit(data)
  }

  return (
    <Card className="w-full shadow-none border-none mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "invite" ? "Invitar Nuevo Usuario" : "Crear Nuevo Usuario"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <AdminUserBasicInfo 
              control={form.control} 
              mode={mode}
              currentUserCompanyName={currentUser?.company?.name}
            />
            
            <AdminUserExternal 
              control={form.control}
              isExternalUser={isExternalUser}
              selectedClientCompanyId={selectedClientCompanyId}
              selectedRole={selectedRole}
              clientCompanies={clientCompanies}
              sites={sites}
              loadingClientCompanies={loadingClientCompanies}
              loadingSites={loadingSites}
            />
            
            <AdminUserRoleSettings 
              control={form.control}
              isExternalUser={isExternalUser}
              selectedRole={selectedRole}
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading 
                  ? (mode === "invite" ? "Enviando Invitación..." : "Creando...")
                  : (mode === "invite" ? "Enviar Invitación" : "Crear Usuario")
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserBasicFields } from "./user/user-basic-fields"
import { UserRoleField } from "./user/user-role-field"
import { UserCompanyField } from "./user/user-company-field"
import { UserPreferencesFields } from "./user/user-preferences-fields"
import { UserFormActions } from "./user/user-form-actions"
import { useCompanies } from "@/components/hooks/use-companies"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { createUserSchema, type UserFormData } from "./user/user-form-schema"
import { needsCompanyAssignment } from "./user/user-form-utils"

interface UserFormProps {
  onSubmit: (data: UserFormData) => void
  onCancel: () => void
  loading?: boolean
  mode?: "create" | "invite" | "edit"
  initialData?: Partial<UserFormData>
  title?: string
}

export function UserForm({ 
  onSubmit, 
  onCancel, 
  loading, 
  mode = "create",
  initialData,
  title
}: UserFormProps) {
  const { user: currentUser } = useCurrentUser()
  const { companies, loading: loadingCompanies } = useCompanies()

  const form = useForm<UserFormData>({
    resolver: zodResolver(createUserSchema(mode)),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: mode === "invite" || mode === "edit" ? undefined : "",
      role: initialData?.role || "TECNICO",
      companyId: initialData?.companyId || currentUser?.companyId || undefined,
      timezone: initialData?.timezone || "UTC",
      locale: initialData?.locale || "en",
    },
  })

  const selectedRole = form.watch("role")
  const needsCompany = needsCompanyAssignment(selectedRole)

  const handleSubmit = (data: UserFormData) => {
    // Apply business rules based on current user role
    if (currentUser?.role !== "SUPER_ADMIN") {
      // Non-super-admin users should use their own company
      data.companyId = currentUser?.companyId
      
      // Restrict role selection for non-super-admin users
      const allowedRoles = ["TECNICO", "SUPERVISOR", "CLIENTE_ADMIN_GENERAL", "CLIENTE_ADMIN_SEDE", "CLIENTE_OPERARIO"]
      if (!allowedRoles.includes(data.role)) {
        data.role = "TECNICO"
      }
    }

    if (!needsCompany) {
      data.companyId = undefined
    }

    onSubmit(data)
  }

  // Filter companies and roles based on current user permissions
  const filteredCompanies = currentUser?.role === "SUPER_ADMIN" 
    ? companies 
    : companies.filter(c => c.id === currentUser?.companyId)

  const getFormTitle = () => {
    if (title) return title
    
    const modeLabels = {
      create: "Crear Usuario",
      invite: "Invitar Usuario", 
      edit: "Editar Usuario"
    }
    
    return modeLabels[mode]
  }

  return (
    <Card className="w-full shadow-none border-none mx-auto">
      <CardHeader>
        <CardTitle>{getFormTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <UserBasicFields control={form.control} mode={mode} />
            
            {mode === "invite" && (
              <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Proceso de Invitación</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Se enviará una invitación por correo electrónico. El usuario recibirá un enlace seguro para configurar su cuenta y contraseña.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <UserRoleField 
              control={form.control} 
              selectedRole={selectedRole}
              restrictedMode={currentUser?.role !== "SUPER_ADMIN"}
            />
            
            <UserCompanyField 
              control={form.control}
              companies={filteredCompanies}
              loadingCompanies={loadingCompanies}
              needsCompany={needsCompany}
              readOnly={currentUser?.role !== "SUPER_ADMIN"}
            />
            
            <UserPreferencesFields control={form.control} />
            
            <UserFormActions onCancel={onCancel} loading={loading} mode={mode} />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
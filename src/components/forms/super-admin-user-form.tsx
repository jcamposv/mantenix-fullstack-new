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
import { createUserSchema, type UserFormData } from "./user/user-form-schema"
import { needsCompanyAssignment } from "./user/user-form-utils"

interface SuperAdminUserFormProps {
  onSubmit: (data: UserFormData) => void
  onCancel: () => void
  loading?: boolean
  mode?: "create" | "invite"
}

export function SuperAdminUserForm({ onSubmit, onCancel, loading, mode = "create" }: SuperAdminUserFormProps) {
  const { companies, loading: loadingCompanies } = useCompanies()

  const form = useForm<UserFormData>({
    resolver: zodResolver(createUserSchema(mode)),
    defaultValues: {
      name: "",
      email: "",
      password: mode === "invite" ? undefined : "",
      role: "TECNICO",
      companyId: undefined,
      timezone: "UTC",
      locale: "en",
      image: null,
    },
  })

  const selectedRole = form.watch("role")
  const needsCompany = needsCompanyAssignment(selectedRole)

  const handleSubmit = (data: UserFormData) => {
    if (!needsCompany) {
      data.companyId = undefined
    }
    onSubmit(data)
  }

  return (
    <Card className="w-full shadow-none border-none mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "invite" ? "Invite New User (Super Admin)" : "Create New User (Super Admin)"}
        </CardTitle>
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
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Invitation Process</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      An email invitation will be sent to this user. They will receive a secure link to set up their account and password.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <UserRoleField control={form.control} selectedRole={selectedRole} />
            
            <UserCompanyField 
              control={form.control}
              companies={companies}
              loadingCompanies={loadingCompanies}
              needsCompany={needsCompany}
            />
            
            <UserPreferencesFields control={form.control} />
            
            <UserFormActions onCancel={onCancel} loading={loading} mode={mode} />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
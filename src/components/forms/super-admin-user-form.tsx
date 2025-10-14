"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const createUserSchema = (mode: "create" | "invite") => z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: mode === "invite" 
    ? z.string().optional()
    : z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SUPER_ADMIN", "ADMIN_EMPRESA", "SUPERVISOR", "TECNICO", "CLIENTE_ADMIN", "CLIENTE_OPERATIVO"]),
  companyId: z.string().optional(),
  timezone: z.string(),
  locale: z.string(),
})

type UserFormData = z.infer<ReturnType<typeof createUserSchema>>

interface Company {
  id: string
  name: string
  subdomain: string
}

interface SuperAdminUserFormProps {
  onSubmit: (data: UserFormData) => void
  onCancel: () => void
  loading?: boolean
  mode?: "create" | "invite"
}

const ROLES = [
  { value: "SUPER_ADMIN", label: "Super Admin", description: "Full system access" },
  { value: "ADMIN_EMPRESA", label: "Company Admin", description: "Manage company and users" },
  { value: "SUPERVISOR", label: "Supervisor", description: "Oversee operations" },
  { value: "TECNICO", label: "Technician", description: "Field work and maintenance" },
  { value: "CLIENTE_ADMIN", label: "Client Admin", description: "Manage client company" },
  { value: "CLIENTE_OPERATIVO", label: "Client Operative", description: "Basic client operations" },
]

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "America/Mexico_City", label: "Mexico City" },
]

export function SuperAdminUserForm({ onSubmit, onCancel, loading, mode = "create" }: SuperAdminUserFormProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(true)

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
    },
  })

  const selectedRole = form.watch("role")
  const needsCompany = !["SUPER_ADMIN"].includes(selectedRole)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/admin/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoadingCompanies(false)
    }
  }

  const handleSubmit = (data: UserFormData) => {
    if (!needsCompany) {
      data.companyId = undefined
    }
    onSubmit(data)
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "destructive"
      case "ADMIN_EMPRESA":
        return "default"
      case "SUPERVISOR":
        return "secondary"
      default:
        return "outline"
    }
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
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField<UserFormData>
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<UserFormData>
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Password - only show when creating users directly */}
            {mode === "create" && (
              <FormField<UserFormData>
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Minimum 8 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Invitation Info */}
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

            {/* Role Selection */}
            <FormField<UserFormData>
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getRoleBadgeVariant(role.value)} className="text-xs">
                              {role.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {role.description}
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

            {/* Company Selection (conditional) */}
            {needsCompany && (
              <FormField<UserFormData>
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingCompanies ? (
                          <SelectItem value="loading" disabled>
                            Loading companies...
                          </SelectItem>
                        ) : companies.length === 0 ? (
                          <SelectItem value="no-companies" disabled>
                            No companies available
                          </SelectItem>
                        ) : (
                          companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              <div>
                                <div className="font-medium">{company.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {company.subdomain}.mantenix.ai
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The company this user will belong to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Additional Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField<UserFormData>
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField<UserFormData>
                control={form.control}
                name="locale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading 
                  ? (mode === "invite" ? "Sending Invitation..." : "Creating...")
                  : (mode === "invite" ? "Send Invitation" : "Create User")
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
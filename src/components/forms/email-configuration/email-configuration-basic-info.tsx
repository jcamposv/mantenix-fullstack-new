"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import {
  FormControl,
  FormDescription,
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
import { Control } from "react-hook-form"
import { EmailConfigurationFormData } from "@/schemas/email-configuration"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmailConfigurationBasicInfoProps {
  control: Control<EmailConfigurationFormData>
  mode: "create" | "edit"
}

interface Company {
  id: string
  name: string
  subdomain: string
}

export function EmailConfigurationBasicInfo({ control, mode }: EmailConfigurationBasicInfoProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [showApiToken, setShowApiToken] = useState(false)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/admin/companies')
        if (response.ok) {
          const data = await response.json()
          setCompanies(data.companies || data.items || [])
        }
      } catch (error) {
        console.error('Error fetching companies:', error)
      } finally {
        setLoadingCompanies(false)
      }
    }

    fetchCompanies()
  }, [])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Selection */}
        <FormField
          control={control}
          name="companyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={mode === "edit" || loadingCompanies}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCompanies ? "Cargando..." : "Seleccione una empresa"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name} ({company.subdomain})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {mode === "edit" ? "La empresa no puede ser modificada" : "Empresa para la configuración de email"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* From Name */}
        <FormField
          control={control}
          name="fromName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Remitente</FormLabel>
              <FormControl>
                <Input placeholder="Mantenix Platform" {...field} />
              </FormControl>
              <FormDescription>
                Nombre que aparece como remitente
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* From Email */}
        <FormField
          control={control}
          name="fromEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Remitente</FormLabel>
              <FormControl>
                <Input type="email" placeholder="noreply@mantenix.com" {...field} />
              </FormControl>
              <FormDescription>
                Email desde el cual se envían los correos
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reply To Email */}
        <FormField
          control={control}
          name="replyToEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email de Respuesta (Opcional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="support@mantenix.com" {...field} />
              </FormControl>
              <FormDescription>
                Email donde llegarán las respuestas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* API Token */}
      <FormField
        control={control}
        name="apiToken"
        render={({ field }) => (
          <FormItem>
            <FormLabel>MailerSend API Token</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  type={showApiToken ? "text" : "password"}
                  placeholder="mlsn_xxxxxxxxxxxxxxxxxxxxx"
                  {...field}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiToken(!showApiToken)}
                >
                  {showApiToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </FormControl>
            <FormDescription>
              Token de API de MailerSend para enviar emails
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Domain ID (Optional) */}
      <FormField
        control={control}
        name="domainId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Domain ID (Opcional)</FormLabel>
            <FormControl>
              <Input placeholder="domain_abc123" {...field} />
            </FormControl>
            <FormDescription>
              ID del dominio verificado en MailerSend
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

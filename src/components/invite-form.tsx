"use client"

import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { InviteFormSuccess, InviteFormFields } from "./invite"
import { AuthFormHeader, AuthFormFooter, CompanyBrandingImage } from "./auth"
import type { CompanyBranding } from "@/types/branding"

const acceptInviteSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>

interface InvitationData {
  email: string
  role: string
  company: {
    id: string
    name: string
    subdomain: string
    logo?: string
    primaryColor?: string
  }
  invitedBy: {
    name: string
    email: string
  }
  expiresAt: string
}

interface InviteFormProps extends Omit<React.ComponentProps<"div">, "onSubmit"> {
  invitation: InvitationData
  companyBranding?: CompanyBranding | null
  onSubmit: (data: AcceptInviteFormData) => Promise<void>
  isSubmitting: boolean
  error?: string | null
  success?: boolean
}

export function InviteForm({
  className,
  invitation,
  companyBranding,
  onSubmit,
  isSubmitting,
  error,
  success,
  ...props
}: InviteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteFormData>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
    },
  })

  const displayCompanyName = companyBranding?.name || invitation?.company?.name || "Mantenix"
  const displayLogo = companyBranding?.logo || invitation?.company?.logo || "/images/logo-1.jpg"
  const hasCustomBranding = !!(companyBranding?.logo || invitation?.company?.logo)

  if (success) {
    return (
      <InviteFormSuccess
        displayLogo={displayLogo}
        displayCompanyName={displayCompanyName}
        hasCustomBranding={hasCustomBranding}
        className={className}
        {...props}
      />
    )
  }

  return (
    <div className={cn("grid min-h-svh lg:grid-cols-2", className)} {...props}>
      <div className="flex flex-col gap-4 p-0 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full md:max-w-md">
            <AuthFormHeader 
              displayLogo={displayLogo}
              displayCompanyName={displayCompanyName}
              hasCustomBranding={hasCustomBranding}
            />

            <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
              <InviteFormFields
                register={register}
                errors={errors}
                isSubmitting={isSubmitting}
                error={error}
                displayCompanyName={displayCompanyName}
                companyBranding={companyBranding}
              />
            </form>
          </div>
        </div>
        
        <AuthFormFooter showTerms />
      </div>

      <CompanyBrandingImage displayCompanyName={displayCompanyName} />
    </div>
  )
}
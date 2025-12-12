"use client"

import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema, type ResetPasswordSchema } from "@/schemas/password-reset"
import { ResetPasswordFormSuccess, ResetPasswordFormFields } from "./reset-password"
import { AuthFormHeader, AuthFormFooter, CompanyBrandingImage } from "./auth"
import type { CompanyBranding } from "@/types/branding"

interface UserData {
  name?: string
  email?: string
}

interface ResetPasswordFormProps extends Omit<React.ComponentProps<"div">, "onSubmit"> {
  user?: UserData
  companyBranding?: CompanyBranding | null
  onSubmit: (data: ResetPasswordSchema) => Promise<void>
  isSubmitting: boolean
  error?: string | null
  success?: boolean
}

export function ResetPasswordForm({
  className,
  user,
  companyBranding,
  onSubmit,
  isSubmitting,
  error,
  success,
  ...props
}: ResetPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  const displayCompanyName = companyBranding?.name || "Mantenix"
  const displayLogo = companyBranding?.logo || "/images/mantenix-logo-black.svg"
  const hasCustomBranding = !!companyBranding?.logo

  if (success) {
    return (
      <ResetPasswordFormSuccess
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
              <ResetPasswordFormFields
                register={register}
                errors={errors}
                isSubmitting={isSubmitting}
                error={error}
                userEmail={user?.email}
                companyBranding={companyBranding}
              />
            </form>
          </div>
        </div>

        <AuthFormFooter showTerms={false} />
      </div>

      <CompanyBrandingImage displayCompanyName={displayCompanyName} />
    </div>
  )
}

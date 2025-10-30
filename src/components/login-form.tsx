"use client"

import { cn } from "@/lib/utils"
import { FieldDescription, FieldGroup } from "@/components/ui/field"
import { FormProvider } from "react-hook-form"
import { useAuth, useBranding } from "@/lib/auth-client"
import {
  AuthFormHeader,
  AuthFormFooter,
  CompanyBrandingImage,
} from "@/components/auth"
import { EmailField } from "@/components/forms/email-field"
import { PasswordField } from "@/components/forms/password-field"
import { ErrorAlert } from "@/components/forms/error-alert"
import { RememberMeField } from "@/components/forms/remember-me-field"
import { LoginFormHeader } from "@/components/login/login-form-header"
import { LoginSubmitButton } from "@/components/login/login-submit-button"
import { useLoginForm } from "@/components/hooks/use-login-form"
import { useBrandingEffects } from "@/components/hooks/use-branding-effects"
import type { CompanyBranding } from "@/types/branding"

interface LoginFormProps extends React.ComponentProps<"div"> {
  companyName?: string
  companyLogo?: string
  companyBranding?: CompanyBranding | null
}

export function LoginForm({
  className,
  companyName,
  companyLogo,
  companyBranding,
  ...props
}: LoginFormProps) {
  const { company } = useAuth()
  const { branding } = useBranding()
  const { form, onSubmit, isSubmitting, error } = useLoginForm()
  
  useBrandingEffects(companyBranding)

  const displayCompanyName = companyName || companyBranding?.name || company?.name || "Mantenix"
  const displayLogo = companyLogo || companyBranding?.logo || branding?.logo || "/images/logo-1.jpg"
  const hasCustomBranding = !!(companyBranding?.logo || companyLogo || branding?.logo)

  return (
    <div className={cn("grid min-h-svh lg:grid-cols-2", className)} {...props}>
      <div className="flex flex-col gap-4 p-0 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full md:max-w-md p-4">
            <AuthFormHeader 
              displayLogo={displayLogo}
              displayCompanyName={displayCompanyName}
              hasCustomBranding={hasCustomBranding}
            />

            <FormProvider {...form}>
              <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <LoginFormHeader displayCompanyName={displayCompanyName} />
                  <ErrorAlert message={error} />
                  <EmailField />
                  <PasswordField />
                  <RememberMeField />
                  <LoginSubmitButton 
                    isSubmitting={isSubmitting} 
                    companyBranding={companyBranding} 
                  />
                  <FieldDescription className="text-center">
                    ¿No tienes una cuenta? <a href="/signup" className="underline underline-offset-4">Regístrate</a>
                  </FieldDescription>
                </FieldGroup>
              </form>
            </FormProvider>
          </div>
        </div>
        
        <AuthFormFooter />
      </div>

      <CompanyBrandingImage displayCompanyName={displayCompanyName} />
    </div>
  )
}
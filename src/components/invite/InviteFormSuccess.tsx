/**
 * Success screen component for invite forms
 * Displays success message after account creation
 */

import { CheckCircle, Loader2 } from "lucide-react"
import { AuthFormHeader, AuthFormFooter, CompanyBrandingImage } from "@/components/auth"
import { cn } from "@/lib/utils"

interface InviteFormSuccessProps {
  displayLogo: string
  displayCompanyName: string
  hasCustomBranding?: boolean
  className?: string
}

export function InviteFormSuccess({ 
  displayLogo, 
  displayCompanyName,
  hasCustomBranding = false,
  className 
}: InviteFormSuccessProps) {
  return (
    <div className={cn("grid min-h-svh lg:grid-cols-2", className)}>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <AuthFormHeader 
          displayLogo={displayLogo}
          displayCompanyName={displayCompanyName}
          hasCustomBranding={hasCustomBranding}
        />
        
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4 mx-auto" />
            <h1 className="text-2xl font-bold text-green-700 mb-2">
              ¡Cuenta Creada!
            </h1>
            <p className="text-muted-foreground mb-4">
              Tu cuenta ha sido creada exitosamente para {displayCompanyName}.
            </p>
            <p className="text-sm text-muted-foreground">
              Serás redirigido a la página de inicio de sesión pronto.
            </p>
            <div className="mt-4">
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            </div>
          </div>
        </div>
        
        <AuthFormFooter />
      </div>
      
      <CompanyBrandingImage displayCompanyName={displayCompanyName} />
    </div>
  )
}


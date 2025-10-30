/**
 * Success state component for password reset
 */

import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { CompanyBrandingImage } from "@/components/auth"
import Image from "next/image"
import { useState } from "react"

interface ResetPasswordFormSuccessProps extends React.ComponentProps<"div"> {
  displayLogo: string
  displayCompanyName: string
  hasCustomBranding: boolean
}

export function ResetPasswordFormSuccess({
  displayLogo,
  displayCompanyName,
  hasCustomBranding,
  className,
  ...props
}: ResetPasswordFormSuccessProps) {
  const [imageError, setImageError] = useState(false)
  return (
    <div className={cn("grid min-h-svh lg:grid-cols-2", className)} {...props}>
      <div className="flex flex-col gap-4 p-0 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full md:max-w-md">
            <div className="mb-8">
              {!hasCustomBranding || imageError ? (
                <h1 className="text-2xl font-bold">Mantenix</h1>
              ) : (
                <Image
                  src={displayLogo}
                  alt={`${displayCompanyName} logo`}
                  width={136}
                  height={136}
                  className="h-10 w-auto"
                  onError={() => setImageError(true)}
                />
              )}
            </div>

            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Contraseña Actualizada</h1>
                <p className="text-muted-foreground">
                  Tu contraseña ha sido actualizada exitosamente.
                </p>
                <p className="text-sm text-muted-foreground">
                  Serás redirigido al login en unos segundos...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CompanyBrandingImage displayCompanyName={displayCompanyName} />
    </div>
  )
}

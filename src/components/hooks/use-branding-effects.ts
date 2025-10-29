import { useEffect } from "react"
import { useBranding } from "@/lib/auth-client"
import type { CompanyBranding } from "@/types/branding"

export function useBrandingEffects(companyBranding?: CompanyBranding | null) {
  const { applyBranding } = useBranding()

  useEffect(() => {
    applyBranding()

    // Apply CSS custom properties for dynamic theming if branding is available
    if (companyBranding?.primaryColor) {
      document.documentElement.style.setProperty('--company-primary', companyBranding.primaryColor)
    }
    if (companyBranding?.secondaryColor) {
      document.documentElement.style.setProperty('--company-secondary', companyBranding.secondaryColor)
    }
    if (companyBranding?.backgroundColor) {
      document.documentElement.style.setProperty('--company-background', companyBranding.backgroundColor)
    }
  }, [applyBranding, companyBranding])
}
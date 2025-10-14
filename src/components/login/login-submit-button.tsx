import { Button } from "@/components/ui/button"
import type { CompanyBranding } from "@/types/branding"

interface LoginSubmitButtonProps {
  isSubmitting: boolean
  companyBranding?: CompanyBranding | null
}

export function LoginSubmitButton({ isSubmitting, companyBranding }: LoginSubmitButtonProps) {
  return (
    <Button 
      type="submit" 
      disabled={isSubmitting}
      className="w-full"
      style={{
        backgroundColor: companyBranding?.primaryColor || undefined,
        borderColor: companyBranding?.primaryColor || undefined,
      }}
    >
      {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
    </Button>
  )
}
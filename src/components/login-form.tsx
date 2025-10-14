"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginInput } from "@/lib/validations"
import { useAuth, useBranding } from "@/lib/auth-client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import {
  AuthFormHeader,
  AuthFormFooter,
  CompanyBrandingImage,
} from "@/components/auth"
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
  const router = useRouter()
  const { signIn, isLoading } = useAuth()
  const { branding, applyBranding } = useBranding()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Apply branding when component mounts
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFieldError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  })

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await signIn({
        email: data.email,
        password: data.password,
        callbackURL: "/",
      })

      if (result?.error) {
        // Handle authentication errors
        const errorMessage = result.error.message || ""
        if (errorMessage.includes("invalid") || errorMessage.includes("credentials")) {
          setError("Correo electrónico o contraseña inválidos")
        } else if (errorMessage.includes("locked")) {
          setError("La cuenta está bloqueada. Por favor contacta a soporte.")
        } else if (errorMessage.includes("mfa") || errorMessage.includes("verification")) {
          // Redirect to MFA verification
          router.push("/mfa")
          return
        } else {
          setError("Error al iniciar sesión. Por favor intenta de nuevo.")
        }
      } else {
        // Success - handle redirect based on user role and company
        try {
          // Let the middleware handle the subdomain validation and redirect
          // The middleware will automatically redirect users to their correct subdomain
          router.push("/")
        } catch (redirectError) {
          console.error("Redirect error:", redirectError)
          router.push("/")
        }
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Ocurrió un error inesperado. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const { company } = useAuth()
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

            <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold">Bienvenido de nuevo</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Inicia sesión en tu cuenta de {displayCompanyName}
                  </p>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                {/* Email Field */}
                <Field>
                  <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </Field>

                {/* Password Field */}
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                    <a
                      href="/forgot-password"
                      className="ml-auto text-sm underline-offset-2 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      aria-invalid={!!errors.password}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                  )}
                </Field>

                {/* Remember Me */}
                <Field>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register("remember")}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">Recuérdame</span>
                  </label>
                </Field>

                {/* Submit Button */}
                <Field>
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
                </Field>

                {/* Sign Up Link */}
                <FieldDescription className="text-center">
                  ¿No tienes una cuenta? <a href="/signup" className="underline underline-offset-4">Regístrate</a>
                </FieldDescription>
              </FieldGroup>
            </form>
          </div>
        </div>
        
        <AuthFormFooter />
      </div>

      <CompanyBrandingImage displayCompanyName={displayCompanyName} />
    </div>
  )
}
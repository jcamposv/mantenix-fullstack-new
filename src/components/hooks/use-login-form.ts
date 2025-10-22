import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAuth, getSession } from "@/lib/auth-client"
import { loginSchema, type LoginInput } from "@/lib/validations"
import { PermissionHelper } from "@/server/helpers/permission.helper"

export function useLoginForm() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginInput>({
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
      })

      console.log("Login result:", result) // Debug log

      if (result?.error) {
        const errorMessage = result.error.message || ""
        if (errorMessage.includes("invalid") || errorMessage.includes("credentials")) {
          setError("Correo electrónico o contraseña inválidos")
        } else if (errorMessage.includes("locked")) {
          setError("La cuenta está bloqueada. Por favor contacta a soporte.")
        } else if (errorMessage.includes("mfa") || errorMessage.includes("verification")) {
          router.push("/mfa")
          return
        } else {
          setError("Error al iniciar sesión. Por favor intenta de nuevo.")
        }
      } else {
        try {
          // Get fresh session after successful login
          const session = await getSession()
          const userRole = (session?.data?.user as { role?: string })?.role
          console.log("User role from session:", userRole) // Debug log
          console.log("Full session data:", session?.data?.user) // Debug log
          
          // Mobile-only roles should be redirected to /mobile
          const mobileOnlyRoles = [PermissionHelper.ROLES.TECNICO, 
            PermissionHelper.ROLES.CLIENTE_OPERARIO]
          
          // Admin roles that can choose platform
          const adminRoles = [PermissionHelper.ROLES.SUPER_ADMIN, 
            PermissionHelper.ROLES.ADMIN_EMPRESA, 
            PermissionHelper.ROLES.SUPERVISOR,
            PermissionHelper.ROLES.CLIENTE_ADMIN_GENERAL,
            PermissionHelper.ROLES.CLIENTE_ADMIN_SEDE]
          
          if (userRole && mobileOnlyRoles.includes(userRole as typeof mobileOnlyRoles[number])) {
            console.log("Redirecting mobile user to /mobile")
            router.push("/mobile")
          } else if (userRole && adminRoles.includes(userRole as typeof adminRoles[number])) {
            // Admin users get to choose between platforms
            console.log("Redirecting admin user to /platform-selection")
            router.push("/platform-selection")
          } else {
            console.log("Redirecting user to /")
            router.push("/")
          }
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

  return {
    form,
    onSubmit,
    isSubmitting,
    error,
    setError
  }
}
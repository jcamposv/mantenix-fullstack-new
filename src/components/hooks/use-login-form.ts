import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-client"
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
        callbackURL: "/",
      })

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
          // Check user role and redirect accordingly
          const userRole = result?.data?.user?.role
          
          // Mobile-only roles should be redirected to /mobile
            const mobileOnlyRoles = [PermissionHelper.ROLES.TECNICO, 
              PermissionHelper.ROLES.SUPERVISOR, 
              PermissionHelper.ROLES.CLIENTE_OPERARIO]
          
          if (userRole && mobileOnlyRoles.includes(userRole as typeof mobileOnlyRoles[number])) {
            router.push("/mobile")
          } else {
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
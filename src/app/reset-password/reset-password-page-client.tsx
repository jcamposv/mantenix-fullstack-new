"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ResetPasswordForm } from "@/components/reset-password-form"
import { XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { CompanyBranding } from "@/types/branding"
import type { ResetPasswordSchema } from "@/schemas/password-reset"

interface ResetPasswordPageClientProps {
  initialCompanyBranding: CompanyBranding | null
}

export function ResetPasswordPageClient({ initialCompanyBranding }: ResetPasswordPageClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Check if there's an error in the URL (from Better Auth)
    const urlError = searchParams.get('error')
    if (urlError === 'INVALID_TOKEN') {
      setError("El link de reseteo de contraseña es inválido o ha expirado")
    }
  }, [searchParams])

  const handleSubmit = async (data: ResetPasswordSchema) => {
    if (!token) {
      setError("Token no encontrado")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: data.newPassword,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Error al resetear contraseña")
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Error al resetear contraseña")
    } finally {
      setSubmitting(false)
    }
  }

  // Show error if no token or invalid token in URL
  if (!token || searchParams.get('error') === 'INVALID_TOKEN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Token Inválido</CardTitle>
            <CardDescription>
              {error || "El link de reseteo de contraseña es inválido o ha expirado"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Ir al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ResetPasswordForm
      user={{ name: "", email: "" }} // We don't need user data anymore
      companyBranding={initialCompanyBranding}
      onSubmit={handleSubmit}
      isSubmitting={submitting}
      error={error}
      success={success}
    />
  )
}

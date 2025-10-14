"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { InviteForm } from "@/components/invite-form"
import { Loader2, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { CompanyBranding } from "@/types/branding"

interface InvitationData {
  email: string
  role: string
  company: {
    id: string
    name: string
    subdomain: string
    logo?: string
    primaryColor?: string
  }
  invitedBy: {
    name: string
    email: string
  }
  expiresAt: string
}

type AcceptInviteFormData = {
  name: string
  password: string
  confirmPassword: string
}

interface InvitePageClientProps {
  initialCompanyBranding: CompanyBranding | null
}

export function InvitePageClient({ initialCompanyBranding }: InvitePageClientProps) {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    verifyInvitation()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const verifyInvitation = async () => {
    try {
      const response = await fetch(`/api/invite/verify/${token}`)
      
      if (response.ok) {
        const data = await response.json()
        setInvitation(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Invalid invitation")
      }
    } catch (err) {
      setError("Failed to verify invitation")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: AcceptInviteFormData) => {
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/invite/accept/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          password: data.password,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create account")
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to create account")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-6">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Verifying invitation...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-700 dark:text-red-400">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button 
              onClick={() => router.push('/login')}
              variant="outline"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitation) {
    return null
  }

  return (
    <InviteForm
      invitation={invitation}
      companyBranding={initialCompanyBranding}
      onSubmit={handleSubmit}
      isSubmitting={submitting}
      error={error}
      success={success}
    />
  )
}
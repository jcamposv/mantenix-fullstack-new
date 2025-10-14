"use client"

import { useAuth } from "@/lib/auth-client"
import { useEffect, useState } from "react"

interface UserProfile {
  id: string
  companyId: string
  siteId: string | null
  clientCompanyId: string | null
  role: string
  timezone: string
  locale: string
  preferences: Record<string, unknown>
  mfaEnabled: boolean
  company: {
    id: string
    name: string
    subdomain: string
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    logo: string | null
    tier: string
  } | null
  site: {
    id: string
    name: string
    clientCompany: {
      id: string
      name: string
    }
  } | null
  clientCompany: {
    id: string
    name: string
  } | null
}

interface CurrentUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  role?: string
  siteId?: string | null
  clientCompanyId?: string | null
  company?: UserProfile['company']
  site?: UserProfile['site']
  clientCompany?: UserProfile['clientCompany']
  profile?: UserProfile
}

export function useCurrentUser() {
  const { user: authUser, isLoading, isAuthenticated } = useAuth()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoading) return

    if (authUser) {
      // Set basic user info
      setUser({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        emailVerified: (authUser.emailVerified as boolean) ?? false,
        image: (authUser.image as string | null) ?? null,
        role: authUser.role,
      })
      
      // Fetch extended profile data
      fetchUserProfile(authUser.id)
    } else {
      setUser(null)
    }
    
    setLoading(false)
  }, [authUser, isLoading])

  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/profile?userId=${userId}`)
      if (response.ok) {
        const profile = await response.json()
        setUser(prev => prev ? { 
          ...prev, 
          profile,
          role: profile.role || prev.role,
          siteId: profile.siteId,
          clientCompanyId: profile.clientCompanyId,
          company: profile.company,
          site: profile.site,
          clientCompany: profile.clientCompany
        } : null)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  return {
    user,
    loading: loading || isLoading,
    isAuthenticated,
  }
}
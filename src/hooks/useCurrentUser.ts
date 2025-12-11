"use client"

import { useAuth } from "@/lib/auth-client"
import useSWR from "swr"

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

interface RoleData {
  roleInterfaceType?: string
  role: string
  isAuthenticated: boolean
  isSuperAdmin: boolean
  isGroupAdmin: boolean
  isCompanyAdmin: boolean
  companyId: string | null
  company?: UserProfile['company']
}

interface CurrentUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  role?: string
  roleInterfaceType?: string
  siteId?: string | null
  clientCompanyId?: string | null
  company?: UserProfile['company']
  site?: UserProfile['site']
  clientCompany?: UserProfile['clientCompany']
  profile?: UserProfile
  // Role-based permissions
  isSuperAdmin?: boolean
  isGroupAdmin?: boolean
  isCompanyAdmin?: boolean
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export function useCurrentUser() {
  const { user: authUser, isLoading: authLoading, isAuthenticated } = useAuth()

  // Use SWR for profile data with deduplication
  const { data: profile, isLoading: profileLoading } = useSWR<UserProfile>(
    authUser ? `/api/user/profile?userId=${authUser.id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Dedupe requests within 60 seconds
    }
  )

  // Use SWR for role data with deduplication
  const { data: roleData, isLoading: roleLoading } = useSWR<RoleData>(
    authUser ? '/api/auth/user-role' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Dedupe requests within 60 seconds
    }
  )

  // Build user object directly from SWR data, no useState needed
  // This ensures user is always in sync with the data
  const user: CurrentUser | null = authUser && !authLoading && !roleLoading && !profileLoading && roleData ? {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    emailVerified: (authUser.emailVerified as boolean) ?? false,
    image: (authUser.image as string | null) ?? null,
    role: roleData.role || profile?.role || authUser.role,
    roleInterfaceType: roleData.roleInterfaceType,
    siteId: profile?.siteId,
    clientCompanyId: profile?.clientCompanyId,
    company: roleData.company || profile?.company,
    site: profile?.site,
    clientCompany: profile?.clientCompany,
    profile,
    // Role-based permissions from roleData
    isSuperAdmin: roleData.isSuperAdmin ?? false,
    isGroupAdmin: roleData.isGroupAdmin ?? false,
    isCompanyAdmin: roleData.isCompanyAdmin ?? false,
  } : null

  // Include ALL loading states
  const loading = authLoading || (authUser ? (profileLoading || roleLoading) : false)

  return {
    user,
    loading,
    isAuthenticated,
  }
}
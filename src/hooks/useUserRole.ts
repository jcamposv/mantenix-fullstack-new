"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-client"

interface UserRole {
  role: string | null
  isAuthenticated: boolean
  isSuperAdmin: boolean
  isGroupAdmin: boolean
  isCompanyAdmin: boolean
  companyId: string | null
}

export function useUserRole() {
  const { isAuthenticated, isLoading } = useAuth()
  const [userRole, setUserRole] = useState<UserRole>({
    role: null,
    isAuthenticated: false,
    isSuperAdmin: false,
    isGroupAdmin: false,
    isCompanyAdmin: false,
    companyId: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        fetchUserRole()
      } else {
        setUserRole({
          role: null,
          isAuthenticated: false,
          isSuperAdmin: false,
          isGroupAdmin: false,
          isCompanyAdmin: false,
          companyId: null,
        })
        setLoading(false)
      }
    }
  }, [isAuthenticated, isLoading])

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/auth/user-role')
      if (response.ok) {
        const data = await response.json()
        setUserRole(data)
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    ...userRole,
    loading: loading || isLoading
  }
}
/**
 * Better Auth Client Configuration
 * React hooks and client-side utilities for authentication
 */

import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
})

// Extend the user type to include custom fields
type ExtendedUser = {
  id: string
  email: string
  name: string
  role?: string
  companyId?: string
  mfaEnabled?: boolean
  isMfaVerified?: boolean
  preferences?: string
  [key: string]: unknown
}

type Company = {
  id: string
  name: string
  subdomain?: string
} | null

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
  // Add other hooks as needed
} = authClient

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Enhanced session hook with company context
 */
export function useAuth() {
  const session = useSession()
  
  // Get user from actual session structure and cast to ExtendedUser
  const enhancedUser = (session.data?.user as ExtendedUser) || null

  
  return {
    user: enhancedUser,
    company: null as Company, // Company data not loaded in session currently
    isLoading: session.isPending,
    isAuthenticated: !!session.data?.user,
    role: enhancedUser?.role || null,
    mfaEnabled: enhancedUser?.mfaEnabled || false,
    isMfaVerified: enhancedUser?.isMfaVerified || false,
    preferences: enhancedUser?.preferences ? JSON.parse(enhancedUser.preferences) : {},
    companyId: enhancedUser?.companyId || null,
    
    // Actions
    signIn: signIn.email,
    signOut,
    
    // Utility functions
    hasRole: (roles: string | string[]) => {
      const userRole = enhancedUser?.role
      if (!userRole) return false
      
      const rolesArray = Array.isArray(roles) ? roles : [roles]
      return rolesArray.includes(userRole)
    },
    
    can: (permission: string) => {
      // Role-based permission checking
      const userRole = enhancedUser?.role
      if (!userRole) return false
      
      // Define permission hierarchy
      const permissions: Record<string, string[]> = {
        'admin:manage_companies': ['SUPER_ADMIN'],
        'admin:manage_users': ['SUPER_ADMIN', 'ADMIN_EMPRESA'],
        'admin:view_audit_logs': ['SUPER_ADMIN', 'ADMIN_EMPRESA'],
        'admin:manage_security': ['SUPER_ADMIN', 'ADMIN_EMPRESA'],
        'company:manage_settings': ['SUPER_ADMIN', 'ADMIN_EMPRESA'],
        'company:view_reports': ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'SUPERVISOR'],
        'user:manage_profile': ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'SUPERVISOR', 'TECNICO', 'CLIENTE_OPERATIVO', 'CLIENTE_ADMIN'],
        'work_orders:create': ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'SUPERVISOR', 'TECNICO', 'CLIENTE_OPERATIVO'],
        'work_orders:assign': ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'SUPERVISOR'],
        'work_orders:complete': ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'SUPERVISOR', 'TECNICO'],
        'work_orders:view': ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'SUPERVISOR', 'TECNICO', 'CLIENTE_OPERATIVO', 'CLIENTE_ADMIN'],
      }
      
      const allowedRoles = permissions[permission] || []
      return allowedRoles.includes(userRole)
    },
    
    // Role checking functions
    isSuperAdmin: () => enhancedUser?.role === 'SUPER_ADMIN',
    isCompanyAdmin: () => enhancedUser?.role === 'ADMIN_EMPRESA',
    isSupervisor: () => enhancedUser?.role === 'SUPERVISOR',
    isTechnician: () => enhancedUser?.role === 'TECNICO',
    isClientOperative: () => enhancedUser?.role === 'CLIENTE_OPERATIVO',
    isClientAdmin: () => enhancedUser?.role === 'CLIENTE_ADMIN',
  }
}

/**
 * Hook for company branding
 * TODO: Load company data based on companyId
 */
type Branding = {
  logo?: string
  primaryColor?: string
  secondaryColor?: string
} | null

export function useBranding() {
  const { companyId } = useAuth()
  
  return {
    branding: null as Branding, // TODO: Fetch company data based on companyId
    
    applyBranding: () => {
      // TODO: Apply branding once company data is loaded
      console.log('Branding not implemented yet - companyId:', companyId)
    }
  }
}

// ============================================================================
// CLIENT-SIDE UTILITIES
// ============================================================================

/**
 * Check if user has permission on client side (async)
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const session = await getSession()
  const userRole = (session.data?.user as ExtendedUser)?.role
  
  if (!userRole) return false
  
  const permissions: Record<string, string[]> = {
    'admin:manage_companies': ['SUPER_ADMIN'],
    'admin:manage_users': ['SUPER_ADMIN', 'ADMIN_EMPRESA'],
    'admin:view_audit_logs': ['SUPER_ADMIN', 'ADMIN_EMPRESA'],
    'admin:manage_security': ['SUPER_ADMIN', 'ADMIN_EMPRESA'],
    'company:manage_settings': ['SUPER_ADMIN', 'ADMIN_EMPRESA'],
    'company:view_reports': ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'SUPERVISOR'],
    'user:manage_profile': ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'SUPERVISOR', 'TECNICO', 'CLIENTE_OPERATIVO', 'CLIENTE_ADMIN'],
    'work_orders:create': ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'SUPERVISOR', 'TECNICO', 'CLIENTE_OPERATIVO'],
    'work_orders:assign': ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'SUPERVISOR'],
    'work_orders:complete': ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'SUPERVISOR', 'TECNICO'],
    'work_orders:view': ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'SUPERVISOR', 'TECNICO', 'CLIENTE_OPERATIVO', 'CLIENTE_ADMIN'],
  }
  
  const allowedRoles = permissions[permission] || []
  return allowedRoles.includes(userRole)
}

/**
 * Get user role hierarchy level (for UI permissions) (async)
 */
export async function getRoleLevel(): Promise<number> {
  const session = await getSession()
  const userRole = (session.data?.user as ExtendedUser)?.role
  
  const roleLevels = {
    'SUPER_ADMIN': 6,
    'ADMIN_EMPRESA': 5,
    'SUPERVISOR': 4,
    'TECNICO': 3,
    'CLIENTE_ADMIN': 2,
    'CLIENTE_OPERATIVO': 1,
  }
  
  return roleLevels[userRole as keyof typeof roleLevels] || 0
}

/**
 * Format user display name
 */
export function formatUserName(user?: { name?: string; email?: string }): string {
  if (!user) return 'Unknown User'
  return user.name || user.email || 'Unknown User'
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user?: { name?: string; email?: string }): string {
  if (!user) return 'U'
  
  const name = user.name || user.email || 'User'
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/**
 * Check if MFA is required for current user (async)
 */
export async function isMfaRequired(): Promise<boolean> {
  const session = await getSession()
  const user = session.data?.user as ExtendedUser
  
  if (!user) return false
  
  // MFA required for admin roles
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN_EMPRESA') {
    return true
  }
  
  // TODO: Check if company enforces MFA once company data is loaded
  // For now, default to false since we don't have company data in session
  
  return false
}

/**
 * Get session timeout in milliseconds based on role (async)
 */
export async function getSessionTimeout(): Promise<number> {
  const session = await getSession()
  const userRole = (session.data?.user as ExtendedUser)?.role
  
  const timeouts = {
    'SUPER_ADMIN': 15 * 60 * 1000,        // 15 minutes
    'ADMIN_EMPRESA': 15 * 60 * 1000,      // 15 minutes
    'SUPERVISOR': 4 * 60 * 60 * 1000,     // 4 hours
    'TECNICO': 8 * 60 * 60 * 1000,        // 8 hours
    'CLIENTE_OPERATIVO': 8 * 60 * 60 * 1000, // 8 hours
    'CLIENTE_ADMIN': 4 * 60 * 60 * 1000,  // 4 hours
  }
  
  return timeouts[userRole as keyof typeof timeouts] || timeouts.TECNICO
}
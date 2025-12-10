/**
 * Navigation Types
 *
 * Type-safe navigation configuration
 * Following Next.js Expert standards
 */

import { LucideIcon } from 'lucide-react'

export interface NavigationItem {
  title: string
  url: string
  icon: LucideIcon
  badge?: boolean
  isActive?: boolean
  permission?: string
  requiresFeature?: string
  items?: NavigationSubItem[]
}

export interface NavigationSubItem {
  title: string
  url: string
  permission?: string
}

export interface NavigationGroup {
  title?: string // Optional group title
  items: NavigationItem[]
}

export interface NavigationConfig {
  main: NavigationGroup[]
  admin: NavigationGroup[]
  client: NavigationGroup[]
}

export interface UserPermissions {
  permissions: string[]
  role: string
  isExternalUser: boolean
}

export interface EnabledFeatures {
  hasAttendance?: boolean
  hasTimeOff?: boolean
  hasExternalClientMgmt?: boolean
  hasInternalCorporateGroup?: boolean
  hasPredictiveMaintenance?: boolean
}

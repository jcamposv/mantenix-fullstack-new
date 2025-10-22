"use client"

import { useRouter } from "next/navigation"
import { useCurrentUser } from "./useCurrentUser"
import { PermissionHelper } from "@/server/helpers/permission.helper"

export function usePlatformSwitch() {
  const { user } = useCurrentUser()
  const router = useRouter()

  // Admin roles that can choose platform
  const adminRoles = [
    PermissionHelper.ROLES.SUPER_ADMIN, 
    PermissionHelper.ROLES.ADMIN_EMPRESA, 
    PermissionHelper.ROLES.SUPERVISOR,
    PermissionHelper.ROLES.CLIENTE_ADMIN_GENERAL,
    PermissionHelper.ROLES.CLIENTE_ADMIN_SEDE
  ]

  const isAdmin = user?.role && adminRoles.includes(user.role as typeof adminRoles[number])

  const switchToMobile = () => {
    router.push('/mobile')
  }

  const switchToDesktop = () => {
    router.push('/')
  }

  const goToPlatformSelection = () => {
    router.push('/platform-selection')
  }

  return {
    isAdmin: !!isAdmin,
    switchToMobile,
    switchToDesktop,
    goToPlatformSelection
  }
}
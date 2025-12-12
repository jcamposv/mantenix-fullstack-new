"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ReactNode } from "react"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { usePermissions } from "@/hooks/usePermissions"

interface MobileNavLinkProps {
  href: string
  icon: ReactNode
  label: string
  isActive?: boolean
}

export function MobileNavLink({ href, icon, label, isActive }: MobileNavLinkProps) {
  const pathname = usePathname()
  const active = isActive ?? (href === "/mobile" ? pathname === href : pathname.startsWith(href))

  return (
    <Link 
      href={href}
      className={cn(
        "flex flex-col items-center p-3 rounded-lg text-center transition-colors",
        active 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-muted/50"
      )}
    >
      <div className="w-6 h-6 mb-1">
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  )
}

export function MobileNavigation() {
  const { user: currentUser } = useCurrentUser()
  const { hasPermission } = usePermissions()

  const isExternalUser = !!currentUser?.clientCompanyId

  // Build navigation items based on permissions
  const navItems: MobileNavLinkProps[] = []

  // Assets - Para operarios que cambian estado de máquinas
  if (hasPermission('assets.change_status')) {
    navItems.push({
      href: "/mobile/assets",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      label: "Máquinas"
    })
  }

  // Work Orders - Para técnicos/mecánicos que ven y completan OT
  if (hasPermission('work_orders.view_assigned') || hasPermission('work_orders.complete')) {
    navItems.push({
      href: "/mobile/work-orders",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      label: "Órdenes"
    })
  }

  // Attendance - Para usuarios con permiso de asistencia
  if (hasPermission('attendance.create') || hasPermission('attendance.view')) {
    navItems.push({
      href: "/mobile/attendance",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "Asistencia"
    })
  }

  // Alerts - Para clientes externos
  if (isExternalUser && hasPermission('alerts.create')) {
    navItems.push({
      href: "/mobile/alerts",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      label: "Alertas"
    })
  }

  // Always show Settings
  navItems.push({
    href: "/mobile/settings",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: "Ajustes"
  })

  // Determine grid columns based on number of items
  const gridCols = `grid-cols-${Math.min(navItems.length, 4)}`

  return (
    <div className={cn("grid gap-2 w-full", gridCols)}>
      {navItems.map((item) => (
        <MobileNavLink key={item.href} {...item} />
      ))}
    </div>
  )
}
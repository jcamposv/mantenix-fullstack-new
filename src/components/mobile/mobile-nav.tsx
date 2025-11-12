"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ReactNode } from "react"
import { useCurrentUser } from "@/hooks/useCurrentUser"

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

  const role = currentUser?.role

  // Usuarios externos (clientes)
  const isExternalUser = role && ['CLIENTE_ADMIN_GENERAL', 'CLIENTE_ADMIN_SEDE', 'CLIENTE_OPERARIO'].includes(role)

  // Técnicos y supervisores (internos que no ven alertas)
  const isTechnicianOrSupervisor = role && ['TECNICO', 'SUPERVISOR'].includes(role)

  // Admin empresa (interno que ve todo)
  const isCompanyAdmin = role === 'ADMIN_EMPRESA'

  // USUARIOS EXTERNOS: Alertas, Crear Alerta, Perfil
  if (isExternalUser) {
    return (
      <div className="grid grid-cols-3 gap-2 w-full">
        <MobileNavLink
          href="/mobile"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
          label="Alertas"
        />
        <MobileNavLink
          href="/mobile/create-alert"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Crear"
        />
        <MobileNavLink
          href="/mobile/profile"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          label="Perfil"
        />
      </div>
    )
  }

  // TÉCNICOS/SUPERVISORES: Órdenes, Asistencia, Perfil
  if (isTechnicianOrSupervisor) {
    return (
      <div className="grid grid-cols-3 gap-2 w-full">
        <MobileNavLink
          href="/mobile/work-orders"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          }
          label="Órdenes"
        />
        <MobileNavLink
          href="/mobile/attendance"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Asistencia"
        />
        <MobileNavLink
          href="/mobile/profile"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          label="Perfil"
        />
      </div>
    )
  }

  // ADMIN_EMPRESA: Órdenes, Asistencia, Alertas, Perfil (4 botones)
  if (isCompanyAdmin) {
    return (
      <div className="grid grid-cols-4 gap-2 w-full">
        <MobileNavLink
          href="/mobile/work-orders"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          }
          label="Órdenes"
        />
        <MobileNavLink
          href="/mobile/attendance"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Asistencia"
        />
        <MobileNavLink
          href="/mobile"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
          label="Alertas"
        />
        <MobileNavLink
          href="/mobile/profile"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          label="Perfil"
        />
      </div>
    )
  }

  // Default: Solo perfil
  return (
    <div className="grid grid-cols-1 gap-2 w-full">
      <MobileNavLink
        href="/mobile/profile"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
        label="Perfil"
      />
    </div>
  )
}
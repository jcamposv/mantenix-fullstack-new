"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ReactNode } from "react"

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

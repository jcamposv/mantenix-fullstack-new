import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface MobileFooterProps {
  children: ReactNode
  className?: string
}

export function MobileFooter({ children, className }: MobileFooterProps) {
  return (
    <div className={cn(
      "fixed bottom-[10px] left-0 right-0 z-50",
      "bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80",
      "border-t border-border/50",
      "px-4 py-3",
      "pb-[env(safe-area-inset-bottom,0.75rem)]", // iOS safe area
      className
    )}>
      {children}
    </div>
  )
}

interface MobileFooterContentProps {
  children: ReactNode
  className?: string
}

export function MobileFooterContent({ children, className }: MobileFooterContentProps) {
  return (
    <div className={cn(
      "flex items-center gap-3",
      "max-w-md mx-auto w-full",
      className
    )}>
      {children}
    </div>
  )
}
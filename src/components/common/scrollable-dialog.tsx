"use client"

import type { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ScrollableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
}

/**
 * ScrollableDialog Component
 * Reusable dialog with fixed header/footer and scrollable content
 *
 * Features:
 * - Fixed header and footer
 * - Scrollable content area
 * - Responsive max widths
 * - Proper overflow handling
 *
 * Usage:
 * ```tsx
 * <ScrollableDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Dialog Title"
 *   description="Optional description"
 *   footer={<Button>Save</Button>}
 * >
 *   <YourFormContent />
 * </ScrollableDialog>
 * ```
 */
export function ScrollableDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
}: ScrollableDialogProps) {
  const maxWidthClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "3xl": "sm:max-w-3xl",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${maxWidthClasses[maxWidth]} max-h-[90vh] flex flex-col p-0`}
      >
        {/* Fixed Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {/* Fixed Footer */}
        {footer && (
          <DialogFooter className="px-6 py-4 border-t shrink-0">{footer}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, Users, Eye, Trash2 } from "lucide-react"

interface EventContextMenuProps {
  children: React.ReactNode
  onEdit: () => void
  onAssign: () => void
  onViewDetails: () => void
  onDelete: () => void
}

/**
 * EventContextMenu
 * Dropdown menu for work order event actions
 */
export function EventContextMenu({
  children,
  onEdit,
  onAssign,
  onViewDetails,
  onDelete,
}: EventContextMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Editar orden
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAssign}>
          <Users className="mr-2 h-4 w-4" />
          Asignar técnicos
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onViewDetails}>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalles completos
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar orden
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

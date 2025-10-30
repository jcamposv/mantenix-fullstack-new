import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, UserX, KeyRound } from "lucide-react"

interface TableAction {
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  variant?: "default" | "destructive"
  disabled?: boolean
}

interface TableActionsProps {
  actions: TableAction[]
}

export function TableActions({ actions }: TableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className={action.variant === "destructive" ? "text-destructive" : ""}
          >
            <action.icon className="mr-2 h-4 w-4" />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Predefined common action types
export const createEditAction = (onClick: () => void): TableAction => ({
  label: "Editar",
  icon: Edit,
  onClick,
})

export const createViewAction = (onClick: () => void): TableAction => ({
  label: "Ver",
  icon: Eye,
  onClick,
})

export const createDeleteAction = (onClick: () => void, disabled = false): TableAction => ({
  label: "Eliminar",
  icon: Trash2,
  onClick,
  variant: "destructive",
  disabled,
})

export const createDeactivateAction = (onClick: () => void): TableAction => ({
  label: "Desactivar",
  icon: UserX,
  onClick,
  variant: "destructive",
})

export const createResetPasswordAction = (onClick: () => void, disabled = false): TableAction => ({
  label: "Resetear Contraseña",
  icon: KeyRound,
  onClick,
  disabled,
})
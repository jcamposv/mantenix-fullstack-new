import { Button } from "@/components/ui/button"

interface UserFormActionsProps {
  onCancel: () => void
  loading?: boolean
  mode: "create" | "invite" | "edit"
}

export function UserFormActions({ onCancel, loading, mode }: UserFormActionsProps) {
  const getButtonText = () => {
    if (loading) {
      if (mode === "invite") return "Sending Invitation..."
      if (mode === "edit") return "Updating..."
      return "Creating..."
    }
    if (mode === "invite") return "Send Invitation"
    if (mode === "edit") return "Update User"
    return "Create User"
  }

  return (
    <div className="flex justify-end space-x-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={loading}>
        {getButtonText()}
      </Button>
    </div>
  )
}
import { Button } from "@/components/ui/button"

interface UserFormActionsProps {
  onCancel: () => void
  loading?: boolean
  mode: "create" | "invite"
}

export function UserFormActions({ onCancel, loading, mode }: UserFormActionsProps) {
  return (
    <div className="flex justify-end space-x-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={loading}>
        {loading 
          ? (mode === "invite" ? "Sending Invitation..." : "Creating...")
          : (mode === "invite" ? "Send Invitation" : "Create User")
        }
      </Button>
    </div>
  )
}
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AssetStatusHistory } from "./asset-status-history"

interface AssetStatusHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assetId: string
  assetName: string
}

export function AssetStatusHistoryDialog({
  open,
  onOpenChange,
  assetId,
  assetName
}: AssetStatusHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Historial de Estados - {assetName}</DialogTitle>
        </DialogHeader>
        <AssetStatusHistory assetId={assetId} className="border-0 shadow-none" />
      </DialogContent>
    </Dialog>
  )
}

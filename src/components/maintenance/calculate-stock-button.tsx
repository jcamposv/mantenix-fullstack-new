/**
 * Calculate Stock Button Component
 *
 * Button to auto-calculate minimum stock based on ISO 14224 standards.
 * Uses component criticality, MTBF, and MTTR to determine optimal stock levels.
 *
 * Following Next.js Expert standards:
 * - Small focused component (<200 lines)
 * - Type-safe
 * - Proper error handling
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calculator, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CalculateStockButtonProps {
  componentId: string
  onSuccess?: (result: { newMinStock: number; message: string }) => void
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function CalculateStockButton({
  componentId,
  onSuccess,
  variant = 'outline',
  size = 'default',
  className,
}: CalculateStockButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleCalculate = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/maintenance/calculate-min-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al calcular stock mínimo')
      }

      const result = await response.json()
      toast.success(result.message)
      onSuccess?.(result)
    } catch (error) {
      console.error('Error calculating stock:', error)
      toast.error(
        error instanceof Error ? error.message : 'Error al calcular stock mínimo'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCalculate}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Calculator className="h-4 w-4 mr-2" />
      )}
      {loading ? 'Calculando...' : 'Calcular Stock Mínimo'}
    </Button>
  )
}

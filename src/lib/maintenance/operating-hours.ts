/**
 * Operating Hours Utilities
 *
 * Calculates or retrieves operating hours for assets and components.
 * Supports manual entry, calculation from purchase date, or defaults.
 *
 * Following Next.js Expert standards:
 * - Pure utility functions
 * - Type-safe
 * - Well-documented
 */

import { prisma } from '@/lib/prisma'

/**
 * Get operating hours for a component
 * Strategy:
 * 1. Find all assets where this component appears (via hotspots)
 * 2. Use the maximum operatingHours from all related assets
 * 3. If no assets or no operatingHours, calculate from purchaseDate
 * 4. If no purchaseDate, return 0
 */
export async function getComponentOperatingHours(
  componentId: string
): Promise<number> {
  try {
    // Find all assets related to this component via hotspots
    const hotspots = await prisma.explodedViewHotspot.findMany({
      where: { componentId, isActive: true },
      include: {
        view: {
          include: {
            asset: {
              select: {
                operatingHours: true,
                purchaseDate: true,
                registrationDate: true,
              },
            },
          },
        },
      },
    })

    if (hotspots.length === 0) {
      return 0
    }

    // Get all unique assets
    const assets = hotspots
      .map((h) => h.view.asset)
      .filter((asset, index, self) => {
        // Remove duplicates
        return self.findIndex((a) => a === asset) === index
      })

    // Try to get maximum operatingHours
    const maxOperatingHours = Math.max(
      ...assets
        .map((a) => a.operatingHours ?? 0)
        .filter((h) => h > 0)
    )

    if (maxOperatingHours > 0) {
      return maxOperatingHours
    }

    // If no manual operatingHours, calculate from dates
    const calculatedHours = assets
      .map((asset) => calculateOperatingHoursFromDates(asset))
      .filter((h) => h > 0)

    return Math.max(...calculatedHours, 0)
  } catch (error) {
    console.error('Error getting component operating hours:', error)
    return 0
  }
}

/**
 * Calculate operating hours from asset dates
 * Assumes continuous operation since purchase or registration
 */
function calculateOperatingHoursFromDates(asset: {
  purchaseDate: Date | null
  registrationDate: Date
}): number {
  const startDate = asset.purchaseDate || asset.registrationDate
  const now = new Date()
  const daysSince = Math.floor(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Assume 12 hours/day average operation (conservative estimate)
  // In reality, this should be configurable per asset type
  const HOURS_PER_DAY = 12
  return daysSince * HOURS_PER_DAY
}

/**
 * Get operating hours for an asset
 * Uses manual entry if available, otherwise calculates from dates
 */
export async function getAssetOperatingHours(assetId: string): Promise<number> {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: {
        operatingHours: true,
        purchaseDate: true,
        registrationDate: true,
      },
    })

    if (!asset) {
      return 0
    }

    // Prefer manual entry
    if (asset.operatingHours && asset.operatingHours > 0) {
      return asset.operatingHours
    }

    // Calculate from dates
    return calculateOperatingHoursFromDates(asset)
  } catch (error) {
    console.error('Error getting asset operating hours:', error)
    return 0
  }
}

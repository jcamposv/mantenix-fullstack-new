/**
 * Internal Site Helper
 * Creates and manages internal sites for companies without EXTERNAL_CLIENT_MANAGEMENT
 * These sites are invisible to users but required by the database schema
 */

import { prisma } from '@/lib/prisma';

/**
 * Gets or creates an internal site for a company
 * Used when EXTERNAL_CLIENT_MANAGEMENT is disabled
 *
 * This creates:
 * 1. Internal ClientCompany (hidden from UI)
 * 2. Internal Site "Sede Principal" (hidden from UI)
 *
 * All internal assets are automatically assigned to this site
 *
 * @param companyId - Company ID
 * @param createdByUserId - User creating the internal site
 * @returns Site ID for internal assets
 */
export async function getOrCreateInternalSite(
  companyId: string,
  createdByUserId: string
): Promise<string> {
  try {
    // Look for existing internal client company for this tenant
    // Internal companies are marked with notes: '{"isInternal":true}'
    let internalClientCompany: { id: string; sites: { id: string }[] } | null = await prisma.clientCompany.findFirst({
      where: {
        tenantCompanyId: companyId,
        notes: { contains: '"isInternal":true' }
      },
      select: {
        id: true,
        sites: {
          where: {
            isActive: true
          },
          select: {
            id: true
          },
          take: 1
        }
      }
    });

    // If internal client company exists and has a site, return it
    if (internalClientCompany?.sites[0]) {
      return internalClientCompany.sites[0].id;
    }

    // Get company name for naming
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true }
    });

    if (!company) {
      throw new Error('Empresa no encontrada');
    }

    // Create internal client company if it doesn't exist
    if (!internalClientCompany) {
      const newClientCompany = await prisma.clientCompany.create({
        data: {
          name: `Activos Internos - ${company.name}`,
          notes: JSON.stringify({ isInternal: true }), // Mark as internal (hidden from UI)
          tenantCompanyId: companyId,
          createdBy: createdByUserId
        },
        select: {
          id: true,
          sites: {
            select: {
              id: true
            }
          }
        }
      });

      internalClientCompany = newClientCompany;
    }

    // Create internal site
    const internalSite = await prisma.site.create({
      data: {
        name: 'Sede Principal',
        address: 'Ubicación interna',
        clientCompany: {
          connect: { id: internalClientCompany.id }
        },
        createdByUser: {
          connect: { id: createdByUserId }
        }
      },
      select: {
        id: true
      }
    });

    return internalSite.id;
  } catch (error) {
    console.error('Error getting/creating internal site:', error);
    throw new Error('No se pudo crear la sede interna para activos');
  }
}

/**
 * Checks if a site is an internal site (invisible to users)
 *
 * @param siteId - Site ID to check
 * @returns true if site is internal
 */
export async function isInternalSite(siteId: string): Promise<boolean> {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: {
      clientCompany: {
        select: {
          notes: true
        }
      }
    }
  });

  if (!site?.clientCompany?.notes) {
    return false;
  }

  try {
    const notesData = JSON.parse(site.clientCompany.notes);
    return notesData.isInternal === true;
  } catch {
    return false;
  }
}

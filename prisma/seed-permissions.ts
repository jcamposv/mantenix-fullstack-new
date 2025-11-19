/**
 * Seed de Permisos del Sistema
 * Migra los permisos desde PermissionHelper a la base de datos
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PermissionSeed {
  key: string;
  name: string;
  description: string;
  module: string;
}

/**
 * Permisos del sistema organizados por módulo
 */
const PERMISSIONS: PermissionSeed[] = [
  // ============================================================================
  // ALERTS MODULE
  // ============================================================================
  {
    key: 'alerts.create',
    name: 'Crear Alertas',
    description: 'Permite crear nuevas alertas',
    module: 'alerts'
  },
  {
    key: 'alerts.update',
    name: 'Actualizar Alertas',
    description: 'Permite modificar alertas existentes',
    module: 'alerts'
  },
  {
    key: 'alerts.delete',
    name: 'Eliminar Alertas',
    description: 'Permite eliminar alertas',
    module: 'alerts'
  },
  {
    key: 'alerts.view_all',
    name: 'Ver Todas las Alertas',
    description: 'Permite ver alertas de todo el sistema',
    module: 'alerts'
  },
  {
    key: 'alerts.view_company',
    name: 'Ver Alertas de la Empresa',
    description: 'Permite ver alertas de la empresa',
    module: 'alerts'
  },
  {
    key: 'alerts.view_client',
    name: 'Ver Alertas de Cliente',
    description: 'Permite ver alertas de clientes externos',
    module: 'alerts'
  },
  {
    key: 'alerts.view_site',
    name: 'Ver Alertas de Sede',
    description: 'Permite ver alertas de una sede específica',
    module: 'alerts'
  },
  {
    key: 'alerts.view_assigned',
    name: 'Ver Alertas Asignadas',
    description: 'Permite ver solo alertas asignadas al usuario',
    module: 'alerts'
  },
  {
    key: 'alerts.comment',
    name: 'Comentar en Alertas',
    description: 'Permite crear comentarios en alertas',
    module: 'alerts'
  },

  // ============================================================================
  // WORK ORDERS MODULE
  // ============================================================================
  {
    key: 'work_orders.create',
    name: 'Crear Órdenes de Trabajo',
    description: 'Permite crear nuevas órdenes de trabajo',
    module: 'work_orders'
  },
  {
    key: 'work_orders.update',
    name: 'Actualizar Órdenes de Trabajo',
    description: 'Permite modificar órdenes de trabajo',
    module: 'work_orders'
  },
  {
    key: 'work_orders.delete',
    name: 'Eliminar Órdenes de Trabajo',
    description: 'Permite eliminar órdenes de trabajo',
    module: 'work_orders'
  },
  {
    key: 'work_orders.view_all',
    name: 'Ver Todas las OT',
    description: 'Permite ver órdenes de trabajo de toda la empresa',
    module: 'work_orders'
  },
  {
    key: 'work_orders.view_assigned',
    name: 'Ver OT Asignadas',
    description: 'Permite ver solo órdenes asignadas al usuario',
    module: 'work_orders'
  },
  {
    key: 'work_orders.assign',
    name: 'Asignar Órdenes de Trabajo',
    description: 'Permite asignar órdenes a técnicos',
    module: 'work_orders'
  },
  {
    key: 'work_orders.complete',
    name: 'Completar Órdenes de Trabajo',
    description: 'Permite marcar órdenes como completadas',
    module: 'work_orders'
  },
  {
    key: 'work_orders.cancel',
    name: 'Cancelar Órdenes de Trabajo',
    description: 'Permite cancelar órdenes de trabajo',
    module: 'work_orders'
  },
  {
    key: 'work_orders.manage_templates',
    name: 'Gestionar Plantillas de OT',
    description: 'Permite gestionar (ver, crear, editar, eliminar) plantillas de órdenes de trabajo',
    module: 'work_orders'
  },
  {
    key: 'work_orders.manage_prefixes',
    name: 'Gestionar Prefijos de Numeración',
    description: 'Permite gestionar (ver, crear, editar, eliminar) prefijos de numeración de órdenes de trabajo',
    module: 'work_orders'
  },

  // ============================================================================
  // USERS MODULE
  // ============================================================================
  {
    key: 'users.create',
    name: 'Crear Usuarios',
    description: 'Permite crear nuevos usuarios',
    module: 'users'
  },
  {
    key: 'users.update',
    name: 'Actualizar Usuarios',
    description: 'Permite modificar usuarios existentes',
    module: 'users'
  },
  {
    key: 'users.delete',
    name: 'Eliminar Usuarios',
    description: 'Permite eliminar usuarios',
    module: 'users'
  },
  {
    key: 'users.view',
    name: 'Ver Usuarios',
    description: 'Permite ver usuarios',
    module: 'users'
  },
  {
    key: 'users.view_all',
    name: 'Ver Todos los Usuarios',
    description: 'Permite ver usuarios de todo el sistema',
    module: 'users'
  },
  {
    key: 'users.view_company',
    name: 'Ver Usuarios de la Empresa',
    description: 'Permite ver usuarios de la empresa',
    module: 'users'
  },
  {
    key: 'users.view_client',
    name: 'Ver Usuarios de Cliente',
    description: 'Permite ver usuarios de clientes externos',
    module: 'users'
  },

  // ============================================================================
  // CUSTOM ROLES MODULE
  // ============================================================================
  {
    key: 'custom_roles.create',
    name: 'Crear Roles Personalizados',
    description: 'Permite crear nuevos roles personalizados',
    module: 'custom_roles'
  },
  {
    key: 'custom_roles.view',
    name: 'Ver Roles Personalizados',
    description: 'Permite ver roles personalizados',
    module: 'custom_roles'
  },
  {
    key: 'custom_roles.update',
    name: 'Actualizar Roles Personalizados',
    description: 'Permite modificar roles personalizados',
    module: 'custom_roles'
  },
  {
    key: 'custom_roles.delete',
    name: 'Eliminar Roles Personalizados',
    description: 'Permite eliminar roles personalizados',
    module: 'custom_roles'
  },

  // ============================================================================
  // ASSETS MODULE
  // ============================================================================
  {
    key: 'assets.create',
    name: 'Crear Activos',
    description: 'Permite crear nuevos activos',
    module: 'assets'
  },
  {
    key: 'assets.update',
    name: 'Actualizar Activos',
    description: 'Permite modificar activos existentes',
    module: 'assets'
  },
  {
    key: 'assets.delete',
    name: 'Eliminar Activos',
    description: 'Permite eliminar activos',
    module: 'assets'
  },
  {
    key: 'assets.view',
    name: 'Ver Activos',
    description: 'Permite ver activos',
    module: 'assets'
  },
  {
    key: 'assets.change_status',
    name: 'Cambiar Estado de Activos',
    description: 'Permite cambiar el estado de activos (operativo, en mantenimiento, fuera de servicio)',
    module: 'assets'
  },
  {
    key: 'assets.view_status_history',
    name: 'Ver Historial de Estado',
    description: 'Permite ver el historial de cambios de estado de activos',
    module: 'assets'
  },

  // ============================================================================
  // CLIENT COMPANIES MODULE
  // ============================================================================
  {
    key: 'client_companies.create',
    name: 'Crear Empresas Cliente',
    description: 'Permite crear nuevas empresas cliente',
    module: 'client_companies'
  },
  {
    key: 'client_companies.update',
    name: 'Actualizar Empresas Cliente',
    description: 'Permite modificar empresas cliente',
    module: 'client_companies'
  },
  {
    key: 'client_companies.delete',
    name: 'Eliminar Empresas Cliente',
    description: 'Permite eliminar empresas cliente',
    module: 'client_companies'
  },
  {
    key: 'client_companies.view',
    name: 'Ver Empresas Cliente',
    description: 'Permite ver empresas cliente',
    module: 'client_companies'
  },

  // ============================================================================
  // SITES MODULE
  // ============================================================================
  {
    key: 'sites.create',
    name: 'Crear Sedes',
    description: 'Permite crear nuevas sedes',
    module: 'sites'
  },
  {
    key: 'sites.update',
    name: 'Actualizar Sedes',
    description: 'Permite modificar sedes existentes',
    module: 'sites'
  },
  {
    key: 'sites.delete',
    name: 'Eliminar Sedes',
    description: 'Permite eliminar sedes',
    module: 'sites'
  },
  {
    key: 'sites.view',
    name: 'Ver Sedes',
    description: 'Permite ver sedes',
    module: 'sites'
  },

  // ============================================================================
  // COMPANIES MODULE
  // ============================================================================
  {
    key: 'companies.create',
    name: 'Crear Empresas',
    description: 'Permite crear nuevas empresas',
    module: 'companies'
  },
  {
    key: 'companies.update',
    name: 'Actualizar Empresas',
    description: 'Permite modificar empresas',
    module: 'companies'
  },
  {
    key: 'companies.delete',
    name: 'Eliminar Empresas',
    description: 'Permite eliminar empresas',
    module: 'companies'
  },
  {
    key: 'companies.view',
    name: 'Ver Empresas',
    description: 'Permite ver empresas',
    module: 'companies'
  },

  // ============================================================================
  // COMPANY GROUPS MODULE
  // ============================================================================
  {
    key: 'company_groups.create',
    name: 'Crear Grupos Corporativos',
    description: 'Permite crear grupos corporativos',
    module: 'company_groups'
  },
  {
    key: 'company_groups.update',
    name: 'Actualizar Grupos Corporativos',
    description: 'Permite modificar grupos corporativos',
    module: 'company_groups'
  },
  {
    key: 'company_groups.delete',
    name: 'Eliminar Grupos Corporativos',
    description: 'Permite eliminar grupos corporativos',
    module: 'company_groups'
  },
  {
    key: 'company_groups.view',
    name: 'Ver Grupos Corporativos',
    description: 'Permite ver grupos corporativos',
    module: 'company_groups'
  },
  {
    key: 'company_groups.manage_companies',
    name: 'Gestionar Empresas del Grupo',
    description: 'Permite gestionar empresas dentro del grupo corporativo',
    module: 'company_groups'
  },

  // ============================================================================
  // EMAIL SETTINGS MODULE
  // ============================================================================
  {
    key: 'email_settings.manage',
    name: 'Gestionar Configuración de Email',
    description: 'Permite gestionar configuraciones y plantillas de email de la empresa',
    module: 'email_settings'
  },

  // ============================================================================
  // FEATURES MODULE
  // ============================================================================
  {
    key: 'features.manage',
    name: 'Gestionar Features',
    description: 'Permite habilitar/deshabilitar features de la empresa',
    module: 'features'
  },

  // ============================================================================
  // ATTENDANCE MODULE
  // ============================================================================
  {
    key: 'attendance.view',
    name: 'Ver Asistencia Propia',
    description: 'Permite ver registro de asistencia propio',
    module: 'attendance'
  },
  {
    key: 'attendance.create',
    name: 'Marcar Asistencia',
    description: 'Permite marcar entrada/salida',
    module: 'attendance'
  },
  {
    key: 'attendance.update',
    name: 'Actualizar Asistencia',
    description: 'Permite modificar registros de asistencia',
    module: 'attendance'
  },
  {
    key: 'attendance.delete',
    name: 'Eliminar Asistencia',
    description: 'Permite eliminar registros de asistencia',
    module: 'attendance'
  },
  {
    key: 'attendance.view_all',
    name: 'Ver Toda la Asistencia',
    description: 'Permite ver asistencia de todos los usuarios del sistema',
    module: 'attendance'
  },
  {
    key: 'attendance.view_company',
    name: 'Ver Asistencia de la Empresa',
    description: 'Permite ver asistencia de usuarios de la empresa',
    module: 'attendance'
  },

  // ============================================================================
  // LOCATIONS MODULE
  // ============================================================================
  {
    key: 'locations.manage',
    name: 'Gestionar Ubicaciones',
    description: 'Permite crear, modificar y eliminar ubicaciones de la empresa',
    module: 'locations'
  },

  // ============================================================================
  // INVENTORY MODULE
  // ============================================================================
  {
    key: 'inventory.view_items',
    name: 'Ver Artículos de Inventario',
    description: 'Permite ver artículos del inventario',
    module: 'inventory'
  },
  {
    key: 'inventory.view_all',
    name: 'Ver Todo el Inventario',
    description: 'Permite ver inventario de todas las ubicaciones',
    module: 'inventory'
  },
  {
    key: 'inventory.create_item',
    name: 'Crear Artículos',
    description: 'Permite crear nuevos artículos en inventario',
    module: 'inventory'
  },
  {
    key: 'inventory.update_item',
    name: 'Actualizar Artículos',
    description: 'Permite modificar artículos existentes',
    module: 'inventory'
  },
  {
    key: 'inventory.delete_item',
    name: 'Eliminar Artículos',
    description: 'Permite eliminar artículos del inventario',
    module: 'inventory'
  },
  {
    key: 'inventory.view_stock',
    name: 'Ver Stock',
    description: 'Permite ver niveles de stock',
    module: 'inventory'
  },
  {
    key: 'inventory.adjust_stock',
    name: 'Ajustar Stock',
    description: 'Permite realizar ajustes de inventario',
    module: 'inventory'
  },
  {
    key: 'inventory.transfer',
    name: 'Transferir Inventario',
    description: 'Permite realizar transferencias entre ubicaciones',
    module: 'inventory'
  },
  {
    key: 'inventory.view_requests',
    name: 'Ver Solicitudes de Inventario',
    description: 'Permite ver solicitudes de repuestos',
    module: 'inventory'
  },
  {
    key: 'inventory.create_request',
    name: 'Crear Solicitudes de Inventario',
    description: 'Permite solicitar repuestos para órdenes de trabajo',
    module: 'inventory'
  },
  {
    key: 'inventory.approve_request',
    name: 'Aprobar Solicitudes',
    description: 'Permite aprobar solicitudes de inventario',
    module: 'inventory'
  },
  {
    key: 'inventory.reject_request',
    name: 'Rechazar Solicitudes',
    description: 'Permite rechazar solicitudes de inventario',
    module: 'inventory'
  },
  {
    key: 'inventory.deliver_request',
    name: 'Entregar Inventario',
    description: 'Permite entregar repuestos a técnicos',
    module: 'inventory'
  },
  {
    key: 'inventory.deliver_from_warehouse',
    name: 'Despachar desde Bodega',
    description: 'Permite despachar inventario desde bodega',
    module: 'inventory'
  },
  {
    key: 'inventory.confirm_receipt',
    name: 'Confirmar Recepción',
    description: 'Permite confirmar recepción de repuestos',
    module: 'inventory'
  },
  {
    key: 'inventory.delete_request',
    name: 'Eliminar Solicitudes',
    description: 'Permite eliminar solicitudes de inventario',
    module: 'inventory'
  },
  {
    key: 'inventory.view_movements',
    name: 'Ver Movimientos de Inventario',
    description: 'Permite ver historial de movimientos',
    module: 'inventory'
  }
];

async function main(): Promise<void> {
  console.log('🌱 Seeding permissions...');

  // Upsert permissions (insert or update if exists)
  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: {
        name: permission.name,
        description: permission.description,
        module: permission.module,
        isActive: true
      },
      create: permission
    });
  }

  console.log(`✅ Seeded ${PERMISSIONS.length} permissions`);

  // Count by module
  const modules = await prisma.permission.groupBy({
    by: ['module'],
    _count: true,
    orderBy: {
      _count: {
        module: 'desc'
      }
    }
  });

  console.log('\n📊 Permissions by module:');
  modules.forEach((mod) => {
    console.log(`   ${mod.module}: ${mod._count} permissions`);
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

/**
 * Seed de Roles Base del Sistema
 * Crea los 11 roles base que sustituyen al enum Role anterior
 * Cada rol tiene sus permisos e interfaceType predefinidos
 */

import { PrismaClient, InterfaceType } from '@prisma/client';

const prisma = new PrismaClient();

// Definición de roles base del sistema
interface SystemRole {
  key: string;
  name: string;
  description: string;
  interfaceType: InterfaceType;
  color: string;
  permissions: string[]; // Permission keys
}

const SYSTEM_ROLES: SystemRole[] = [
  {
    key: 'SUPER_ADMIN',
    name: 'Super Administrador',
    description: 'Acceso total al sistema',
    interfaceType: 'DASHBOARD',
    color: '#ef4444', // red
    permissions: ['*'] // Todos los permisos
  },
  {
    key: 'ADMIN_GRUPO',
    name: 'Administrador de Grupo',
    description: 'Administrador de grupo corporativo (ve todas las empresas del grupo)',
    interfaceType: 'BOTH',
    color: '#f97316', // orange
    permissions: [
      'dashboard.view_global',
      'alerts.create', 'alerts.update', 'alerts.delete', 'alerts.view_company', 'alerts.comment',
      'work_orders.create', 'work_orders.update', 'work_orders.delete', 'work_orders.view_all',
      'work_orders.view_assigned', 'work_orders.assign', 'work_orders.complete', 'work_orders.cancel',
      'work_orders.manage_templates', 'work_orders.manage_prefixes',
      'production_lines.create', 'production_lines.view', 'production_lines.update', 'production_lines.delete',
      'analytics.view',
      'users.create', 'users.update', 'users.delete', 'users.view_company', 'users.view',
      'custom_roles.create', 'custom_roles.view', 'custom_roles.update', 'custom_roles.delete',
      'client_companies.create', 'client_companies.update', 'client_companies.delete', 'client_companies.view',
      'sites.create', 'sites.update', 'sites.delete', 'sites.view',
      'company_groups.create', 'company_groups.update', 'company_groups.delete', 'company_groups.view', 'company_groups.manage_companies',
      'assets.create', 'assets.update', 'assets.delete', 'assets.view', 'assets.edit', 'assets.change_status', 'assets.view_status_history',
      'attendance.view_company', 'attendance.view', 'attendance.view_reports', 'attendance.create', 'attendance.update', 'attendance.delete',
      'locations.manage', 'locations.view',
      'inventory.view', 'inventory.view_items', 'inventory.view_all', 'inventory.create_item', 'inventory.update_item', 'inventory.delete_item',
      'inventory.view_stock', 'inventory.adjust_stock', 'inventory.transfer',
      'inventory.view_requests', 'inventory.create_request', 'inventory.approve_request', 'inventory.reject_request',
      'inventory.deliver_request', 'inventory.deliver_from_warehouse', 'inventory.confirm_receipt',
      'inventory.delete_request', 'inventory.view_movements'
    ]
  },
  {
    key: 'ADMIN_EMPRESA',
    name: 'Administrador de Empresa',
    description: 'Administrador de empresa individual',
    interfaceType: 'BOTH',
    color: '#f59e0b', // amber
    permissions: [
      'dashboard.view_global',
      'alerts.create', 'alerts.update', 'alerts.delete', 'alerts.view_company', 'alerts.comment',
      'work_orders.create', 'work_orders.update', 'work_orders.delete', 'work_orders.view_all',
      'work_orders.view_assigned', 'work_orders.assign', 'work_orders.complete', 'work_orders.cancel',
      'work_orders.manage_templates', 'work_orders.manage_prefixes',
      'production_lines.create', 'production_lines.view', 'production_lines.update', 'production_lines.delete',
      'analytics.view',
      'users.create', 'users.update', 'users.delete', 'users.view_company', 'users.view',
      'custom_roles.create', 'custom_roles.view', 'custom_roles.update', 'custom_roles.delete',
      'client_companies.create', 'client_companies.update', 'client_companies.delete', 'client_companies.view',
      'sites.create', 'sites.update', 'sites.delete', 'sites.view',
      'assets.create', 'assets.update', 'assets.delete', 'assets.view', 'assets.edit', 'assets.change_status', 'assets.view_status_history',
      'attendance.view_company', 'attendance.view', 'attendance.view_reports', 'attendance.create', 'attendance.update', 'attendance.delete',
      'locations.manage', 'locations.view',
      'inventory.view', 'inventory.view_items', 'inventory.view_all', 'inventory.create_item', 'inventory.update_item', 'inventory.delete_item',
      'inventory.view_stock', 'inventory.adjust_stock', 'inventory.transfer',
      'inventory.view_requests', 'inventory.create_request', 'inventory.approve_request', 'inventory.reject_request',
      'inventory.deliver_request', 'inventory.deliver_from_warehouse', 'inventory.confirm_receipt',
      'inventory.delete_request', 'inventory.view_movements'
    ]
  },
  {
    key: 'JEFE_MANTENIMIENTO',
    name: 'Jefe de Mantenimiento',
    description: 'Jefe de mantenimiento (aprueba solicitudes de inventario)',
    interfaceType: 'BOTH',
    color: '#eab308', // yellow
    permissions: [
      'dashboard.view_global',
      'alerts.create', 'alerts.update', 'alerts.delete', 'alerts.view_company', 'alerts.comment',
      'work_orders.create', 'work_orders.update', 'work_orders.delete', 'work_orders.view_all',
      'work_orders.assign', 'work_orders.complete', 'work_orders.cancel',
      'work_orders.manage_templates', 'work_orders.manage_prefixes',
      'analytics.view',
      'assets.view', 'assets.change_status', 'assets.view_status_history',
      'inventory.view_requests', 'inventory.approve_request', 'inventory.reject_request',
      'inventory.view_items', 'inventory.view_stock'
    ]
  },
  {
    key: 'ENCARGADO_BODEGA',
    name: 'Encargado de Bodega',
    description: 'Encargado de bodega (entrega repuestos)',
    interfaceType: 'BOTH',
    color: '#84cc16', // lime
    permissions: [
      'inventory.view_items', 'inventory.view_all', 'inventory.create_item', 'inventory.update_item', 'inventory.delete_item',
      'inventory.view_stock', 'inventory.adjust_stock', 'inventory.transfer',
      'inventory.view_requests', 'inventory.deliver_request', 'inventory.deliver_from_warehouse',
      'inventory.confirm_receipt', 'inventory.view_movements'
    ]
  },
  {
    key: 'SUPERVISOR',
    name: 'Supervisor',
    description: 'Supervisor de campo y oficina',
    interfaceType: 'BOTH',
    color: '#22c55e', // green
    permissions: [
      'alerts.create', 'alerts.update', 'alerts.view_company', 'alerts.comment',
      'work_orders.create', 'work_orders.update', 'work_orders.view_all',
      'work_orders.assign', 'work_orders.complete', 'work_orders.cancel',
      'analytics.view',
      'assets.view', 'assets.change_status', 'assets.view_status_history',
      'attendance.view_company', 'attendance.create', 'attendance.update',
      'inventory.view_requests', 'inventory.create_request', 'inventory.approve_request',
      'inventory.reject_request', 'inventory.confirm_receipt',
      'inventory.view_items', 'inventory.view_stock'
    ]
  },
  {
    key: 'TECNICO',
    name: 'Técnico',
    description: 'Técnico de campo',
    interfaceType: 'MOBILE',
    color: '#3b82f6', // blue
    permissions: [
      'alerts.create', 'alerts.update', 'alerts.view_assigned', 'alerts.comment',
      'work_orders.view_assigned', 'work_orders.update', 'work_orders.complete',
      'assets.view', 'assets.change_status', 'assets.view_status_history',
      'attendance.view', 'attendance.create',
      'inventory.view_requests', 'inventory.create_request', 'inventory.confirm_receipt',
      'inventory.view_items', 'inventory.view_stock'
    ]
  },
  {
    key: 'OPERARIO',
    name: 'Operario',
    description: 'Operario de planta que puede actualizar estado de activos/máquinas',
    interfaceType: 'MOBILE',
    color: '#6366f1', // indigo
    permissions: [
      'assets.view', 'assets.change_status', 'assets.view_status_history',
      'alerts.create', 'alerts.view_company', 'alerts.comment'
    ]
  },
  {
    key: 'CLIENTE_ADMIN_GENERAL',
    name: 'Cliente Admin General',
    description: 'Admin general que puede ver todas las sedes del cliente y generar alertas',
    interfaceType: 'DASHBOARD',
    color: '#8b5cf6', // violet
    permissions: [
      'dashboard.view_client',
      'alerts.create', 'alerts.update', 'alerts.view_client', 'alerts.comment',
      'users.view_client',
      'sites.view',
      'assets.create', 'assets.update', 'assets.delete', 'assets.view', 'assets.change_status', 'assets.view_status_history'
    ]
  },
  {
    key: 'CLIENTE_ADMIN_SEDE',
    name: 'Cliente Admin de Sede',
    description: 'Admin de sede específica que puede ver progreso de órdenes de su sede',
    interfaceType: 'DASHBOARD',
    color: '#a855f7', // purple
    permissions: [
      'dashboard.view_client',
      'alerts.create', 'alerts.update', 'alerts.view_site', 'alerts.comment',
      'sites.view',
      'assets.create', 'assets.update', 'assets.delete', 'assets.view', 'assets.change_status', 'assets.view_status_history'
    ]
  },
  {
    key: 'CLIENTE_OPERARIO',
    name: 'Cliente Operario',
    description: 'Operario que puede reportar errores/incidencias',
    interfaceType: 'MOBILE',
    color: '#d946ef', // fuchsia
    permissions: [
      'alerts.create', 'alerts.view_site', 'alerts.comment',
      'assets.view', 'assets.change_status', 'assets.view_status_history'
    ]
  }
];

async function main(): Promise<void> {
  console.log('🔐 Creando roles base del sistema...\n');

  // Obtener todos los permisos de la BD
  const allPermissions = await prisma.permission.findMany({
    select: { id: true, key: true }
  });
  const permissionMap = new Map(allPermissions.map(p => [p.key, p.id]));

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const roleData of SYSTEM_ROLES) {
    try {
      // Verificar si el rol ya existe
      const existing = await prisma.customRole.findUnique({
        where: { key: roleData.key }
      });

      let role;

      if (existing) {
        // Actualizar rol existente
        role = await prisma.customRole.update({
          where: { key: roleData.key },
          data: {
            name: roleData.name,
            description: roleData.description,
            interfaceType: roleData.interfaceType,
            color: roleData.color,
            isSystemRole: true,
            companyId: null,
            isActive: true
          }
        });
        updated++;
        console.log(`   ✏️  Actualizado: ${roleData.name} (${roleData.key})`);
      } else {
        // Crear nuevo rol
        role = await prisma.customRole.create({
          data: {
            key: roleData.key,
            name: roleData.name,
            description: roleData.description,
            interfaceType: roleData.interfaceType,
            color: roleData.color,
            isSystemRole: true,
            companyId: null,
            createdBy: null,
            isActive: true
          }
        });
        created++;
        console.log(`   ✅ Creado: ${roleData.name} (${roleData.key})`);
      }

      // Manejar permisos
      if (roleData.permissions.includes('*')) {
        // SUPER_ADMIN tiene todos los permisos - asignar todos
        await prisma.customRolePermission.deleteMany({
          where: { customRoleId: role.id }
        });

        const allPermissionIds = Array.from(permissionMap.values());
        await prisma.customRolePermission.createMany({
          data: allPermissionIds.map(permissionId => ({
            customRoleId: role.id,
            permissionId
          })),
          skipDuplicates: true
        });
        console.log(`      📋 Asignados todos los permisos (${allPermissionIds.length})`);
      } else {
        // Asignar permisos específicos
        await prisma.customRolePermission.deleteMany({
          where: { customRoleId: role.id }
        });

        const permissionIds: string[] = [];
        const missingPermissions: string[] = [];

        for (const permissionKey of roleData.permissions) {
          const permissionId = permissionMap.get(permissionKey);
          if (permissionId) {
            permissionIds.push(permissionId);
          } else {
            missingPermissions.push(permissionKey);
          }
        }

        if (permissionIds.length > 0) {
          await prisma.customRolePermission.createMany({
            data: permissionIds.map(permissionId => ({
              customRoleId: role.id,
              permissionId
            })),
            skipDuplicates: true
          });
        }

        console.log(`      📋 Asignados ${permissionIds.length}/${roleData.permissions.length} permisos`);
        if (missingPermissions.length > 0) {
          console.log(`      ⚠️  Permisos faltantes: ${missingPermissions.join(', ')}`);
        }
      }

    } catch (error) {
      console.error(`   ❌ Error en ${roleData.name}:`, error);
      errors++;
    }
  }

  // Resumen
  console.log('\n📊 Resumen:');
  console.log(`   Roles creados: ${created}`);
  console.log(`   Roles actualizados: ${updated}`);
  console.log(`   Errores: ${errors}`);

  if (errors > 0) {
    console.log('\n⚠️  Hubo errores al procesar algunos roles');
    process.exit(1);
  } else {
    console.log('\n🎉 Todos los roles base del sistema fueron configurados correctamente!');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

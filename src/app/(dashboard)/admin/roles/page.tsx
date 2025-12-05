"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { toast } from 'sonner';
import {
  TableActions,
  createEditAction,
  createDeleteAction
} from '@/components/common/table-actions';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { useTableData } from '@/components/hooks/use-table-data';
import { Users, ShieldCheck } from 'lucide-react';

interface CustomRole {
  id: string;
  name: string;
  description: string | null;
  color: string;
  _count: {
    users: number;
  };
  permissions: {
    id: string;
    permission: {
      id: string;
      key: string;
      name: string;
      module: string;
    };
  }[];
  createdAt: string;
}

export default function CustomRolesPage() {
  const router = useRouter();
  const { data: roles, loading, refetch } = useTableData<CustomRole>({
    endpoint: '/api/admin/custom-roles'
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    role: CustomRole | null;
  }>({
    open: false,
    role: null
  });

  const handleAddRole = () => {
    router.push('/admin/roles/new');
  };

  const handleEdit = (roleId: string) => {
    router.push(`/admin/roles/${roleId}/edit`);
  };

  const handleDelete = (role: CustomRole) => {
    setDeleteDialog({ open: true, role });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.role) return;

    try {
      const response = await fetch(`/api/admin/custom-roles/${deleteDialog.role.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Rol eliminado exitosamente');
        refetch();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al eliminar el rol');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Error al eliminar el rol');
    } finally {
      setDeleteDialog({ open: false, role: null });
    }
  };

  const columns: ColumnDef<CustomRole>[] = [
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: row.original.color }}
          />
          <div>
            <div className="font-medium">{row.original.name}</div>
            {row.original.description && (
              <div className="text-sm text-muted-foreground">
                {row.original.description}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'permissions',
      header: 'Permisos',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {row.original.permissions.length} {row.original.permissions.length === 1 ? 'permiso' : 'permisos'}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'users',
      header: 'Usuarios',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {row.original._count.users} {row.original._count.users === 1 ? 'usuario' : 'usuarios'}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Fecha de creación',
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        );
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <TableActions
          actions={[
            createEditAction(() => handleEdit(row.original.id)),
            createDeleteAction(() => handleDelete(row.original))
          ]}
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Roles Personalizados</h1>
        <p className="text-muted-foreground mt-2">
          Crea y gestiona roles personalizados para tu empresa (ej: Mecánico, Fontanero, Electricista)
        </p>
      </div>

      <DataTable
        columns={columns}
        data={roles}
        searchKey="name"
        searchPlaceholder="Buscar roles..."
        onAdd={handleAddRole}
        addLabel="Crear Rol"
        loading={loading}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, role: null })}
        onConfirm={confirmDelete}
        title="¿Eliminar rol?"
        description={
          deleteDialog.role
            ? `¿Estás seguro de que deseas eliminar el rol "${deleteDialog.role.name}"? Esta acción no se puede deshacer.`
            : ''
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
}

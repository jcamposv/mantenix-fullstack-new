"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CustomRoleForm } from '@/components/forms/custom-role-form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { CustomRoleFormData } from '@/schemas/custom-role';

interface CustomRole {
  id: string;
  name: string;
  description: string | null;
  color: string;
  interfaceType: 'MOBILE' | 'DASHBOARD' | 'BOTH';
  permissions: {
    permission: {
      id: string;
    };
  }[];
}

export default function EditCustomRolePage({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [role, setRole] = useState<CustomRole | null>(null);
  const [roleId, setRoleId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unwrapParams = async () => {
      const { id } = await params;
      setRoleId(id);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!roleId) return;

    const fetchRole = async () => {
      try {
        const response = await fetch(`/api/admin/custom-roles/${roleId}`);
        if (response.ok) {
          const data = await response.json();
          setRole(data);
        } else {
          toast.error('Error al cargar el rol');
          router.push('/admin/roles');
        }
      } catch (error) {
        console.error('Error fetching role:', error);
        toast.error('Error al cargar el rol');
        router.push('/admin/roles');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchRole();
  }, [roleId, router]);

  const handleSubmit = async (data: CustomRoleFormData) => {
    if (!roleId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/custom-roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Rol actualizado exitosamente');
        router.push('/admin/roles');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al actualizar el rol');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar el rol');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!role) {
    return null;
  }

  const defaultValues: CustomRoleFormData = {
    name: role.name,
    description: role.description || '',
    color: role.color,
    interfaceType: role.interfaceType || 'MOBILE',
    permissionIds: role.permissions.map((p) => p.permission.id)
  };

  return (
    <div className="container mx-auto py-0">
      <CustomRoleForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        defaultValues={defaultValues}
        mode="edit"
      />
    </div>
  );
}

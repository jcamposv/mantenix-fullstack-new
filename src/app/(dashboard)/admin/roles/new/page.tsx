"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomRoleForm } from '@/components/forms/custom-role-form';
import { toast } from 'sonner';
import type { CustomRoleFormData } from '@/schemas/custom-role';

export default function NewCustomRolePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: CustomRoleFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/custom-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        toast.success('Rol creado exitosamente');
        router.push('/admin/roles');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al crear el rol');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Error al crear el rol');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-0">
      <CustomRoleForm onSubmit={handleSubmit} onCancel={handleCancel} loading={loading} />
    </div>
  );
}

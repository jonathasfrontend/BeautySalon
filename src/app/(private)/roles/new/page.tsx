'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Permission } from '@/types';
import { roleService } from '@/services/role.service';
import { RoleForm } from '@/components/roles/RoleForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';

export default function NewRolePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has permission to create roles
    if (!user?.permissions?.includes('roles.create')) {
      router.push('/roles');
      return;
    }

    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const data = await roleService.getAllPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      await roleService.createRole(data);
      toast.success('Cargo criado com sucesso!');
      router.push('/roles');
    } catch (error: any) {
      console.error('Erro ao criar cargo:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar cargo');
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/roles');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className='flex items-center gap-4'>
          <Button variant="secondary" onClick={() => router.back()}>
            ← Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            Criar Novo Cargo
          </h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Configure um novo cargo e suas permissões
        </p>
      </div>

      {/* Form */}
      <RoleForm
        permissions={permissions}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}

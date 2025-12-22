'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateRoleData, UpdateRoleData } from '@/services/role.service';
import { Permission } from '@/types';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { PermissionSelector } from './PermissionSelector';
import { FilePlus, RotateCcw, X } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface RoleFormProps {
  initialData?: {
    name: string;
    description?: string;
    permissionIds: string[];
  };
  permissions: Permission[];
  onSubmit: (data: CreateRoleData | UpdateRoleData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  isSystemRole?: boolean;
}

export function RoleForm({
  initialData,
  permissions,
  onSubmit,
  onCancel,
  isEditing = false,
  isSystemRole = false,
}: RoleFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    initialData?.permissionIds || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  });

  const handleFormSubmit = async (formData: any) => {
    try {
      setLoading(true);

      const data: CreateRoleData | UpdateRoleData = {
        name: formData.name,
        description: formData.description,
        ...(isEditing ? {} : { permissionIds: selectedPermissionIds }),
      };

      await onSubmit(data);
    } catch (error: any) {
      console.error('Erro ao salvar cargo:', error);
      alert(error.response?.data?.message || 'Erro ao salvar cargo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Informações Básicas
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Cargo *</Label>
            <Input
              id="name"
              type="text"
              {...register('name', {
                required: 'Nome é obrigatório',
                minLength: {
                  value: 3,
                  message: 'Nome deve ter pelo menos 3 caracteres',
                },
              })}
              placeholder="Ex: Gerente de Vendas"
              disabled={isSystemRole}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.name.message}
              </p>
            )}
            {isSystemRole && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                ⚠️ Cargos do sistema não podem ter o nome alterado
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              {...register('description')}
              placeholder="Descreva as responsabilidades deste cargo..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 bg-muted "
            />
          </div>
        </div>
      </div>

      {/* Permissions */}
      {!isEditing && (
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <PermissionSelector
            permissions={permissions}
            selectedPermissionIds={selectedPermissionIds}
            onChange={setSelectedPermissionIds}
          />
          
          {selectedPermissionIds.length === 0 && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-4">
              ⚠️ Atenção: Nenhuma permissão foi selecionada. O cargo terá acesso limitado.
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          <X className="h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} variant="success">
          {loading ? <LoadingSpinner /> : isEditing ? <RotateCcw className="h-4 w-4" /> : <FilePlus className="h-4 w-4" />}
          {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Cargo'}
        </Button>
      </div>
    </form>
  );
}

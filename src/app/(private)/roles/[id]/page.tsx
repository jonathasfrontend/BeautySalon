'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Permission } from '@/types';
import { RoleWithPermissions, roleService, UpdateRoleData } from '@/services/role.service';
import { RoleForm } from '@/components/roles/RoleForm';
import { PermissionSelector } from '@/components/roles/PermissionSelector';
import { StaffRoleAssignment } from '@/components/roles/StaffRoleAssignment';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { Edit2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function RoleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const roleId = params.id as string;

  const [role, setRole] = useState<RoleWithPermissions | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'permissions' | 'assign'>('details');

  useEffect(() => {
    // Check if user has permission to view roles
    if (!user?.permissions?.includes('roles.read')) {
      router.push('/roles');
      return;
    }

    loadRole();
    loadAllPermissions();
  }, [roleId]);

  const loadRole = async () => {
    try {
      setLoading(true);
      const data = await roleService.getRoleById(roleId);
      setRole(data);

      // Load role permissions
      const permissions = await roleService.getRolePermissions(roleId);
      setSelectedPermissionIds(permissions.map(p => p.id));
    } catch (error) {
      console.error('Erro ao carregar cargo:', error);
      router.push('/roles');
    } finally {
      setLoading(false);
    }
  };

  const loadAllPermissions = async () => {
    try {
      const data = await roleService.getAllPermissions();
      setAllPermissions(data);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
    }
  };

  const handleUpdateRole = async (data: UpdateRoleData) => {
    try {
      await roleService.updateRole(roleId, data);
      toast.success('Cargo atualizado com sucesso!');
      setEditing(false);
      loadRole();
    } catch (error: any) {
      console.error('Erro ao atualizar cargo:', error);
      toast.error('Erro ao atualizar cargo');
      throw error;
    }
  };

  const handleSavePermissions = async () => {
    try {
      setSavingPermissions(true);
      await roleService.assignPermissions(roleId, {
        permissionIds: selectedPermissionIds,
      });
      toast.success('Permissões atualizadas com sucesso!');
      loadRole();
    } catch (error: any) {
      console.error('Erro ao atualizar permissões:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar permissões');
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleToggleActive = async () => {
    if (!role) return;

    if (!confirm(`Deseja ${role.isActive ? 'desativar' : 'ativar'} este cargo?`)) {
      return;
    }

    try {
      await roleService.updateRole(roleId, {
        isActive: !role.isActive,
      });
      toast.success(`Cargo ${role.isActive ? 'desativado' : 'ativado'} com sucesso!`);
      loadRole();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!role) {
    return null;
  }

  const canEdit = user?.permissions?.includes('roles.update');
  const canAssign = user?.permissions?.includes('roles.assign');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className='flex items-center gap-4'>
            <Button variant="secondary" onClick={() => router.back()}>
              ← Voltar
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              {role.name}
            </h1>
          </div>
          {role.description && (
            <p className="text-muted-foreground mt-1">
              {role.description}
            </p>
          )}
        </div>

        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            {canEdit && (
              <>
                <Button
                  variant="outline"
                  onClick={handleToggleActive}
                >
                  {role.isActive ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                  {role.isActive ? 'Desativar' : 'Ativar'}
                </Button>
                {!editing && (
                  <Button onClick={() => setEditing(true)} variant="gradient" >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-blue rounded-lg shadow-sm border border-border-blue p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400">Permissões</p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-1">
            {role.permissions?.length || 0}
          </p>
        </div>
        <div className="bg-bg-green rounded-lg shadow-sm border border-border-green p-4">
          <p className="text-sm text-green-600 dark:text-green-400">Usuários</p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-1">
            {role._count?.users || 0}
          </p>
        </div>
        <div className="bg-bg-purple rounded-lg shadow-sm border border-border-purple p-4">
          <p className="text-sm text-purple-600 dark:text-purple-400">Status</p>
          <p className="text-lg font-bold text-purple-700 dark:text-purple-300 mt-1">
            {role.isActive ? '✅ Ativo' : '❌ Inativo'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-1 border-b-2 cursor-pointer font-medium text-sm ${activeTab === 'details'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:border-primary-foreground'
              }`}
          >
            Detalhes
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-4 px-1 border-b-2 cursor-pointer font-medium text-sm ${activeTab === 'permissions'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:border-primary-foreground'
              }`}
          >
            Permissões ({role.permissions?.length || 0})
          </button>
          {canAssign && (
            <button
              onClick={() => setActiveTab('assign')}
              className={`py-4 px-1 border-b-2 cursor-pointer font-medium text-sm ${activeTab === 'assign'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-primary-foreground'
                }`}
            >
              Atribuir a Profissionais
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div>
          {editing ? (
            <RoleForm
              initialData={{
                name: role.name,
                description: role.description || '',
                permissionIds: selectedPermissionIds,
              }}
              permissions={allPermissions}
              onSubmit={handleUpdateRole}
              onCancel={() => setEditing(false)}
              isEditing={true}
              isSystemRole={role.isSystem}
            />
          ) : (
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Informações do Cargo
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Nome
                  </dt>
                  <dd className="mt-1 text-lg text-foreground">
                    {role.name}
                  </dd>
                </div>
                {role.description && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Descrição
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {role.description}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Tipo
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {role.isSystem ? 'Cargo do Sistema' : 'Cargo Personalizado'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Criado em
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {new Date(role.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <PermissionSelector
            permissions={allPermissions}
            selectedPermissionIds={selectedPermissionIds}
            onChange={setSelectedPermissionIds}
            disabled={!canEdit}
          />

          {canEdit && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => loadRole()}
                disabled={savingPermissions}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSavePermissions}
                disabled={savingPermissions}
              >
                {savingPermissions ? 'Salvando...' : 'Salvar Permissões'}
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'assign' && canAssign && (
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Atribuir Cargo a Profissionais
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Selecione um profissional para atribuir este cargo e suas permissões.
          </p>
          <StaffRoleAssignment roleId={roleId} onSuccess={loadRole} />
        </div>
      )}
    </div>
  );
}

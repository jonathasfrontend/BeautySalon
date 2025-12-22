'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleWithPermissions, roleService } from '@/services/role.service';
import { RoleCard } from '@/components/roles/RoleCard';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { CustomLink } from '@/components/ui/Link';

export default function RolesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    // Check if user has permission to access this page
    if (!user?.permissions?.includes('roles.read')) {
      router.push('/dashboard');
      return;
    }

    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await roleService.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Erro ao carregar cargos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, roleName: string) => {
    if (!confirm(`Deseja realmente excluir o cargo "${roleName}"?`)) {
      return;
    }

    try {
      await roleService.deleteRole(id);
      toast.success('Cargo excluído com sucesso!');
      loadRoles();
    } catch (error: any) {
      console.error('Erro ao excluir cargo:', error);
      toast.error(error.response?.data?.message || 'Erro ao excluir cargo');
    }
  };

  const filteredRoles = roles.filter(role => {
    if (filter === 'active') return role.isActive;
    if (filter === 'inactive') return !role.isActive;
    return true;
  });

  const stats = {
    total: roles.length,
    active: roles.filter(r => r.isActive).length,
    inactive: roles.filter(r => !r.isActive).length,
    system: roles.filter(r => r.isSystem).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Cargos e Permissões
          </h1>
          <p className="text-muted-foreground">
            Gerencie cargos e atribua permissões aos usuários
          </p>
        </div>
        {user?.permissions?.includes('roles.create') && (
          <CustomLink href="/roles/new" variant="gradient" size="default">
            + Novo Cargo
          </CustomLink>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <p className="text-sm text-muted-foreground">Total de Cargos</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {stats.total}
          </p>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-border-green p-4">
          <p className="text-sm text-green-600 dark:text-green-400">Ativos</p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-1">
            {stats.active}
          </p>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-border-red p-4">
          <p className="text-sm text-red-600 dark:text-red-400">Inativos</p>
          <p className="text-3xl font-bold text-red-700 dark:text-red-300 mt-1">
            {stats.inactive}
          </p>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-border-purple p-4">
          <p className="text-sm text-purple-600 dark:text-purple-400">Sistema</p>
          <p className="text-3xl font-bold text-purple-700 dark:text-purple-300 mt-1">
            {stats.system}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">
            Filtrar:
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/60'
                }`}
            >
              Todos ({stats.total})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'active'
                  ? 'bg-green-600 text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/60'
                }`}
            >
              Ativos ({stats.active})
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'inactive'
                  ? 'bg-red-600 text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/60'
                }`}
            >
              Inativos ({stats.inactive})
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Cargos */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onViewDetails={() => router.push(`/roles/${role.id}`)}
              onEdit={
                user?.permissions?.includes('roles.update')
                  ? () => router.push(`/roles/${role.id}`)
                  : undefined
              }
              onDelete={
                user?.permissions?.includes('roles.delete')
                  ? () => handleDelete(role.id, role.name)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {!loading && filteredRoles.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum cargo encontrado
          </p>
        </div>
      )}
    </div>
  );
}

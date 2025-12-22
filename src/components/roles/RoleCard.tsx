'use client';

import { RoleWithPermissions } from '@/services/role.service';
import { Badge } from '@/components/ui/Badge';
import { Button } from '../ui/Button';
import { CustomLink } from '../ui/Link';

interface RoleCardProps {
  role: RoleWithPermissions;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
}

export function RoleCard({ role, onEdit, onDelete, onViewDetails }: RoleCardProps) {
  const permissionCount = role.permissions?.length || 0;
  const userCount = role._count?.users || 0;

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground">
              {role.name}
            </h3>
            {role.isSystem && (
              <Badge variant="secondary">Sistema</Badge>
            )}
            {!role.isActive && (
              <Badge variant="destructive">Inativo</Badge>
            )}
          </div>
          {role.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {role.description}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-bg-blue rounded-lg p-3">
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
            Permissões
          </p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {permissionCount}
          </p>
        </div>
        <div className="bg-bg-green rounded-lg p-3">
          <p className="text-xs text-green-600 dark:text-green-400 mb-1">
            Usuários
          </p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {userCount}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {onViewDetails && (
          <CustomLink href={`/roles/${role.id}`} variant="secondary" size="default" className='flex-1'>
            Detalhes
          </CustomLink>
        )}

        {onDelete && !role.isSystem && (
          <Button
            variant="destructive"
            onClick={onDelete}
            size="default"
            disabled={userCount > 0} 
            title={userCount > 0 ? 'Não é possível excluir cargo com usuários atribuídos' : ''}
          >
            Excluir
          </Button>
        )}
      </div>
    </div>
  );
}

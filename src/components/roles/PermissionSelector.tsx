'use client';

import { useState, useEffect } from 'react';
import { Permission } from '@/types';
import { Checkbox } from '../ui/Checkbox';

interface PermissionSelectorProps {
  permissions: Permission[];
  selectedPermissionIds: string[];
  onChange: (permissionIds: string[]) => void;
  disabled?: boolean;
}

export function PermissionSelector({
  permissions,
  selectedPermissionIds,
  onChange,
  disabled = false,
}: PermissionSelectorProps) {
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Group permissions by module
    const grouped = permissions.reduce((acc, permission) => {
      const module = permission.module;
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);

    setGroupedPermissions(grouped);

    // Expand all modules by default
    setExpandedModules(new Set(Object.keys(grouped)));
  }, [permissions]);

  const handlePermissionToggle = (permissionId: string) => {
    if (disabled) return;

    const newSelected = selectedPermissionIds.includes(permissionId)
      ? selectedPermissionIds.filter(id => id !== permissionId)
      : [...selectedPermissionIds, permissionId];

    onChange(newSelected);
  };

  const handleModuleToggle = (module: string) => {
    const modulePermissions = groupedPermissions[module] || [];
    const modulePermissionIds = modulePermissions.map(p => p.id);
    const allSelected = modulePermissionIds.every(id => selectedPermissionIds.includes(id));

    if (allSelected) {
      // Deselect all module permissions
      onChange(selectedPermissionIds.filter(id => !modulePermissionIds.includes(id)));
    } else {
      // Select all module permissions
      const newSelected = [...new Set([...selectedPermissionIds, ...modulePermissionIds])];
      onChange(newSelected);
    }
  };

  const toggleModuleExpansion = (module: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const getModuleIcon = (module: string): string => {
    const icons: Record<string, string> = {
      clients: '👥',
      appointments: '📅',
      staff: '👔',
      services: '✨',
      products: '📦',
      sales: '🛒',
      payments: '💰',
      expenses: '💸',
      reports: '📊',
      roles: '🔐',
      reviews: '⭐',
      waitlist: '⏰',
    };
    return icons[module] || '📋';
  };

  const getModuleName = (module: string): string => {
    const names: Record<string, string> = {
      clients: 'Clientes',
      appointments: 'Agendamentos',
      staff: 'Profissionais',
      services: 'Serviços',
      products: 'Produtos',
      sales: 'Vendas',
      payments: 'Pagamentos',
      expenses: 'Despesas',
      reports: 'Relatórios',
      roles: 'Cargos e Permissões',
      reviews: 'Avaliações',
      waitlist: 'Lista de Espera',
    };
    return names[module] || module;
  };

  const getPermissionLabel = (permissionName: string): string => {
    const parts = permissionName.split('.');
    const action = parts[parts.length - 1];

    const labels: Record<string, string> = {
      read: 'Visualizar',
      create: 'Criar',
      update: 'Editar',
      delete: 'Excluir',
      assign: 'Atribuir',
    };

    return labels[action] || action;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Selecione as Permissões
        </h3>
        <p className="text-sm text-muted-foreground">
          {selectedPermissionIds.length} de {permissions.length} selecionadas
        </p>
      </div>

      {Object.entries(groupedPermissions).map(([module, modulePermissions]) => {
        const modulePermissionIds = modulePermissions.map(p => p.id);
        const selectedCount = modulePermissionIds.filter(id =>
          selectedPermissionIds.includes(id)
        ).length;
        const allSelected = selectedCount === modulePermissions.length;
        const someSelected = selectedCount > 0 && selectedCount < modulePermissions.length;
        const isExpanded = expandedModules.has(module);

        return (
          <div
            key={module}
            className="border border-border rounded-lg overflow-hidden"
          >
            {/* Module Header */}
            <div className="bg-muted p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleModuleExpansion(module)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <Checkbox
                      checked={allSelected}
                      ref={(input) => {
                        if (input instanceof HTMLInputElement) {
                          input.indeterminate = someSelected;
                        }
                      }}
                      onCheckedChange={() => {
                        handleModuleToggle(module);
                      }}
                      disabled={disabled}
                    />
                    <span className="text-2xl">{getModuleIcon(module)}</span>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {getModuleName(module)}
                      </span>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        ({selectedCount}/{modulePermissions.length})
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Module Permissions */}
            {isExpanded && (
              <div className="p-4 bg-background space-y-2">
                {modulePermissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedPermissionIds.includes(permission.id)}
                      onCheckedChange={() => {
                        handlePermissionToggle(permission.id);
                      }}
                      disabled={disabled}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {getPermissionLabel(permission.name)}
                      </div>
                      {permission.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {permission.description}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

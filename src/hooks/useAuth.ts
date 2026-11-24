import { useAuthStore } from '@/store/auth.store';

/**
 * Hook simplificado apenas para permissões
 * A proteção de rotas é feita pelo middleware.ts
 */

// Hook para verificar permissão específica do usuário
export function usePermission(permission: string | string[]) {
  const { hasPermission } = useAuthStore();
  return hasPermission(permission);
}

/**
 * Qualquer-permissão (OR) — complementa `usePermission` (que usa .every()).
 * Aceita curinga final: useAnyPermission('finance.*') true para QUALQUER
 * permissão iniciada em "finance." (regra da spec §10.1 para o item de menu).
 * `hasPermission` do store NÃO é alterado.
 */
export function useAnyPermission(permission: string | string[]): boolean {
  const permissions = useAuthStore((state) => state.permissions);
  if (!permissions || permissions.length === 0) return false;

  const required = Array.isArray(permission) ? permission : [permission];
  return permissions.some((held) =>
    required.some((want) =>
      want.endsWith('*') ? held.startsWith(want.slice(0, -1)) : held === want
    )
  );
}

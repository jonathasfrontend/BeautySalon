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

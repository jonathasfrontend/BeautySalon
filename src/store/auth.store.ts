import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  permissions: string[];
  setUser: (user: User & { permissions?: string[] }) => void;
  clearUser: () => void;
  hasPermission: (permission: string | string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],

      setUser: (user) => {
        set({
          user,
          permissions: user.permissions || [],
        });
      },

      clearUser: () => {
        set({
          user: null,
          permissions: [],
        });
      },

      hasPermission: (permission) => {
        const { permissions } = get();
        
        if (!permissions || permissions.length === 0) {
          return false;
        }

        const requiredPermissions = Array.isArray(permission) ? permission : [permission];
        return requiredPermissions.every((perm) => permissions.includes(perm));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Persiste apenas dados essenciais, otimizando hidratação
      partialize: (state) => ({ 
        user: state.user,
        permissions: state.permissions 
      }),
    }
  )
);
'use client';

import { ReactNode, useEffect } from 'react';
import SidebarComponent from '@/components/layout/SidebarComponent';
import Header from '@/components/layout/Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
// import { useAuthStore } from '@/store/auth.store';
// import { authService } from '@/services/auth.service';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // const { user, setUser } = useAuthStore();

  // // Carrega permissões do usuário na inicialização
  // useEffect(() => {
  //   const loadUserPermissions = async () => {
  //     if (!user || !user.permissions || user.permissions.length === 0) {
  //       try {
  //         const userWithPermissions = await authService.getCurrentUser();
  //         setUser(userWithPermissions);
  //       } catch (error) {
  //         console.error('Erro ao carregar permissões:', error);
  //       }
  //     }
  //   };

  //   loadUserPermissions();
  // }, [user, setUser]);

  return (
    <SidebarProvider >
      <SidebarComponent />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

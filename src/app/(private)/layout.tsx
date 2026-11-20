'use client';

import { ReactNode, Suspense, useEffect, useRef } from 'react';
import SidebarComponent from '@/components/layout/SidebarComponent';
import Header from '@/components/layout/Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const userId = useAuthStore((state) => state.user?.id);
  const setUser = useAuthStore((state) => state.setUser);
  const requestIdRef = useRef(0);

  // Permissões persistidas no localStorage envelhecem: se uma permissão nova
  // for concedida (ex.: clients.export) o usuário logado continua sem ela até
  // refazer login. Revalidar com /auth/me no mount e ao voltar para a aba.
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const refreshPermissions = async () => {
      // Só a resposta mais recente vale: requisições concorrentes podem
      // voltar fora de ordem e sobrescrever permissões novas com antigas.
      const requestId = ++requestIdRef.current;
      try {
        const freshUser = await authService.getCurrentUser();
        if (cancelled || requestId !== requestIdRef.current) return;
        if (freshUser?.permissions) {
          setUser(freshUser);
        }
      } catch {
        // silencioso: permissões stale não podem derrubar a navegação
      }
    };

    refreshPermissions();

    const onFocus = () => refreshPermissions();
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
    };
  }, [userId, setUser]);

  return (
    <SidebarProvider >
      <SidebarComponent />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {/* Suspense acima das páginas: páginas que leem ?search= via
              useSearchParams() exigem boundary para o prerender do Next. */}
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

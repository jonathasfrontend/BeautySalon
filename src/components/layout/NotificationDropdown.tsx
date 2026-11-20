'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { CustomLink } from '@/components/ui/Link';
import { notificationService } from '@/services/notification.service';
import type { NotificationItem } from '@/types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

const REQUEST_TIMEOUT_MS = 8000;

/** Rejeita após 8s e aborta a request (senão ela fica viva no socket). */
function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  controller: AbortController
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('timeout'));
    }, ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer)) as Promise<T>;
}

export default function NotificationDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  // Invalida contagens que estavam em voo durante uma mutação (evita badge obsoleto)
  const mutationEpochRef = useRef(0);
  // Descarta respostas de carga de lista obsoletas
  const listRequestIdRef = useRef(0);
  // Só a contagem mais recente aplica resultado (badge nunca volta ao passado)
  const countRequestIdRef = useRef(0);
  // Mutações rodam em série: markRead e markAllRead podem se sobrepor
  const mutationChainRef = useRef<Promise<void>>(Promise.resolve());
  // Guard de clique duplo em ref (o state fecha um valor velho no mesmo tick)
  const pendingIdsRef = useRef<Set<string>>(new Set());
  const markAllPendingRef = useRef(false);

  /**
   * Contagem autoritativa de não lidas. Só a requisição mais recente aplica,
   * e só se nenhuma mutação mudou o estado no meio do caminho (senão o badge
   * volta para um valor pré-commit).
   */
  const refreshCount = useCallback(async () => {
    const requestId = ++countRequestIdRef.current;
    const epoch = mutationEpochRef.current;
    const controller = new AbortController();

    try {
      const count = await withTimeout(
        notificationService.getUnreadCount(controller.signal),
        REQUEST_TIMEOUT_MS,
        controller
      );
      if (requestId !== countRequestIdRef.current) return;
      if (epoch !== mutationEpochRef.current) return;
      setUnread(count);
    } catch {
      // silencioso: poll não deve quebrar a UI
    }
  }, []);

  const loadList = useCallback(async () => {
    const requestId = ++listRequestIdRef.current;
    const controller = new AbortController();

    setLoading(true);
    setLoadError(false);

    // Lista e contagem são independentes: cada uma aplica o próprio
    // resultado assim que chega. A contagem (refreshCount) tem requestId e
    // timeout próprios — ela não segura nem esconde a lista.
    void withTimeout(
      notificationService.getNotifications(1, 15, controller.signal),
      REQUEST_TIMEOUT_MS,
      controller
    )
      .then((data) => {
        if (requestId !== listRequestIdRef.current) return;
        setItems(data.notifications);
        setLoading(false);
      })
      .catch(() => {
        if (requestId !== listRequestIdRef.current) return;
        setLoadError(true);
        setLoading(false);
      });

    void refreshCount();
  }, [refreshCount]);

  // Poll de unread-count a cada 30s com cleanup no unmount
  useEffect(() => {
    refreshCount();
    const interval = setInterval(refreshCount, 30000);
    return () => clearInterval(interval);
  }, [refreshCount]);

  // Abre → carrega lista
  useEffect(() => {
    if (open) loadList();
  }, [open, loadList]);

  // Fecha no click-outside
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  /** Serializa mutações: uma espera a anterior terminar (badge consistente). */
  const runMutation = useCallback((fn: () => Promise<void>): Promise<void> => {
    const next = mutationChainRef.current.then(fn, fn);
    mutationChainRef.current = next.catch(() => undefined);
    return next;
  }, []);

  const handleMarkRead = async (id: string) => {
    // Bloqueia clique duplo: duas requisições decrementariam o badge 2x
    if (pendingIdsRef.current.has(id)) return;

    pendingIdsRef.current.add(id);
    setPendingIds((prev) => [...prev, id]);

    await runMutation(async () => {
      let committed = false;
      try {
        await notificationService.markRead(id);
        setItems((prev) =>
          prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
        );
        // Epoch só avança DEPOIS do commit: contagem que começou antes da
        // mutação é pré-commit e não pode sobrescrever o badge novo.
        mutationEpochRef.current++;
        committed = true;
      } catch {
        toast.error('Não foi possível marcar a notificação como lida.');
      } finally {
        pendingIdsRef.current.delete(id);
        setPendingIds((prev) => prev.filter((pendingId) => pendingId !== id));
      }

      // Mutação confirmada: recontagem é dado auxiliar — falha aqui não
      // invalida a marcação nem deve virar toast de erro da ação.
      if (committed) await refreshCount();
    });
  };

  const handleMarkAllRead = async () => {
    if (markAllPendingRef.current) return;

    markAllPendingRef.current = true;

    await runMutation(async () => {
      let committed = false;
      try {
        await notificationService.markAllRead();
        setItems((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
        mutationEpochRef.current++;
        committed = true;
      } catch {
        toast.error('Não foi possível marcar todas as notificações como lidas.');
      } finally {
        markAllPendingRef.current = false;
      }

      if (committed) await refreshCount();
    });
  };

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-muted transition-colors relative"
        aria-label={unread > 0 ? `Notificações (${unread} não lidas)` : 'Notificações'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="w-7 h-7 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-medium text-foreground">Notificações</span>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                Carregando...
              </div>
            ) : loadError ? (
              <div className="px-4 py-6 text-sm text-muted-foreground text-center space-y-2">
                <p>Não foi possível carregar as notificações.</p>
                <button
                  onClick={loadList}
                  className="text-xs text-foreground underline underline-offset-2"
                >
                  Tentar novamente
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                Nenhuma notificação
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.readAt) void handleMarkRead(n.id);
                    if (n.link) {
                      router.push(n.link);
                      setOpen(false);
                    }
                  }}
                  disabled={pendingIds.includes(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-border last:border-0 transition-colors ${
                    n.readAt ? 'opacity-70' : 'bg-muted/40 hover:bg-muted'
                  } ${!pendingIds.includes(n.id) ? 'cursor-pointer' : 'cursor-default'} disabled:opacity-60`}
                >
                  <div className="flex items-start gap-2">
                    {!n.readAt && (
                      <span className="mt-1.5 w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-foreground break-words">{n.message}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p
                          className="text-xs text-muted-foreground"
                          suppressHydrationWarning
                        >
                          {timeAgo(n.createdAt)}
                        </p>
                        {n.link && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            Abrir destino
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-border text-center">
            <CustomLink
              href="/settings/notifications"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver todas
            </CustomLink>
          </div>
        </div>
      )}
    </div>
  );
}

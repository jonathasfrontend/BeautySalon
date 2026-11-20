'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { notificationService } from '@/services/notification.service';
import type { NotificationItem } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  CONFIRMATION: 'Agendamento',
  CANCELLATION: 'Cancelamento',
  NO_SHOW: 'Falta',
  REMINDER_24H: 'Lembrete 24h',
  REMINDER_1H: 'Lembrete 1h',
  PROMOTION: 'Promoção',
  BIRTHDAY: 'Aniversário',
  REACTIVATION: 'Reativação',
  NEW_USER: 'Novo usuário',
  NEW_STAFF: 'Novo profissional',
  NEW_PRODUCT: 'Novo produto',
  LOW_STOCK: 'Estoque baixo',
  PAYMENT_PENDING: 'Pagamento pendente',
  PAYMENT_PAID: 'Pagamento pago',
  APPOINTMENT_STARTING: 'Começando agora',
};

const COUNT_TIMEOUT_MS = 8000;

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

export default function SettingsNotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const limit = 20;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Só a carga mais recente aplica resultado (páginas clicadas em sequência).
  const loadRequestIdRef = useRef(0);
  // Só a contagem mais recente aplica resultado (badge nunca volta ao passado).
  const countRequestIdRef = useRef(0);
  // Avança só depois de mutação confirmada: invalida contagens em voo.
  const mutationEpochRef = useRef(0);
  // Mutações rodam em série: markRead e markAllRead podem se sobrepor.
  const mutationChainRef = useRef<Promise<void>>(Promise.resolve());
  // Guard de clique duplo em ref (o state fecha um valor velho no mesmo tick).
  const pendingIdsRef = useRef<Set<string>>(new Set());
  const markAllPendingRef = useRef(false);

  /**
   * Contagem autoritativa de não lidas. Só a requisição mais recente aplica,
   * e só se nenhuma mutação mudou o estado no meio do caminho (senão o badge
   * volta para um valor pré-commit).
   */
  const refreshUnread = useCallback(async () => {
    const requestId = ++countRequestIdRef.current;
    const epoch = mutationEpochRef.current;
    const controller = new AbortController();

    try {
      const count = await withTimeout(
        notificationService.getUnreadCount(controller.signal),
        COUNT_TIMEOUT_MS,
        controller
      );
      if (requestId !== countRequestIdRef.current) return;
      if (epoch !== mutationEpochRef.current) return;
      setUnread(count);
    } catch {
      console.warn('Não foi possível atualizar a contagem de não lidas.');
    }
  }, []);

  const load = useCallback(async (p: number) => {
    const loadId = ++loadRequestIdRef.current;

    setLoading(true);
    setLoadError(false);

    // Lista e contagem são independentes: cada uma aplica o próprio
    // resultado assim que chega. A contagem não segura a lista, e a lista
    // não descarta a contagem.
    void notificationService
      .getNotifications(p, limit)
      .then((data) => {
        if (loadId !== loadRequestIdRef.current) return;
        setItems(data.notifications);
        setTotal(data.total);
        setPage(data.page);
        setLoading(false);
      })
      .catch((error) => {
        if (loadId !== loadRequestIdRef.current) return;
        console.error('Erro ao carregar notificações:', error);
        setLoadError(true);
        setLoading(false);
      });

    void refreshUnread();
  }, [refreshUnread]);

  useEffect(() => {
    load(1);
  }, [load]);

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
        // Epoch só avança DEPOIS do commit: contagem em voo é pré-commit.
        mutationEpochRef.current++;
        committed = true;
      } catch (error) {
        console.error('Erro ao marcar notificação:', error);
        toast.error('Não foi possível marcar a notificação como lida.');
      } finally {
        pendingIdsRef.current.delete(id);
        setPendingIds((prev) => prev.filter((pendingId) => pendingId !== id));
      }

      // Mutação confirmada: recontagem é dado auxiliar — falha aqui não
      // invalida a marcação nem deve virar toast de erro da ação.
      if (committed) await refreshUnread();
    });
  };

  /**
   * Clique na notificação com `link`: marca como lida (se ainda não lida)
   * e navega para o destino. Sem `link`, o item só marca como lida.
   */
  const handleOpenNotification = async (n: NotificationItem) => {
    if (!n.readAt) void handleMarkRead(n.id);
    if (n.link) router.push(n.link);
  };

  const handleMarkAllRead = async () => {
    if (markAllPendingRef.current) return;

    markAllPendingRef.current = true;
    setActionLoading(true);

    await runMutation(async () => {
      let committed = false;
      try {
        await notificationService.markAllRead();
        setItems((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
        mutationEpochRef.current++;
        committed = true;
      } catch (error) {
        console.error('Erro ao marcar todas:', error);
        toast.error('Não foi possível marcar todas as notificações como lidas.');
      } finally {
        markAllPendingRef.current = false;
        setActionLoading(false);
      }

      if (committed) {
        await refreshUnread();
        toast.success('Todas as notificações foram marcadas como lidas.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => router.back()}>
            ← Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Notificações</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          {total} notificaç{total !== 1 ? 'ões' : 'ão'} no total
          {unread > 0 && ` · ${unread} não lida${unread !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground">Histórico</h2>
          {unread > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllRead}
              disabled={actionLoading}
            >
              {actionLoading ? 'Marcando...' : 'Marcar todas como lidas'}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner />
          </div>
        ) : loadError ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar as notificações. Verifique a conexão com a API.
            </p>
            <Button variant="outline" onClick={() => load(page)}>
              Tentar novamente
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma notificação ainda.
          </p>
        ) : (
          <div className="space-y-1">
            {items.map((n) => (
              <div
                key={n.id}
                className={`flex items-start justify-between gap-4 p-3 rounded-lg border border-border ${
                  n.readAt ? '' : 'bg-muted/40'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {!n.readAt && (
                    <span className="mt-1.5 w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                  )}
                  <div className="min-w-0">
                    {n.link ? (
                      <button
                        type="button"
                        onClick={() => void handleOpenNotification(n)}
                        className="text-left text-sm text-foreground break-words hover:underline underline-offset-2 inline-flex items-start gap-1"
                      >
                        <span>{n.message}</span>
                        <ExternalLink
                          className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </button>
                    ) : (
                      // Sem link: o clique marca como lida (mesma ação do item com link)
                      <button
                        type="button"
                        onClick={() => void handleOpenNotification(n)}
                        className="text-left text-sm text-foreground break-words hover:underline underline-offset-2"
                      >
                        {n.message}
                      </button>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {TYPE_LABELS[n.type] || n.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                {!n.readAt && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    disabled={pendingIds.includes(n.id)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {pendingIds.includes(n.id) ? 'Marcando...' : 'Marcar como lida'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
            <Button
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => load(page - 1)}
            >
              ← Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages || loading}
              onClick={() => load(page + 1)}
            >
              Próxima →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

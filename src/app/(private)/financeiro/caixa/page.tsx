'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  History,
  Minus,
  Plus,
  Wallet,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import {
  useCashRegisters,
  useCurrentCashSession,
  useCashSessionById,
  useFinanceSettings,
} from '@/hooks/useFinance';
import { financeService } from '@/services/finance.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { MoneyText } from '@/components/finance/common/MoneyText';
import { ErrorState } from '@/components/finance/common/ErrorState';
import { EmptyState } from '@/components/finance/common/EmptyState';
import { TableSkeleton } from '@/components/finance/common/TableSkeleton';
import { MovementFormModal } from '@/components/finance/cash/MovementFormModal';
import { CloseCashModal } from '@/components/finance/cash/CloseCashModal';
import { MovementsTable } from '@/components/finance/cash/MovementsTable';
import { errorMessage, isNotFound } from '@/lib/error';
import { formatDateTime, num, parseMoneyInput } from '@/lib/money';
import type { CashMovementType } from '@/types/finance';

type MovementAction = 'SUPPLY' | 'WITHDRAWAL' | 'EXPENSE';

const ACTION_CONFIG: Record<
  MovementAction,
  { label: string; Icon: typeof Plus; variant: 'outline' | 'secondary' }
> = {
  SUPPLY: { label: 'Suprimento', Icon: Plus, variant: 'outline' },
  WITHDRAWAL: { label: 'Sangria', Icon: Minus, variant: 'outline' },
  EXPENSE: { label: 'Despesa', Icon: ArrowUpRight, variant: 'outline' },
};

export default function CaixaPage() {
  const router = useRouter();
  const permissions = useAuthStore((state) => state.permissions);
  const canOperate = permissions.includes('finance.cash.operate');
  const canViewAll = permissions.includes('finance.cash.view-all');
  const canManage = permissions.includes('finance.catalog.manage');
  const allowed = canOperate || canViewAll;

  const { items: registers, isLoading: registersLoading, refresh: refreshRegisters } =
    useCashRegisters();
  const [selectedRegisterId, setSelectedRegisterId] = useState<string | null>(null);

  const activeRegisters = useMemo(
    () => registers.filter((register) => register.isActive),
    [registers]
  );

  useEffect(() => {
    if (!allowed) {
      router.push('/dashboard');
      return;
    }
    if (!selectedRegisterId && activeRegisters.length > 0) {
      setSelectedRegisterId(activeRegisters[0].id);
    }
  }, [allowed, activeRegisters, selectedRegisterId, router]);

  const current = useCurrentCashSession(selectedRegisterId);
  const sessionId = current.data?.id ?? null;
  const detail = useCashSessionById(sessionId);
  const { data: settings } = useFinanceSettings();

  const [showOpenForm, setShowOpenForm] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('0,00');
  const [opening, setOpening] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [creatingRegister, setCreatingRegister] = useState(false);

  const [movementType, setMovementType] = useState<CashMovementType | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const session = detail.data ?? current.data;
  const movements = detail.data?.movements ?? [];
  const totals = detail.data?.totals;

  const noOpenSession =
    current.error !== undefined && isNotFound(current.error) && !current.data;

  // Atalhos N/F quando nenhum input está focado (spec §10.3)
  const handleShortcut = useCallback(
    (event: KeyboardEvent) => {
      if (!canOperate || !session || session.status !== 'OPEN') return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable)
        return;
      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault();
        setMovementType('SUPPLY');
      } else if (event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        setShowCloseModal(true);
      }
    },
    [canOperate, session]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [handleShortcut]);

  const handleOpenSession = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedRegisterId) return;
    const cents = parseMoneyInput(openingBalance);
    if (cents < 0) {
      toast.error('Troco inicial não pode ser negativo');
      return;
    }
    setOpening(true);
    try {
      await financeService.openSession({
        registerId: selectedRegisterId,
        openingBalance: cents / 100,
      });
      toast.success('Caixa aberto');
      setOpeningBalance('0,00');
      setShowOpenForm(false);
      await current.refresh();
    } catch (error) {
      toast.error(errorMessage(error, 'Erro ao abrir o caixa'));
    } finally {
      setOpening(false);
    }
  };

  const handleCreateRegister = async (event: FormEvent) => {
    event.preventDefault();
    if (!registerName.trim()) return;
    setCreatingRegister(true);
    try {
      await financeService.createRegister({ name: registerName.trim() });
      toast.success('Caixa criado');
      setRegisterName('');
      await refreshRegisters();
    } catch (error) {
      toast.error(errorMessage(error, 'Erro ao criar caixa'));
    } finally {
      setCreatingRegister(false);
    }
  };

  if (!allowed) return null;

  // -----------------------------------------------------------------------
  // Sem caixas registradores cadastrados
  // -----------------------------------------------------------------------
  if (!registersLoading && registers.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border">
        <EmptyState
          Icon={Banknote}
          title="Nenhum caixa registrado"
          description={
            canManage
              ? 'Crie o primeiro caixa (ex.: Recepção) para começar a operar.'
              : 'Peça a um administrador para cadastrar um caixa.'
          }
          action={
            canManage ? (
              <form onSubmit={handleCreateRegister} className="flex gap-2">
                <Input
                  value={registerName}
                  onChange={(event) => setRegisterName(event.target.value)}
                  placeholder="Nome do caixa (ex.: Recepção)"
                  maxLength={120}
                  aria-label="Nome do caixa"
                />
                <Button type="submit" size="sm" disabled={creatingRegister}>
                  {creatingRegister ? 'Criando...' : 'Criar caixa'}
                </Button>
              </form>
            ) : undefined
          }
        />
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Sessão aberta
  // -----------------------------------------------------------------------
  const isOpen = session?.status === 'OPEN';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Wallet className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Caixa</h2>
            <p className="text-sm text-muted-foreground">
              {isOpen && session
                ? `Aberto desde ${formatDateTime(session.openedAt)}${
                    session.openedBy ? ` · ${session.openedBy.name}` : ''
                  }`
                : 'Nenhuma sessão aberta'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <label htmlFor="register-select" className="sr-only">
            Caixa registrador
          </label>
          <select
            id="register-select"
            value={selectedRegisterId ?? ''}
            onChange={(event) => setSelectedRegisterId(event.target.value || null)}
            className="h-10 rounded-md border border-input bg-muted px-3 text-sm text-foreground"
          >
            {activeRegisters.map((register) => (
              <option key={register.id} value={register.id}>
                {register.name}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={() => router.push('/financeiro/caixa/historico')}>
            <History className="h-4 w-4" />
            Histórico
          </Button>
        </div>
      </div>

      {registersLoading && !session && <TableSkeleton rows={3} cols={4} />}

      {current.error && !isNotFound(current.error) && (
        <div className="bg-card rounded-lg border border-border">
          <ErrorState
            message={errorMessage(current.error, 'Erro ao carregar o caixa')}
            onRetry={() => current.refresh()}
          />
        </div>
      )}

      {!selectedRegisterId && !registersLoading && registers.length > 0 && (
        <div className="bg-card rounded-lg border border-border">
          <EmptyState
            Icon={Banknote}
            title="Selecione um caixa"
            description="Escolha o caixa registrador no seletor acima."
          />
        </div>
      )}

      {/* ---------------------------------------------------------------
          FECHADO — formulário de abertura
      --------------------------------------------------------------- */}
      {selectedRegisterId && noOpenSession && !showOpenForm && (
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 font-medium text-foreground">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full bg-slate-400"
                  aria-hidden="true"
                />
                Fechado
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Últimas sessões estão no histórico.
              </p>
            </div>
            {canOperate && (
              <Button size="sm" onClick={() => setShowOpenForm(true)}>
                <Plus className="h-4 w-4" />
                Abrir caixa
              </Button>
            )}
          </div>
        </div>
      )}

      {selectedRegisterId && noOpenSession && showOpenForm && canOperate && (
        <form
          onSubmit={handleOpenSession}
          className="bg-card rounded-lg border border-border p-6 space-y-4"
        >
          <h3 className="font-semibold text-foreground">Abrir caixa</h3>
          <div className="max-w-xs space-y-2">
            <Label htmlFor="opening-balance">Troco inicial (R$)</Label>
            <Input
              id="opening-balance"
              value={openingBalance}
              onChange={(event) => setOpeningBalance(event.target.value)}
              inputMode="decimal"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={opening}>
              {opening ? 'Abrindo...' : 'Abrir caixa'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowOpenForm(false)}
              disabled={opening}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* ---------------------------------------------------------------
          ABERTO — totais, ações e movimentos
      --------------------------------------------------------------- */}
      {session && isOpen && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-sm text-muted-foreground">Entradas</p>
              <p className="mt-1 text-xl font-bold">
                <MoneyText value={(totals?.totalIn ?? 0) / 100} colored />
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-sm text-muted-foreground">Saídas</p>
              <p className="mt-1 text-xl font-bold">
                <MoneyText value={-(totals?.totalOut ?? 0) / 100} colored />
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-sm text-muted-foreground">Esperado em caixa</p>
              <p className="mt-1 text-xl font-bold">
                <MoneyText value={(totals?.expected ?? 0) / 100} />
              </p>
            </div>
          </div>

          {canOperate && (
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ACTION_CONFIG) as MovementAction[]).map((action) => {
                const config = ACTION_CONFIG[action];
                return (
                  <Button
                    key={action}
                    variant={config.variant}
                    size="sm"
                    onClick={() => setMovementType(action)}
                  >
                    <config.Icon className="h-4 w-4" />
                    {config.label}
                  </Button>
                );
              })}
              <div className="ml-auto">
                <Button size="sm" onClick={() => setShowCloseModal(true)}>
                  Fechar caixa
                </Button>
              </div>
            </div>
          )}

          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border font-medium text-foreground">
              Movimentos da sessão
            </div>
            {detail.isLoading ? (
              <TableSkeleton rows={4} cols={5} />
            ) : detail.error ? (
              <ErrorState
                message={errorMessage(detail.error, 'Erro ao carregar movimentos')}
                onRetry={() => detail.refresh()}
              />
            ) : (
              <MovementsTable session={session} movements={movements} canOperate={canOperate} />
            )}
          </div>
        </>
      )}

      {movementType && sessionId && (
        <MovementFormModal
          open
          sessionId={sessionId}
          defaultType={movementType}
          onClose={() => setMovementType(null)}
          onDone={() => detail.refresh()}
        />
      )}

      {showCloseModal && session && (
        <CloseCashModal
          open
          session={session}
          settings={settings}
          onClose={() => setShowCloseModal(false)}
          onClosed={() => {
            detail.refresh();
            current.refresh();
          }}
        />
      )}
    </div>
  );
}

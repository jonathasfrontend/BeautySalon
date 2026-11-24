'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Landmark, Pencil, Plus, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useBankAccounts } from '@/hooks/useFinance';
import { financeService } from '@/services/finance.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { MoneyText } from '@/components/finance/common/MoneyText';
import { EmptyState } from '@/components/finance/common/EmptyState';
import { ErrorState } from '@/components/finance/common/ErrorState';
import { TableSkeleton } from '@/components/finance/common/TableSkeleton';
import { ConfirmDialog } from '@/components/finance/common/ConfirmDialog';
import { errorMessage } from '@/lib/error';
import { num, parseMoneyInput, toDateInput } from '@/lib/money';
import type { BankAccount, BankAccountType } from '@/types/finance';

const TYPE_LABELS: Record<BankAccountType, string> = {
  CHECKING: 'Corrente',
  SAVINGS: 'Poupança',
  PAYMENT_ACCOUNT: 'Conta de pagamento',
};

interface BalanceRow {
  id: string;
  balance: number;
  loading: boolean;
}

export default function ContasBancariasPage() {
  const router = useRouter();
  const permissions = useAuthStore((state) => state.permissions);
  const canManage = permissions.includes('finance.catalog.manage');

  const { items, isLoading, error, refresh } = useBankAccounts();

  const [balances, setBalances] = useState<BalanceRow[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [name, setName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [agency, setAgency] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [type, setType] = useState<BankAccountType>('CHECKING');
  const [initialBalance, setInitialBalance] = useState('0,00');
  const [initialBalanceDate, setInitialBalanceDate] = useState('');
  const [color, setColor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState<BankAccount | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!canManage) router.push('/financeiro');
  }, [canManage, router]);

  // Saldo calculado por conta (async, um a um — GET /balance/:id)
  useEffect(() => {
    let cancelled = false;
    if (items.length === 0) return;
    setBalances(items.map((account) => ({ id: account.id, balance: 0, loading: true })));
    Promise.all(
      items.map(async (account) => {
        try {
          const data = await financeService.getBankAccountBalance(account.id);
          return { id: account.id, balance: num(data.balance), loading: false };
        } catch {
          return { id: account.id, balance: NaN, loading: false };
        }
      })
    ).then((rows) => {
      if (!cancelled) setBalances(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [items]);

  if (!canManage) return null;

  const openCreate = () => {
    setEditing(null);
    setName('');
    setBankCode('');
    setBankName('');
    setAgency('');
    setAccountNumber('');
    setType('CHECKING');
    setInitialBalance('0,00');
    setInitialBalanceDate(toDateInput(new Date().toISOString()));
    setColor('');
    setServerError(null);
    setFormOpen(true);
  };

  const openEdit = (account: BankAccount) => {
    setEditing(account);
    setName(account.name);
    setBankCode(account.bankCode ?? '');
    setBankName(account.bankName ?? '');
    setAgency(account.agency ?? '');
    setAccountNumber(account.accountNumber ?? '');
    setType(account.type);
    setInitialBalance(String(num(account.initialBalance)).replace('.', ','));
    setInitialBalanceDate(toDateInput(account.initialBalanceDate));
    setColor(account.color ?? '');
    setServerError(null);
    setFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setServerError(null);
    if (!name.trim()) {
      toast.error('Informe o nome da conta');
      return;
    }
    if (!initialBalanceDate) {
      toast.error('Informe a data do saldo inicial');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        bankCode: bankCode.trim() || null,
        bankName: bankName.trim() || null,
        agency: agency.trim() || null,
        accountNumber: accountNumber.trim() || null,
        type,
        initialBalance: parseMoneyInput(initialBalance) / 100,
        initialBalanceDate: new Date(`${initialBalanceDate}T12:00:00`).toISOString(),
        color: color.trim() || null,
      };
      if (editing) {
        await financeService.updateBankAccount(editing.id, payload);
        toast.success('Conta atualizada');
      } else {
        await financeService.createBankAccount(payload);
        toast.success('Conta criada');
      }
      setFormOpen(false);
      await refresh();
    } catch (err) {
      setServerError(errorMessage(err, 'Erro ao salvar conta'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (account: BankAccount) => {
    setActionId(account.id);
    setActionError(null);
    try {
      await financeService.updateBankAccount(account.id, { isActive: !account.isActive });
      toast.success(account.isActive ? 'Conta desativada' : 'Conta reativada');
      await refresh();
      setDeactivating(null);
    } catch (err) {
      setActionError(errorMessage(err, 'Erro ao atualizar conta'));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/financeiro/cadastros')}
            aria-label="Voltar para cadastros"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="rounded-lg bg-primary/10 p-2">
            <Landmark className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Contas bancárias</h2>
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? 'conta' : 'contas'} cadastrada
              {items.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nova conta
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading && items.length === 0 ? (
          <TableSkeleton rows={4} cols={5} />
        ) : error ? (
          <ErrorState
            message={errorMessage(error, 'Erro ao carregar contas bancárias')}
            onRetry={() => refresh()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            Icon={Landmark}
            title="Nenhuma conta bancária"
            description="Cadastre contas para acompanhar saldos e conciliar extratos (Fase 2)."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Nova conta
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Conta</th>
                  <th className="text-left font-medium px-4 py-3">Agência / Número</th>
                  <th className="text-left font-medium px-4 py-3">Tipo</th>
                  <th className="text-right font-medium px-4 py-3">Saldo atual</th>
                  <th className="text-center font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((account) => {
                  const row = balances.find((item) => item.id === account.id);
                  return (
                    <tr key={account.id} className="text-foreground">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 font-medium">
                          <span
                            className="inline-block h-3 w-3 rounded-full border border-border"
                            style={{ backgroundColor: account.color ?? '#94a3b8' }}
                            aria-hidden="true"
                          />
                          {account.name}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {account.bankName ?? account.bankCode ?? '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {account.agency ?? '—'} / {account.accountNumber ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {TYPE_LABELS[account.type]}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {row?.loading ? (
                          <RefreshCw className="ml-auto h-4 w-4 animate-spin text-muted-foreground" aria-label="Carregando saldo" />
                        ) : row && Number.isNaN(row.balance) ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <MoneyText value={row?.balance ?? 0} />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {account.isActive ? (
                          <Badge variant="success">Ativa</Badge>
                        ) : (
                          <Badge variant="outline">Inativa</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(account)}
                            aria-label={`Editar ${account.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeactivating(account)}
                            aria-label={`${account.isActive ? 'Desativar' : 'Reativar'} ${account.name}`}
                          >
                            {account.isActive ? 'Desativar' : 'Reativar'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Saldo atual = saldo inicial + lançamentos conciliados. A conciliação com extrato chega na
        Fase 2 (importação OFX).
      </p>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar conta bancária' : 'Nova conta bancária'}
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bank-name">Nome da conta *</Label>
              <Input
                id="bank-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Itaú Corrente"
                maxLength={120}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-type">Tipo</Label>
              <select
                id="bank-type"
                value={type}
                onChange={(event) => setType(event.target.value as BankAccountType)}
                className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground"
              >
                {(Object.keys(TYPE_LABELS) as BankAccountType[]).map((item) => (
                  <option key={item} value={item}>
                    {TYPE_LABELS[item]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-bank-name">Banco</Label>
              <Input
                id="bank-bank-name"
                value={bankName}
                onChange={(event) => setBankName(event.target.value)}
                placeholder="Ex.: Itaú Unibanco"
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-code">Código do banco</Label>
              <Input
                id="bank-code"
                value={bankCode}
                onChange={(event) => setBankCode(event.target.value)}
                placeholder="Ex.: 341"
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-agency">Agência</Label>
              <Input id="bank-agency" value={agency} onChange={(event) => setAgency(event.target.value)} maxLength={20} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-account">Número da conta</Label>
              <Input
                id="bank-account"
                value={accountNumber}
                onChange={(event) => setAccountNumber(event.target.value)}
                maxLength={30}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-initial">Saldo inicial (R$) *</Label>
              <Input
                id="bank-initial"
                value={initialBalance}
                onChange={(event) => setInitialBalance(event.target.value)}
                inputMode="decimal"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-initial-date">Data do saldo inicial *</Label>
              <Input
                id="bank-initial-date"
                type="date"
                value={initialBalanceDate}
                onChange={(event) => setInitialBalanceDate(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-color">Cor</Label>
              <Input
                id="bank-color"
                type="color"
                value={color || '#64748b'}
                onChange={(event) => setColor(event.target.value)}
                className="h-10 w-full cursor-pointer"
              />
            </div>
          </div>
          {serverError && (
            <p role="alert" className="text-sm text-destructive">
              {serverError}
            </p>
          )}
          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </form>
      </Modal>

      <ConfirmDialog
        open={deactivating !== null}
        title={deactivating?.isActive ? 'Desativar conta' : 'Reativar conta'}
        message={
          <>
            {deactivating?.isActive ? (
              <>
                A conta <strong>{deactivating?.name}</strong> será desativada: sai das opções de
                pagamento, mas o histórico permanece.
              </>
            ) : (
              <>
                A conta <strong>{deactivating?.name}</strong> voltará a aparecer nas opções de
                pagamento.
              </>
            )}
          </>
        }
        destructive={Boolean(deactivating?.isActive)}
        confirmLabel={deactivating?.isActive ? 'Desativar' : 'Reativar'}
        loading={actionId !== null}
        error={actionError}
        onConfirm={() => deactivating && handleToggle(deactivating)}
        onCancel={() => setDeactivating(null)}
      />
    </div>
  );
}

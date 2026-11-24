'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, CreditCard, Pencil, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useAcquirers, useBankAccounts } from '@/hooks/useFinance';
import { financeService } from '@/services/finance.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/finance/common/EmptyState';
import { ErrorState } from '@/components/finance/common/ErrorState';
import { TableSkeleton } from '@/components/finance/common/TableSkeleton';
import { ConfirmDialog } from '@/components/finance/common/ConfirmDialog';
import { errorMessage } from '@/lib/error';
import { num } from '@/lib/money';
import type { Acquirer } from '@/types/finance';

/** Taxas são PORCENTAGEM (1.99 = 1,99%) — spec:557. */
const pct = (value: number | string | null | undefined): string =>
  value == null ? '—' : `${num(value).toLocaleString('pt-BR', { maximumFractionDigits: 4 })}%`;

export default function MaquininhasPage() {
  const router = useRouter();
  const permissions = useAuthStore((state) => state.permissions);
  const canManage = permissions.includes('finance.catalog.manage');

  const { items, isLoading, error, refresh } = useAcquirers();
  const { items: bankAccounts } = useBankAccounts();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Acquirer | null>(null);
  const [name, setName] = useState('');
  const [bankKeywords, setBankKeywords] = useState('');
  const [debitRate, setDebitRate] = useState('');
  const [creditRate, setCreditRate] = useState('');
  const [settlementDaysDebit, setSettlementDaysDebit] = useState('0');
  const [settlementDaysCredit, setSettlementDaysCredit] = useState('0');
  const [anticipates, setAnticipates] = useState(false);
  const [defaultBankAccountId, setDefaultBankAccountId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState<Acquirer | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!canManage) router.push('/financeiro');
  }, [canManage, router]);

  if (!canManage) return null;

  const toNumber = (raw: string): number => {
    const normalized = raw.replace(/\./g, '').replace(',', '.');
    const value = Number.parseFloat(normalized);
    return Number.isFinite(value) ? value : 0;
  };

  const openCreate = () => {
    setEditing(null);
    setName('');
    setBankKeywords('');
    setDebitRate('');
    setCreditRate('');
    setSettlementDaysDebit('0');
    setSettlementDaysCredit('0');
    setAnticipates(false);
    setDefaultBankAccountId('');
    setServerError(null);
    setFormOpen(true);
  };

  const openEdit = (acquirer: Acquirer) => {
    setEditing(acquirer);
    setName(acquirer.name);
    setBankKeywords((acquirer.bankKeywords ?? []).join(', '));
    setDebitRate(String(num(acquirer.debitRate)).replace('.', ','));
    setCreditRate(String(num(acquirer.creditRate)).replace('.', ','));
    setSettlementDaysDebit(String(acquirer.settlementDaysDebit));
    setSettlementDaysCredit(String(acquirer.settlementDaysCredit));
    setAnticipates(acquirer.anticipates);
    setDefaultBankAccountId(acquirer.defaultBankAccountId ?? '');
    setServerError(null);
    setFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setServerError(null);
    if (!name.trim()) {
      toast.error('Informe o nome da adquirente');
      return;
    }
    setSubmitting(true);
    try {
      const keywords = bankKeywords
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      const payload = {
        name: name.trim(),
        bankKeywords: keywords,
        debitRate: toNumber(debitRate),
        creditRate: toNumber(creditRate),
        settlementDaysDebit: Number(settlementDaysDebit) || 0,
        settlementDaysCredit: Number(settlementDaysCredit) || 0,
        anticipates,
        defaultBankAccountId: defaultBankAccountId || null,
      };
      if (editing) {
        await financeService.updateAcquirer(editing.id, payload);
        toast.success('Adquirente atualizada');
      } else {
        await financeService.createAcquirer(payload);
        toast.success('Adquirente criada');
      }
      setFormOpen(false);
      await refresh();
    } catch (err) {
      setServerError(errorMessage(err, 'Erro ao salvar adquirente'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (acquirer: Acquirer) => {
    setActionId(acquirer.id);
    setActionError(null);
    try {
      await financeService.updateAcquirer(acquirer.id, { isActive: !acquirer.isActive });
      toast.success(acquirer.isActive ? 'Adquirente desativada' : 'Adquirente reativada');
      await refresh();
      setDeactivating(null);
    } catch (err) {
      setActionError(errorMessage(err, 'Erro ao atualizar adquirente'));
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
            <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Maquininhas</h2>
            <p className="text-sm text-muted-foreground">
              Adquirentes, taxas e prazos de liquidação
            </p>
          </div>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nova adquirente
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading && items.length === 0 ? (
          <TableSkeleton rows={4} cols={5} />
        ) : error ? (
          <ErrorState
            message={errorMessage(error, 'Erro ao carregar adquirentes')}
            onRetry={() => refresh()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            Icon={CreditCard}
            title="Nenhuma adquirente"
            description="Cadastre as maquininhas para calcular taxas e recebíveis de cartão."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Nova adquirente
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Nome</th>
                  <th className="text-right font-medium px-4 py-3">Débito</th>
                  <th className="text-right font-medium px-4 py-3">Crédito</th>
                  <th className="text-right font-medium px-4 py-3">Prazo débito</th>
                  <th className="text-right font-medium px-4 py-3">Prazo crédito</th>
                  <th className="text-center font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((acquirer) => (
                  <tr key={acquirer.id} className="text-foreground">
                    <td className="px-4 py-3">
                      <p className="font-medium">{acquirer.name}</p>
                      {acquirer.bankKeywords.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {acquirer.bankKeywords.join(' · ')}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{pct(acquirer.debitRate)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{pct(acquirer.creditRate)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {acquirer.settlementDaysDebit} d
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {acquirer.settlementDaysCredit} d
                    </td>
                    <td className="px-4 py-3 text-center">
                      {acquirer.isActive ? (
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
                          onClick={() => openEdit(acquirer)}
                          aria-label={`Editar ${acquirer.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeactivating(acquirer)}
                          aria-label={`${acquirer.isActive ? 'Desativar' : 'Reativar'} ${acquirer.name}`}
                        >
                          {acquirer.isActive ? 'Desativar' : 'Reativar'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar adquirente' : 'Nova adquirente'}
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
              <Label htmlFor="acquirer-name">Nome *</Label>
              <Input
                id="acquirer-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Stone"
                maxLength={120}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acquirer-keywords">Palavras-chave do extrato</Label>
              <Input
                id="acquirer-keywords"
                value={bankKeywords}
                onChange={(event) => setBankKeywords(event.target.value)}
                placeholder="stone, pagbank (separadas por vírgula)"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                Usadas na conciliação automática (Fase 2) para reconhecer a adquirente no extrato.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="acquirer-debit">Taxa de débito (%) *</Label>
              <Input
                id="acquirer-debit"
                value={debitRate}
                onChange={(event) => setDebitRate(event.target.value)}
                placeholder="1,99"
                inputMode="decimal"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acquirer-credit">Taxa de crédito (%) *</Label>
              <Input
                id="acquirer-credit"
                value={creditRate}
                onChange={(event) => setCreditRate(event.target.value)}
                placeholder="2,99"
                inputMode="decimal"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acquirer-days-debit">Prazo de liquidação débito (dias)</Label>
              <Input
                id="acquirer-days-debit"
                type="number"
                min={0}
                max={365}
                value={settlementDaysDebit}
                onChange={(event) => setSettlementDaysDebit(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acquirer-days-credit">Prazo de liquidação crédito (dias)</Label>
              <Input
                id="acquirer-days-credit"
                type="number"
                min={0}
                max={365}
                value={settlementDaysCredit}
                onChange={(event) => setSettlementDaysCredit(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acquirer-account">Conta padrão de crédito</Label>
              <select
                id="acquirer-account"
                value={defaultBankAccountId}
                onChange={(event) => setDefaultBankAccountId(event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground"
              >
                <option value="">Nenhuma</option>
                {bankAccounts
                  .filter((account) => account.isActive)
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={anticipates}
                  onChange={(event) => setAnticipates(event.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                Permite antecipação de recebíveis
              </label>
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
        title={deactivating?.isActive ? 'Desativar adquirente' : 'Reativar adquirente'}
        message={
          <>
            {deactivating?.isActive ? (
              <>
                A adquirente <strong>{deactivating?.name}</strong> será desativada para novas
                vendas; recebíveis existentes permanecem.
              </>
            ) : (
              <>
                A adquirente <strong>{deactivating?.name}</strong> voltará a estar disponível.
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

'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Pencil, Plus, Search, Truck } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useSuppliers } from '@/hooks/useFinance';
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
import type { Supplier } from '@/types/finance';

export default function FornecedoresPage() {
  const router = useRouter();
  const permissions = useAuthStore((state) => state.permissions);
  const canManage = permissions.includes('finance.catalog.manage');

  const { items, isLoading, error, refresh } = useSuppliers();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState<Supplier | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!canManage) router.push('/financeiro');
  }, [canManage, router]);

  const filtered = items.filter((item) =>
    search.trim()
      ? item.name.toLowerCase().includes(search.trim().toLowerCase())
      : true
  );

  if (!canManage) return null;

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDocument('');
    setPhone('');
    setEmail('');
    setNotes('');
    setServerError(null);
    setFormOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
    setName(supplier.name);
    setDocument(supplier.document ?? '');
    setPhone(supplier.phone ?? '');
    setEmail(supplier.email ?? '');
    setNotes(supplier.notes ?? '');
    setServerError(null);
    setFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setServerError(null);
    if (!name.trim()) {
      toast.error('Informe o nome do fornecedor');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        document: document.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        notes: notes.trim() || null,
      };
      if (editing) {
        await financeService.updateSupplier(editing.id, payload);
        toast.success('Fornecedor atualizado');
      } else {
        await financeService.createSupplier(payload);
        toast.success('Fornecedor criado');
      }
      setFormOpen(false);
      await refresh();
    } catch (err) {
      setServerError(errorMessage(err, 'Erro ao salvar fornecedor'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (supplier: Supplier) => {
    setActionId(supplier.id);
    setActionError(null);
    try {
      await financeService.updateSupplier(supplier.id, { isActive: !supplier.isActive });
      toast.success(supplier.isActive ? 'Fornecedor desativado' : 'Fornecedor reativado');
      await refresh();
      setDeactivating(null);
    } catch (err) {
      setActionError(errorMessage(err, 'Erro ao atualizar fornecedor'));
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
            <Truck className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Fornecedores</h2>
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? 'fornecedor' : 'fornecedores'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome"
              className="pl-9"
              aria-label="Buscar fornecedores"
            />
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading && items.length === 0 ? (
          <TableSkeleton rows={5} cols={4} />
        ) : error ? (
          <ErrorState
            message={errorMessage(error, 'Erro ao carregar fornecedores')}
            onRetry={() => refresh()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            Icon={Truck}
            title="Nenhum fornecedor"
            description="Cadastre fornecedores para vincular às contas a pagar."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Novo fornecedor
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Nome</th>
                  <th className="text-left font-medium px-4 py-3">Documento</th>
                  <th className="text-left font-medium px-4 py-3">Contato</th>
                  <th className="text-center font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((supplier) => (
                  <tr key={supplier.id} className="text-foreground">
                    <td className="px-4 py-3 font-medium">{supplier.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {supplier.document ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {supplier.phone ?? '—'}
                      {supplier.email && (
                        <>
                          <br />
                          {supplier.email}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {supplier.isActive ? (
                        <Badge variant="success">Ativo</Badge>
                      ) : (
                        <Badge variant="outline">Inativo</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(supplier)}
                          aria-label={`Editar ${supplier.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeactivating(supplier)}
                          aria-label={`${supplier.isActive ? 'Desativar' : 'Reativar'} ${supplier.name}`}
                        >
                          {supplier.isActive ? 'Desativar' : 'Reativar'}
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
        title={editing ? 'Editar fornecedor' : 'Novo fornecedor'}
        size="md"
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
          <div className="space-y-2">
            <Label htmlFor="supplier-name">Nome *</Label>
            <Input
              id="supplier-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={150}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="supplier-document">Documento (CNPJ/CPF)</Label>
              <Input
                id="supplier-document"
                value={document}
                onChange={(event) => setDocument(event.target.value)}
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-phone">Telefone</Label>
              <Input
                id="supplier-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                maxLength={30}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier-email">E-mail</Label>
            <Input
              id="supplier-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={150}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier-notes">Observações</Label>
            <textarea
              id="supplier-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={2000}
              rows={3}
              className="flex w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
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
        title={deactivating?.isActive ? 'Desativar fornecedor' : 'Reativar fornecedor'}
        message={
          <>
            {deactivating?.isActive ? (
              <>
                O fornecedor <strong>{deactivating?.name}</strong> será desativado. Ele continua
                aparecendo em contas antigas, mas não poderá ser vinculado a novas.
              </>
            ) : (
              <>
                O fornecedor <strong>{deactivating?.name}</strong> será reativado para uso nos
                cadastros.
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

'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, FolderTree, Pencil, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCategories } from '@/hooks/useFinance';
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
import type { CategoryKind, FinancialCategory } from '@/types/finance';

const KIND_LABELS: Record<CategoryKind, string> = {
  INCOME: 'Entrada',
  EXPENSE: 'Saída',
};

export default function CategoriasPage() {
  const router = useRouter();
  const permissions = useAuthStore((state) => state.permissions);
  const canManage = permissions.includes('finance.catalog.manage');

  const { items, isLoading, error, refresh } = useCategories();

  const [kindFilter, setKindFilter] = useState<'ALL' | CategoryKind>('ALL');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialCategory | null>(null);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<CategoryKind>('EXPENSE');
  const [parentId, setParentId] = useState('');
  const [color, setColor] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<FinancialCategory | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!canManage) router.push('/financeiro');
  }, [canManage, router]);

  const filtered = items.filter((item) => kindFilter === 'ALL' || item.kind === kindFilter);

  if (!canManage) return null;

  const openCreate = () => {
    setEditing(null);
    setName('');
    setKind('EXPENSE');
    setParentId('');
    setColor('#64748b');
    setSortOrder('0');
    setServerError(null);
    setFormOpen(true);
  };

  const openEdit = (category: FinancialCategory) => {
    setEditing(category);
    setName(category.name);
    setKind(category.kind);
    setParentId(category.parentId ?? '');
    setColor(category.color ?? '');
    setSortOrder(String(category.sortOrder));
    setServerError(null);
    setFormOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setServerError(null);
    if (!name.trim()) {
      toast.error('Informe o nome da categoria');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        kind,
        parentId: parentId || null,
        color: color.trim() || null,
        sortOrder: Number(sortOrder) || 0,
      };
      if (editing) {
        await financeService.updateCategory(editing.id, payload);
        toast.success('Categoria atualizada');
      } else {
        await financeService.createCategory(payload);
        toast.success('Categoria criada');
      }
      setFormOpen(false);
      await refresh();
    } catch (err) {
      setServerError(errorMessage(err, 'Erro ao salvar categoria'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category: FinancialCategory) => {
    setActionId(category.id);
    setActionError(null);
    try {
      await financeService.deleteCategory(category.id);
      toast.success('Categoria excluída');
      await refresh();
      setDeleting(null);
    } catch (err) {
      setActionError(errorMessage(err, 'Erro ao excluir categoria'));
    } finally {
      setActionId(null);
    }
  };

  const parents = items.filter((item) => !editing || item.id !== editing.id);

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
            <FolderTree className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Categorias</h2>
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? 'categoria' : 'categorias'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <label htmlFor="category-kind-filter" className="sr-only">
            Filtrar por tipo
          </label>
          <select
            id="category-kind-filter"
            value={kindFilter}
            onChange={(event) => setKindFilter(event.target.value as typeof kindFilter)}
            className="h-10 rounded-md border border-input bg-muted px-3 text-sm text-foreground"
          >
            <option value="ALL">Todas</option>
            <option value="INCOME">Entradas</option>
            <option value="EXPENSE">Saídas</option>
          </select>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading && items.length === 0 ? (
          <TableSkeleton rows={5} cols={4} />
        ) : error ? (
          <ErrorState
            message={errorMessage(error, 'Erro ao carregar categorias')}
            onRetry={() => refresh()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            Icon={FolderTree}
            title="Nenhuma categoria"
            description="Crie categorias para organizar entradas e saídas."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Nova categoria
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Nome</th>
                  <th className="text-left font-medium px-4 py-3">Tipo</th>
                  <th className="text-left font-medium px-4 py-3">Categoria pai</th>
                  <th className="text-center font-medium px-4 py-3">Sistema</th>
                  <th className="text-center font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((category) => {
                  const parent = category.parentId
                    ? items.find((item) => item.id === category.parentId)
                    : null;
                  return (
                    <tr key={category.id} className="text-foreground">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 font-medium">
                          <span
                            className="inline-block h-3 w-3 rounded-full border border-border"
                            style={{ backgroundColor: category.color ?? '#94a3b8' }}
                            aria-hidden="true"
                          />
                          {category.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={category.kind === 'INCOME' ? 'success' : 'secondary'}>
                          {KIND_LABELS[category.kind]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{parent?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-center">
                        {category.isSystem ? <Badge variant="outline">Sim</Badge> : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {category.isActive ? (
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
                            onClick={() => openEdit(category)}
                            aria-label={`Editar ${category.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {!category.isSystem && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleting(category)}
                              aria-label={`Excluir ${category.name}`}
                            >
                              Excluir
                            </Button>
                          )}
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

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar categoria' : 'Nova categoria'}
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
            <Label htmlFor="category-name">Nome *</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category-kind">Tipo *</Label>
              <select
                id="category-kind"
                value={kind}
                onChange={(event) => setKind(event.target.value as CategoryKind)}
                className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground"
              >
                <option value="INCOME">Entrada</option>
                <option value="EXPENSE">Saída</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-color">Cor</Label>
              <Input
                id="category-color"
                type="color"
                value={color || '#64748b'}
                onChange={(event) => setColor(event.target.value)}
                className="h-10 w-full cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-parent">Categoria pai</Label>
              <select
                id="category-parent"
                value={parentId}
                onChange={(event) => setParentId(event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground"
              >
                <option value="">Nenhuma (raiz)</option>
                {parents.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-sort">Ordem</Label>
              <Input
                id="category-sort"
                type="number"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
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
        open={deleting !== null}
        title="Excluir categoria"
        message={
          <>
            A categoria <strong>{deleting?.name}</strong> será excluída. Lançamentos já gravados
            preservam o texto original; use a desativação se precisar manter o histórico
            consultável.
          </>
        }
        confirmLabel="Excluir"
        loading={actionId !== null}
        error={actionError}
        onConfirm={() => deleting && handleDelete(deleting)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

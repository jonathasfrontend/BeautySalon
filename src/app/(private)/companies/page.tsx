'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Building2, Plus, RefreshCw } from 'lucide-react';
import {
  companiesService,
  type Company,
} from '@/services/companies.service';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

function errorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message || fallback;
}

export default function CompaniesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const canRead = !!user?.permissions?.includes('companies.read');
  const canCreate = !!user?.permissions?.includes('companies.create');
  const canUpdate = !!user?.permissions?.includes('companies.update');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [isActive, setIsActive] = useState(true);

  // Parâmetros explícitos: closure estável, sem capturar `page` do render.
  const fetchCompanies = useCallback(
    async (targetPage: number, targetLimit: number) => {
      setLoading(true);
      try {
        const result = await companiesService.list(targetPage, targetLimit);
        setCompanies(result.items);
        setTotal(result.pagination.total);
        setTotalPages(result.pagination.totalPages);
      } catch (error) {
        toast.error(errorMessage(error, 'Erro ao carregar empresas'));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!canRead) {
      router.push('/dashboard');
      return;
    }
    fetchCompanies(page, limit);
  }, [canRead, page, limit, fetchCompanies, router]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error('Informe o nome da empresa');
      return;
    }

    setSubmitting(true);
    try {
      await companiesService.create({
        name: name.trim(),
        document: document.trim() || undefined,
        timezone: timezone.trim() || DEFAULT_TIMEZONE,
        isActive,
      });
      toast.success('Empresa criada com sucesso!');
      setName('');
      setDocument('');
      setTimezone(DEFAULT_TIMEZONE);
      setIsActive(true);
      setShowForm(false);
      // page=1: recarrega explicitamente (setPage(1) não dispararia o effect).
      // page>1: o useEffect com page=1 faz a busca; evita dupla request.
      if (page === 1) {
        await fetchCompanies(1, limit);
      } else {
        setPage(1);
      }
    } catch (error) {
      toast.error(errorMessage(error, 'Erro ao criar empresa'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (company: Company) => {
    if (!canUpdate) return;
    setTogglingId(company.id);
    try {
      await companiesService.update(company.id, { isActive: !company.isActive });
      toast.success(
        company.isActive ? 'Empresa desativada' : 'Empresa ativada'
      );
      await fetchCompanies(page, limit);
    } catch (error) {
      toast.error(errorMessage(error, 'Erro ao atualizar empresa'));
    } finally {
      setTogglingId(null);
    }
  };

  if (!canRead) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Empresas</h1>
          <p className="text-muted-foreground">
            Gerencie as empresas cadastradas na plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCompanies(page, limit)}
            disabled={loading}
            aria-label="Recarregar empresas"
          >
            <RefreshCw className="h-4 w-4" />
            Recarregar
          </Button>
          {canCreate && (
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setShowForm((current) => !current)}
              aria-expanded={showForm}
            >
              <Plus className="h-4 w-4" />
              Nova empresa
            </Button>
          )}
        </div>
      </div>

      {showForm && canCreate && (
        <form
          onSubmit={handleCreate}
          className="bg-card rounded-lg border border-border p-4 shadow-sm space-y-4"
        >
          <h2 className="text-lg font-semibold text-foreground">
            Nova empresa
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nome</Label>
              <Input
                id="company-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nome da empresa"
                maxLength={100}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-document">Documento (opcional)</Label>
              <Input
                id="company-document"
                value={document}
                onChange={(event) => setDocument(event.target.value)}
                placeholder="Ex.: 12.345.678/0001-90"
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-timezone">Fuso horário</Label>
              <Input
                id="company-timezone"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                placeholder={DEFAULT_TIMEZONE}
                maxLength={60}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Empresa ativa
            </label>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner />
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              Nenhuma empresa encontrada
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Nome</th>
                  <th className="text-left font-medium px-4 py-3">Documento</th>
                  <th className="text-left font-medium px-4 py-3">Fuso horário</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {companies.map((company) => (
                  <tr key={company.id} className="text-foreground">
                    <td className="px-4 py-3 font-medium">{company.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {company.document || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {company.timezone}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={company.isActive ? 'success' : 'error'}>
                        {company.isActive ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canUpdate && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={togglingId === company.id}
                          onClick={() => handleToggle(company)}
                        >
                          {togglingId === company.id
                            ? 'Aguarde...'
                            : company.isActive
                              ? 'Desativar'
                              : 'Ativar'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
        <span>
          {total} {total === 1 ? 'empresa' : 'empresas'} · Página {page} de {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="company-limit">Por página:</label>
          <select
            id="company-limit"
            value={limit}
            onChange={(event) => {
              setLimit(Number(event.target.value));
              setPage(1);
            }}
            className="rounded-md border border-input bg-muted px-2 py-1 text-foreground"
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}

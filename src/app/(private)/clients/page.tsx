'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Client } from '@/types';
import { clientService } from '@/services/client.service';
import { ClientTable } from '@/components/clients/ClientTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Checkbox } from '@/components/ui/Checkbox';
import { CustomLink } from '@/components/ui/Link';

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showBlocked, setShowBlocked] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadClients();
  }, [page, search, showBlocked]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 20,
      };

      if (search) {
        params.search = search;
      }

      if (showBlocked) {
        params.isBlocked = true;
      }

      const response = await clientService.getAll(params);
      setClients(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await clientService.delete(id);
      loadClients();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert('Erro ao excluir cliente');
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Clientes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie os clientes do salão
          </p>
        </div>
        <CustomLink href="/clients/new" variant="gradient" size="default">
          + Novo Cliente
        </CustomLink>
      </div>

      {/* Filtros */}
      <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              type="text"
              placeholder="Buscar por nome, telefone ou e-mail..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-blocked"
              checked={showBlocked}
              onCheckedChange={(checked) => {
                setShowBlocked(checked === true);
                setPage(1);
              }}
            />
            <label
              htmlFor="show-blocked"
              className="text-sm text-foreground cursor-pointer"
            >
              Mostrar apenas bloqueados
            </label>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        {loading ? (
          <div className="flex bg-muted justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <ClientTable clients={clients} onDelete={handleDelete} />

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border flex justify-between items-center">
                <p className="text-sm text-foreground">
                  Página {page} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

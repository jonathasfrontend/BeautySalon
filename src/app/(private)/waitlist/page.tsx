'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WaitlistEntry, WaitlistStatus, Service } from '@/types';
import { waitlistService } from '@/services/waitlist.service';
import { serviceService } from '@/services/service.service';
import { WaitlistCard } from '@/components/waitlist/WaitlistCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { CustomLink } from '@/components/ui/Link';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';

export default function WaitlistPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    loadEntries();
  }, [page, statusFilter, serviceFilter, showOnlyPending]);

  const loadServices = async () => {
    try {
      const response = await serviceService.getAll({ isActive: true });
      setServices(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  };

  const loadEntries = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 20,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (serviceFilter !== 'all') {
        params.serviceId = serviceFilter;
      }

      if (showOnlyPending) {
        params.isContacted = false;
      }

      const response = await waitlistService.getAll(params);
      setEntries(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Erro ao carregar lista de espera:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsContacted = async (id: string) => {
    try {
      await waitlistService.markAsContacted(id);
      loadEntries();
    } catch (error) {
      console.error('Erro ao marcar como contatado:', error);
      alert('Erro ao marcar como contatado');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta entrada da lista de espera?')) return;

    try {
      await waitlistService.delete(id);
      loadEntries();
    } catch (error) {
      console.error('Erro ao excluir entrada:', error);
      alert('Erro ao excluir entrada');
    }
  };

  // Filtrar por busca de nome/telefone
  const filteredEntries = entries.filter((entry) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      entry.clientName.toLowerCase().includes(searchLower) ||
      entry.clientPhone.includes(search) ||
      (entry.clientEmail && entry.clientEmail.toLowerCase().includes(searchLower))
    );
  });

  const pendingCount = entries.filter(e => e.status === WaitlistStatus.PENDING && !e.isContacted).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Lista de Espera
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie os clientes aguardando por atendimento
            {pendingCount > 0 && (
              <span className="ml-2 text-orange-600 dark:text-orange-400 font-semibold">
                • {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <CustomLink href="/waitlist/new" variant="gradient" size="default">
          + Adicionar à Lista
        </CustomLink>
      </div>

      {/* Filtros */}
      <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="search">Buscar</Label>
            <Input
              id="search"
              type="text"
              placeholder="Buscar por nome, telefone ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value={WaitlistStatus.PENDING}>Pendente</SelectItem>
                  <SelectItem value={WaitlistStatus.CONTACTED}>Contatado</SelectItem>
                  <SelectItem value={WaitlistStatus.SCHEDULED}>Agendado</SelectItem>
                  <SelectItem value={WaitlistStatus.CANCELLED}>Cancelado</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="service">Serviço</Label>
            <Select
              value={serviceFilter}
              onValueChange={(value) => {
                setServiceFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos os serviços" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Serviços</SelectLabel>
                  <SelectItem value="all">Todos</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Checkbox
            id="show-pending"
            checked={showOnlyPending}
            onCheckedChange={(checked) => {
              setShowOnlyPending(checked === true);
              setPage(1);
            }}
          />
          <Label htmlFor="show-pending" className="cursor-pointer">
            Mostrar apenas não contatados
          </Label>
        </div>
      </div>

      {/* Lista de Entradas */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <WaitlistCard
                key={entry.id}
                entry={entry}
                onMarkAsContacted={handleMarkAsContacted}
                onViewDetails={(id) => router.push(`/waitlist/${id}`)}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {!loading && filteredEntries.length === 0 && (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">
                {search
                  ? 'Nenhuma entrada encontrada para esta busca'
                  : 'Nenhuma entrada na lista de espera'}
              </p>
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

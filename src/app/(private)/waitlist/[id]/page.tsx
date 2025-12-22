'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { WaitlistEntry, WaitlistStatus, Service } from '@/types';
import { waitlistService } from '@/services/waitlist.service';
import { serviceService } from '@/services/service.service';
import { WaitlistForm } from '@/components/waitlist/WaitlistForm';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Label } from '@/components/ui/Label';
import toast from 'react-hot-toast';
import { Edit2, Trash2 } from 'lucide-react';

export default function WaitlistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const entryId = params.id as string;

  const [entry, setEntry] = useState<WaitlistEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadEntry();
  }, [entryId]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const data = await waitlistService.getById(entryId);
      console.log('Waitlist entry loaded:', data); // Debug log
      
      // Garantir que os campos obrigatórios existam
      const entryData: WaitlistEntry = {
        ...data,
        status: data.status || WaitlistStatus.PENDING,
        isContacted: data.isContacted ?? false,
        updatedAt: data.updatedAt || data.createdAt, // Fallback para createdAt se updatedAt não existir
      };
      
      // Se não vier com o serviço, buscar separadamente
      if (!entryData.service && entryData.serviceId) {
        try {
          const serviceResponse = await serviceService.getById(entryData.serviceId);
          console.log('Service response:', serviceResponse); // Debug log
          
          // A resposta pode vir como { data: Service } ou diretamente como Service
          if (serviceResponse.data) {
            entryData.service = serviceResponse.data;
          } else if (serviceResponse) {
            entryData.service = serviceResponse as any;
          }
          
          console.log('Service loaded:', entryData.service); // Debug log
        } catch (serviceError) {
          console.error('Erro ao carregar serviço:', serviceError);
        }
      }
      
      setEntry(entryData);
    } catch (error) {
      console.error('Erro ao carregar entrada:', error);
      setError('Erro ao carregar entrada');
      toast.error('Erro ao carregar dados da entrada');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      setError('');
      await waitlistService.update(entryId, data);
      await loadEntry();
      setEditing(false);
      toast.success('Entrada atualizada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao atualizar entrada:', err);
      setError(err.message || 'Erro ao atualizar entrada');
      toast.error('Erro ao atualizar entrada');
    }
  };

  const handleMarkAsContacted = async () => {
    try {
      await waitlistService.markAsContacted(entryId);
      await loadEntry();
      toast.success('Marcado como contatado!');
    } catch (error) {
      console.error('Erro ao marcar como contatado:', error);
      toast.error('Erro ao marcar como contatado');
    }
  };

  const handleStatusChange = async (newStatus: WaitlistStatus) => {
    try {
      setUpdatingStatus(true);
      await waitlistService.update(entryId, { status: newStatus });
      await loadEntry();
      toast.success('Status atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja remover esta entrada da lista de espera?')) return;

    try {
      await waitlistService.delete(entryId);
      toast.success('Entrada removida com sucesso!');
      router.push('/waitlist');
    } catch (error) {
      console.error('Erro ao excluir entrada:', error);
      toast.error('Erro ao excluir entrada');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informado';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Data inválida';
    }
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return 'Não informado';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getStatusBadge = (status: WaitlistStatus) => {
    switch (status) {
      case WaitlistStatus.PENDING:
        return <Badge variant="warning">Pendente</Badge>;
      case WaitlistStatus.CONTACTED:
        return <Badge variant="info">Contatado</Badge>;
      case WaitlistStatus.SCHEDULED:
        return <Badge variant="success">Agendado</Badge>;
      case WaitlistStatus.CANCELLED:
        return <Badge variant="error">Cancelado</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Entrada não encontrada</p>
        <Button onClick={() => router.back()} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className='flex items-center gap-4'>
            <Button variant="secondary" onClick={() => router.back()}>
              ← Voltar
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              Detalhes da Lista de Espera
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Visualize e edite informações da entrada
          </p>
        </div>
        
        <div className="flex gap-2">
          {!editing && (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit2 className="w-4 h-4" />
                Editar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
                Excluir
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {editing ? (
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <WaitlistForm
            entry={entry}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <>
          {/* Card de Informações */}
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {entry.clientName}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Adicionado em {formatDate(entry.createdAt)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(entry.status)}
                {entry.isContacted && (
                  <Badge variant="success" className="text-xs">
                    ✓ Contatado
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="text-base font-medium text-foreground">
                  {formatPhone(entry.clientPhone)}
                </p>
              </div>

              {entry.clientEmail && (
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="text-base font-medium text-foreground">
                    {entry.clientEmail}
                  </p>
                </div>
              )}

              {entry.service && entry.service.name && (
                <div>
                  <p className="text-sm text-muted-foreground">Serviço Desejado</p>
                  <p className="text-base font-medium text-foreground">
                    {entry.service.name}
                  </p>
                  {entry.service.price !== undefined && entry.service.durationMinutes !== undefined && (
                    <p className="text-sm text-muted-foreground">
                      R$ {entry.service.price.toFixed(2)} • {entry.service.durationMinutes} min
                    </p>
                  )}
                </div>
              )}

              {entry.preferredDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Data Preferencial</p>
                  <p className="text-base font-medium text-foreground">
                    {formatDate(entry.preferredDate)}
                  </p>
                </div>
              )}

              {entry.contactedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Contatado em</p>
                  <p className="text-base font-medium text-foreground">
                    {formatDate(entry.contactedAt)}
                  </p>
                </div>
              )}
            </div>

            {entry.notes && (
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">Observações</p>
                <p className="text-base text-foreground whitespace-pre-wrap">
                  {entry.notes}
                </p>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Ações</h3>
            
            <div className="space-y-4">
              {/* Alterar Status */}
              <div>
                <Label htmlFor="status">Alterar Status</Label>
                <Select
                  value={entry.status}
                  onValueChange={handleStatusChange}
                  disabled={updatingStatus}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      <SelectItem value={WaitlistStatus.PENDING}>Pendente</SelectItem>
                      <SelectItem value={WaitlistStatus.CONTACTED}>Contatado</SelectItem>
                      <SelectItem value={WaitlistStatus.SCHEDULED}>Agendado</SelectItem>
                      <SelectItem value={WaitlistStatus.CANCELLED}>Cancelado</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Marcar como Contatado */}
              {!entry.isContacted && entry.status === WaitlistStatus.PENDING && (
                <div>
                  <Button
                    variant="default"
                    onClick={handleMarkAsContacted}
                    className="w-full"
                  >
                    📞 Marcar como Contatado
                  </Button>
                </div>
              )}

              {/* Criar Agendamento */}
              {entry.status !== WaitlistStatus.CANCELLED && (
                <div>
                  <Button
                    variant="gradient"
                    onClick={() => router.push(`/appointments/new?clientName=${entry.clientName}&clientPhone=${entry.clientPhone}&serviceId=${entry.serviceId}`)}
                    className="w-full"
                  >
                    📅 Criar Agendamento
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Client, Appointment, Payment } from '@/types';
import { clientService } from '@/services/client.service';
import { ClientCard } from '@/components/clients/ClientCard';
import { ClientForm } from '@/components/clients/ClientForm';
import { ClientHistory } from '@/components/clients/ClientHistory';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Edit2, ShieldBan, ShieldCheck, Trash2 } from 'lucide-react';

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [history, setHistory] = useState<{ appointments: Appointment[]; payments: Payment[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      // A API retorna os dados do cliente com appointments e payments juntos
      const response = await clientService.getById(clientId);

      // Verificar se a resposta tem o formato esperado
      if (response.data) {
        // Se vier no formato { client, appointments, payments }
        if ('client' in response.data) {
          const data = response.data as any;

          setClient(data.client);

          // Os appointments e payments vêm dentro de client
          setHistory({
            appointments: data.client.appointments || [],
            payments: data.client.payments || [],
          });
        } else {
          // Se vier direto como Client
          setClient(response.data as Client);
          // Tentar carregar o histórico separadamente
          await loadHistory();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      setError('Erro ao carregar cliente');
      toast.error('Erro ao carregar dados do cliente');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await clientService.getHistory(clientId);
      if (response.data) {
        const data = response.data as any;
        setHistory({
          appointments: data.appointments || [],
          payments: data.payments || [],
        });
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      setError('');
      await clientService.update(clientId, data);
      await loadClientData();
      setEditing(false);
      toast.success('Cliente atualizado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao atualizar cliente:', err);
      setError(err.message || 'Erro ao atualizar cliente');
      toast.error('Erro ao atualizar cliente');
    }
  };

  const handleBlock = async () => {
    if (!client) return;

    const action = client.isBlocked ? 'desbloquear' : 'bloquear';
    // if (!confirm(`Tem certeza que deseja ${action} este cliente?`)) return;

    try {
      await clientService.update(clientId, { isBlocked: !client.isBlocked });
      await loadClientData();
      toast.success(`Cliente desbloqueado com sucesso!`);
    } catch (error) {
      console.error(`Erro ao ${action} cliente:`, error);
      toast.error(`Erro ao ${action} cliente`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Cliente não encontrado</p>
        <Button onClick={() => router.back()} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className='flex items-center gap-4'>
            <Button variant="secondary" onClick={() => router.back()}>
              ← Voltar
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
               Detalhes do Cliente
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Visualize e edite informações do cliente
          </p>
        </div>
        
        <div className="flex gap-2">
          {!editing && (
            <>
              <Button variant="gradient" onClick={() => setEditing(true)}>
                <Edit2 className="w-4 h-4" />
                Editar
              </Button>
              <Button
                variant={client.isBlocked ? 'success' : 'destructive'}
                onClick={handleBlock}
                // className={client.isBlocked ? '' : 'text-red-600 hover:text-red-700'}
              >
                {client.isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
                {client.isBlocked ? 'Desbloquear' : 'Bloquear'}
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
          <ClientForm
            client={client}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <ClientCard client={client} />
      )}

      {history && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Histórico
          </h2>
          <ClientHistory
            appointments={history.appointments}
            payments={history.payments}
          />
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Client } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { CustomLink } from '../ui/Link';

interface ClientTableProps {
  clients: Client[];
  onDelete?: (id: string) => void;
}

export function ClientTable({ clients, onDelete }: ClientTableProps) {
    const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!onDelete) return;

    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setDeletingId(id);
      try {
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-secondary/50">
            <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
              Nome
            </th>
            <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
              Contato
            </th>
            <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
              Pontos
            </th>
            <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
              Agendamentos
            </th>
            <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
              Status
            </th>
            <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr
              key={client.id}
              className={cn(
                "border-b border-border bg-card last:border-0 hover:bg-secondary/30 transition-colors",
                "animate-fade-in"
              )}
            >
              <td className="px-5 py-4 text-sm font-medium text-foreground">
                {client.name}
                {client.email && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {client.email}
                  </div>
                )}
              </td>
              <td className="px-5 py-4 text-sm font-medium text-foreground">
                {client.phone}
              </td>
              <td className="px-5 py-4 text-sm font-medium text-foreground">
                {client.loyaltyPoints || 0} pts
              </td>
              <td className="px-5 py-4 text-sm font-medium text-foreground">
                {client._count?.appointments || 0}
              </td>
              <td className="px-5 py-4 text-sm font-medium text-foreground">
                {client.isBlocked ? (
                  <Badge variant="error">Bloqueado</Badge>
                ) : (
                  <Badge variant="success">Ativo</Badge>
                )}
                {client.noShowCount > 0 && (
                  <Badge variant="warning" className="ml-2">
                    {client.noShowCount} faltas
                  </Badge>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <CustomLink href={`/clients/${client.id}`} variant="secondary" size="sm" className='flex-1'>
                    Ver Detalhes
                  </CustomLink>
                  {onDelete && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(client.id)}
                      disabled={deletingId === client.id}
                      className="text-primary-foreground"
                    >
                      {deletingId === client.id ? 'Excluindo...' : 'Excluir'}
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {clients.length === 0 && (
        <div className="text-center bg-card py-12 text-muted-foreground">
          Nenhum cliente encontrado
        </div>
      )}
    </div>
  );
}

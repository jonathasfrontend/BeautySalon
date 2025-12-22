'use client';

import { WaitlistEntry, WaitlistStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Check, Trash2 } from 'lucide-react';

interface WaitlistCardProps {
  entry: WaitlistEntry;
  onMarkAsContacted?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function WaitlistCard({ 
  entry, 
  onMarkAsContacted,
  onViewDetails,
  onDelete 
}: WaitlistCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informado';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'Data inválida';
    }
  };

  const formatPhone = (phone: string) => {
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hoje';
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
    return `${Math.floor(diffInDays / 30)} meses atrás`;
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-6 border border-border hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {entry.clientName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatPhone(entry.clientPhone)}
          </p>
          {entry.clientEmail && (
            <p className="text-sm text-muted-foreground">
              {entry.clientEmail}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(entry.status)}
          {entry.isContacted && (
            <Badge variant="success" className="text-xs">
              <Check className="w-3 h-3" />
              Contatado
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {entry.service && (
          <div>
            <p className="text-xs text-muted-foreground">Serviço</p>
            <p className="text-sm font-medium text-foreground">
              {entry.service.name}
            </p>
          </div>
        )}

        {entry.preferredDate && (
          <div>
            <p className="text-xs text-muted-foreground">Data Preferencial</p>
            <p className="text-sm font-medium text-foreground">
              {formatDate(entry.preferredDate)}
            </p>
          </div>
        )}

        {entry.notes && (
          <div>
            <p className="text-xs text-muted-foreground">Observações</p>
            <p className="text-sm text-foreground line-clamp-2">
              {entry.notes}
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Adicionado {getTimeAgo(entry.createdAt)}
          </p>
          {entry.contactedAt && (
            <p className="text-xs text-muted-foreground">
              Contatado em {formatDate(entry.contactedAt)}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {!entry.isContacted && entry.status === WaitlistStatus.PENDING && onMarkAsContacted && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onMarkAsContacted(entry.id)}
            className="flex-1"
          >
            📞 Marcar como Contatado
          </Button>
        )}
        
        {onViewDetails && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onViewDetails(entry.id)}
            className="flex-1"
          >
            Ver Detalhes
          </Button>
        )}
        
        {onDelete && entry.status !== WaitlistStatus.SCHEDULED && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(entry.id)}
            className='flex-1'
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </Button>
        )}
      </div>
    </div>
  );
}

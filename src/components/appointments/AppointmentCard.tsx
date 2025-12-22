'use client';

import { Appointment } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CustomLink } from '../ui/Link';

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: () => void;
  onViewDetails?: () => void;
}

export function AppointmentCard({ appointment, onCancel, onViewDetails }: AppointmentCardProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      COMPLETED: 'success',
      CONFIRMED: 'info',
      SCHEDULED: 'warning',
      CANCELLED: 'error',
      NO_SHOW: 'error',
    };
    return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-foreground">
              {appointment.client?.name || 'Cliente não encontrado'}
            </h3>
            {getStatusBadge(appointment.status)}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(appointment.startTime)} às {formatTime(appointment.startTime)}
          </p>
        </div>
      </div>

      {appointment.staff?.user && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground">Profissional</p>
          <p className="text-sm font-medium text-foreground">
            {appointment.staff.user.name}
          </p>
        </div>
      )}

      <div className="mb-3">
        <p className="text-xs text-muted-foreground">Valor Total</p>
        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
          R$ {appointment.totalAmount.toFixed(2)}
        </p>
      </div>

      {appointment.notes && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground">Observações</p>
          <p className="text-sm text-foreground">{appointment.notes}</p>
        </div>
      )}

      {(onViewDetails || onCancel) && (
        <div className="flex gap-2 pt-4 border-t border-border">
          {onViewDetails && (
            <CustomLink href={`/appointments/${appointment.id}`} variant="secondary" size="sm" className="flex-1 ">
              Ver Detalhes
            </CustomLink>
          )}
          {onCancel && appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && appointment.status !== 'NO_SHOW' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onCancel}
              className="flex-1 "
            >
              Cancelar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

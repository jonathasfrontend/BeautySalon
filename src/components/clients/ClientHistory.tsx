'use client';

import { Appointment, Payment } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface ClientHistoryProps {
  appointments: Appointment[];
  payments: Payment[];
}

export function ClientHistory({ appointments, payments }: ClientHistoryProps) {
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const statusLabels: Record<string, string> = {
    COMPLETED: 'Concluído',
    CONFIRMED: 'Confirmado',
    SCHEDULED: 'Agendado',
    IN_PROGRESS: 'Em Andamento',
    CANCELLED: 'Cancelado',
    NO_SHOW: 'Faltou',
  };

  const paymentStatusLabels: Record<string, string> = {
    PAID: 'Pago',
    PENDING: 'Pendente',
    PARTIAL: 'Parcial',
    REFUNDED: 'Reembolsado',
    CANCELLED: 'Cancelado',
  };

  const paymentMethodLabels: Record<string, string> = {
    CASH: 'Dinheiro',
    DEBIT: 'Débito',
    CREDIT: 'Crédito',
    PIX: 'PIX',
    LINK: 'Link de Pagamento',
    WALLET: 'Carteira Digital',
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      COMPLETED: 'success',
      CONFIRMED: 'info',
      SCHEDULED: 'warning',
      IN_PROGRESS: 'info',
      CANCELLED: 'error',
      NO_SHOW: 'error',
    };
    return (
      <Badge variant={variants[status] || 'info'}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error'> = {
      PAID: 'success',
      PENDING: 'warning',
      PARTIAL: 'warning',
      REFUNDED: 'error',
      CANCELLED: 'error',
    };
    return (
      <Badge variant={variants[status] || 'warning'}>
        {paymentStatusLabels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Histórico de Agendamentos */}
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Histórico de Agendamentos
        </h3>
        <div className="space-y-4">
          {sortedAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum agendamento encontrado
            </p>
          ) : (
            sortedAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border-l-4 border-blue-500 pl-4 py-2"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(appointment.startTime).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {' às '}
                      {new Date(appointment.startTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {appointment.staff?.user && (
                      <p className="text-xs text-muted-foreground">
                        com {appointment.staff.user.name}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
                {appointment.services && appointment.services.length > 0 && (
                  <div className="mb-1">
                    <p className="text-xs text-muted-foreground">
                      {appointment.services.map(s => s.name).join(', ')}
                    </p>
                  </div>
                )}
                <p className="text-sm font-semibold text-foreground">
                  R$ {appointment.totalAmount.toFixed(2)}
                </p>
                {appointment.notes && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {appointment.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Histórico de Pagamentos */}
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Histórico de Pagamentos
        </h3>
        <div className="space-y-4">
          {sortedPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum pagamento encontrado
            </p>
          ) : (
            sortedPayments.map((payment) => (
              <div
                key={payment.id}
                className="border-l-4 border-green-500 pl-4 py-2"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(payment.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {paymentMethodLabels[payment.method] || payment.method}
                    </p>
                  </div>
                  {getPaymentStatusBadge(payment.status)}
                </div>
                <p className="text-sm font-semibold text-foreground">
                  R$ {payment.amount.toFixed(2)}
                </p>
                {payment.paidAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Pago em {new Date(payment.paidAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

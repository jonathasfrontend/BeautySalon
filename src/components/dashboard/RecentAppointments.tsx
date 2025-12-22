'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { Appointment, AppointmentStatus } from '@/types';
import { appointmentService } from '@/services/appointment.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/Badge';

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  [AppointmentStatus.SCHEDULED]: {
    label: "Agendado",
    className: "bg-blue-100 text-blue-800 border-blue-200"
  },
  [AppointmentStatus.CONFIRMED]: {
    label: "Confirmado",
    className: "bg-green-100 text-green-800 border-green-200"
  },
  [AppointmentStatus.IN_PROGRESS]: {
    label: "Em Andamento",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200"
  },
  [AppointmentStatus.COMPLETED]: {
    label: "Concluído",
    className: "bg-gray-100 text-gray-800 border-gray-200"
  },
  [AppointmentStatus.CANCELLED]: {
    label: "Cancelado",
    className: "bg-red-100 text-red-800 border-red-200"
  },
  [AppointmentStatus.NO_SHOW]: {
    label: "Não Compareceu",
    className: "bg-orange-100 text-orange-800 border-orange-200"
  },
};

const statusPaymentConfig: Record<string, { label: string; className: string }> = {
  "PENDING": {
    label: "Pendente",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200"
  },
  "PAID": {
    label: "Pago",
    className: "bg-green-100 text-green-800 border-green-200"
  },
  "PARTIAL": {
    label: "Parcialmente Pago",
    className: "bg-blue-100 text-blue-800 border-blue-200"
  },
  "CANCELLED": {
    label: "Cancelado",
    className: "bg-gray-100 text-gray-800 border-gray-200"
  },
  "REFUNDED": {
    label: "Reembolsado",
    className: "bg-purple-100 text-purple-800 border-purple-200"
  },
};

// Função helper para obter o status de pagamento de um agendamento
const getPaymentStatus = (appointment: Appointment): string => {
  if (!appointment.payments || !Array.isArray(appointment.payments) || appointment.payments.length === 0) {
    return 'PENDING';
  }
  const payment = appointment.payments[0];
  return payment.status || 'PENDING';
};

export default function RecentAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodayAppointments();
  }, []);

  const loadTodayAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Formatar data de hoje para o formato YYYY-MM-DD
      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const today = new Date();
      const todayStr = formatDateForAPI(today);

      console.log('📅 Buscando agendamentos de hoje:', todayStr);

      // Buscar agendamentos de hoje usando os parâmetros da API
      const todayAppointments = await appointmentService.getAppointments({
        startDate: todayStr,
        endDate: todayStr
      });

      console.log('📊 Agendamentos encontrados:', todayAppointments.length);
      setAppointments(todayAppointments);

    } catch (error: any) {
      console.error('❌ Erro ao carregar agendamentos de hoje:', error);
      setError(error?.response?.data?.message || error.message || 'Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold text-foreground">Agendamentos de Hoje</h3>
          </div>
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold text-foreground">Agendamentos de Hoje</h3>
          </div>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="card">
      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">Nenhum agendamento próximo</p>
          <p className="text-sm text-gray-500 mt-1">
            Os agendamentos aparecerão aqui quando forem criados
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Agendamentos de Hoje</h3>
            <Link
              href="/appointments"
              className="text-sm text-primary hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    ID
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Cliente
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Serviço
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Profissional
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Horário
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Data
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Status De Pagamento
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment, index) => (
                  <tr
                    key={appointment.id}
                    className={cn(
                      "border-b border-border bg-card last:border-0 hover:bg-secondary/30 transition-colors",
                      "animate-fade-in"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Link
                      href={`/appointments/${appointment.id}`}
                      key={appointment.id}>
                      <td className="px-5 py-4 text-xs text-muted-foreground hover:bg-muted">
                        #{appointment.id.split('-')[4] || 'Cliente não informado'}
                      </td>
                    </Link>
                    <td className="px-5 py-4 text-sm font-medium text-foreground">
                      {appointment.client?.name || 'Cliente não informado'}
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground">
                      {appointment.services && appointment.services.length > 0
                        ? appointment.services.map(s => s.name).join(', ')
                        : 'Sem serviços'}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      👤 {appointment.staff?.user?.name || 'Profissional não informado'}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-foreground">
                      🕐 {formatTime(appointment.startTime)}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-foreground">
                      📅 {formatDate(appointment.startTime)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-normal",
                          statusConfig[appointment.status]?.className || "bg-gray-100 text-gray-800"
                        )}
                      >
                        {statusConfig[appointment.status]?.label || appointment.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-normal",
                          statusPaymentConfig[getPaymentStatus(appointment)]?.className || "bg-gray-100 text-gray-800"
                        )}
                      >
                        {statusPaymentConfig[getPaymentStatus(appointment)]?.label || getPaymentStatus(appointment)}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-foreground text-right">
                      {formatCurrency(appointment.totalAmount || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
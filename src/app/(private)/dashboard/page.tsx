'use client';

import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  DollarSign,
  Users,
  TrendingUp,
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { appointmentService } from '@/services/appointment.service';
import { clientService } from '@/services/client.service';
import { paymentService } from '@/services/payment.service';
import { formatCurrency } from '@/lib/utils';
import RecentAppointments from '@/components/dashboard/RecentAppointments';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    totalClients: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Formatar data para o formato YYYY-MM-DD com padding de zeros
      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const today = new Date();
      const todayStr = formatDateForAPI(today);
      
      // Primeiro dia do mês
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfMonthStr = formatDateForAPI(startOfMonth);
      
      // Último dia do mês
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const endOfMonthStr = formatDateForAPI(endOfMonth);

      console.log('📅 Data de hoje formatada:', todayStr);
      console.log('📅 Início do mês:', startOfMonthStr);
      console.log('📅 Fim do mês:', endOfMonthStr);

      // Load apenas os dados necessários para os cards da dashboard
      const [
        todayAppointmentsData,
        monthAppointmentsData,
        clientsData,
        paymentsData,
      ] = await Promise.allSettled([
        // Buscar agendamentos de hoje para calcular estatísticas
        appointmentService.getAppointments({ startDate: todayStr, endDate: todayStr }),
        // Buscar agendamentos do mês para calcular receita mensal
        appointmentService.getAppointments({ startDate: startOfMonthStr, endDate: endOfMonthStr }),
        clientService.getClients({ page: 1, limit: 1 }),
        paymentService.getPayments({ status: 'PENDING' }),
      ]);

      // Process today's appointments apenas para estatísticas
      const todayAppts = todayAppointmentsData.status === 'fulfilled'
        ? todayAppointmentsData.value
        : [];

        console.log('📊 Agendamentos de hoje (raw):', todayAppts);

      // Process month appointments
      const monthAppointments = monthAppointmentsData.status === 'fulfilled'
        ? monthAppointmentsData.value
        : [];

      console.log('📊 Agendamentos de hoje:', todayAppts.length);
      console.log('📊 Agendamentos do mês:', monthAppointments.length);

      // Calculate month revenue from appointments
      const monthRevenue = monthAppointments
        .filter(a => a.status === 'COMPLETED')
        .reduce((sum, a) => sum + (a.totalAmount || 0), 0);

      // Process clients
      const clients = clientsData.status === 'fulfilled'
        ? clientsData.value
        : { pagination: { total: 0 } };

      // Process payments
      const payments = paymentsData.status === 'fulfilled'
        ? paymentsData.value
        : [];

      // Calculate today's revenue
      const todayRevenue = todayAppts
        .filter(a => a.status === 'COMPLETED')
        .reduce((sum, a) => sum + (a.totalAmount || 0), 0);

      // Update stats - apenas dados para os cards
      setStats({
        todayAppointments: todayAppts.length,
        todayRevenue,
        monthRevenue,
        totalClients: clients.pagination.total,
        pendingPayments: payments.length,
      });

    } catch (error: any) {
      console.error('❌ Erro ao carregar dados da dashboard:', error);
      setError(error?.response?.data?.message || error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Aqui está o resumo do seu salão.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Agendamentos Hoje"
          value={stats.todayAppointments}
          icon={CalendarIcon}
          variant={stats.todayAppointments > 0 ? 'primary' : 'default'}
        />

        <StatCard
          title="Receita Hoje"
          value={formatCurrency(stats.todayRevenue)}
          icon={DollarSign}
        />

        <StatCard
          title="Receita do Mês"
          value={formatCurrency(stats.monthRevenue)}
          icon={TrendingUp}
          variant='primary'
        />

        <StatCard
          title="Total de Clientes"
          value={stats.totalClients}
          icon={Users}
        />

        <StatCard
          title="Pagamentos Pendentes"
          value={stats.pendingPayments}
          icon={DollarSign}
          variant={stats.pendingPayments > 0 ? 'primary' : 'default'}
        />
      </div>

      <RecentAppointments />
    </div>
  );
}

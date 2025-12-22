'use client';

import React from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  FileText,
  Package,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import { useDashboardMetrics, useReportFilters } from '@/hooks/useReports';
import { KPICard } from '@/components/reports/KPICard';
import { PeriodSelector } from '@/components/reports/PeriodSelector';

export default function ReportsPage() {
  const { filters, period, setPeriod, setCustomRange } = useReportFilters('month');
  const { data, isLoading, error } = useDashboardMetrics(filters);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const NavigationCard = ({
    icon: Icon,
    title,
    description,
    href,
    color
  }: {
    icon: any;
    title: string;
    description: string;
    href: string;
    color: string;
  }) => (
    <Link href={href} className="block group">
      <div className="p-6 border border-border rounded-lg bg-card hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className='flex items-center gap-4'>
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {title}
            </h3>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 " />
        </div>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Relatórios e Análises
        </h1>
        <p className="text-muted-foreground mt-2">
          Visualize métricas, tendências e insights do seu negócio
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Período de Análise
        </h2>
        <PeriodSelector
          period={period}
          onPeriodChange={setPeriod}
          onCustomRangeChange={setCustomRange}
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Erro ao carregar dados: {error.message}
          </p>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Visão Geral
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <KPICard
            title="Receita Total"
            value={data ? formatCurrency(data.revenue.total) : '---'}
            subtitle={data ? `${data.revenue.count} transações` : 'no período'}
            icon={<DollarSign className="w-5 h-5 text-green-600" />}
            colorScheme="success"
            isLoading={isLoading}
          />
          <KPICard
            title="Despesas"
            value={data ? formatCurrency(data.expenses.total) : '---'}
            subtitle="custos totais"
            icon={<TrendingUp className="w-5 h-5 text-red-600" />}
            colorScheme="danger"
            isLoading={isLoading}
          />
          <KPICard
            title="Lucro Líquido"
            value={data ? formatCurrency(data.profit) : '---'}
            subtitle={data ? `${((data.profit / data.revenue.total) * 100).toFixed(1)}% margem` : ''}
            icon={<Wallet className="w-5 h-5 text-blue-600" />}
            colorScheme="info"
            isLoading={isLoading}
          />
          <KPICard
            title="Clientes Novos"
            value={data ? formatNumber(data.newClients) : '---'}
            subtitle="no período"
            icon={<Users className="w-5 h-5 text-violet-600" />}
            colorScheme="default"
            isLoading={isLoading}
          />
          <KPICard
            title="Agendamentos"
            value={data ? formatNumber(data.appointments.total) : '---'}
            subtitle="total no período"
            icon={<Calendar className="w-5 h-5 text-orange-600" />}
            colorScheme="warning"
            isLoading={isLoading}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Relatórios Detalhados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NavigationCard
            icon={DollarSign}
            title="Relatórios Financeiros"
            description="Receita, despesas, métodos de pagamento e serviços lucrativos"
            href="/reports/financial"
            color="bg-green-600"
          />
          <NavigationCard
            icon={Calendar}
            title="Agendamentos"
            description="Estatísticas de agendamentos, ocupação e performance"
            href="/reports/appointments"
            color="bg-blue-600"
          />
          <NavigationCard
            icon={Package}
            title="Produtos"
            description="Vendas, estoque baixo e movimentação de produtos"
            href="/reports/products"
            color="bg-violet-600"
          />
          <NavigationCard
            icon={Users}
            title="Clientes"
            description="Análise de retenção, inativos e programa de fidelidade"
            href="/reports/clients"
            color="bg-orange-600"
          />
          <NavigationCard
            icon={Wallet}
            title="Comissões"
            description="Comissões por profissional e status de pagamento"
            href="/reports/commissions"
            color="bg-indigo-600"
          />
          <NavigationCard
            icon={FileText}
            title="Relatório Completo"
            description="Visão consolidada de todas as métricas do negócio"
            href="/reports/complete"
            color="bg-gray-600"
          />
        </div>
      </div>

      {data && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Resumo Rápido
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Margem de Lucro
              </p>
              <p className="text-2xl font-bold text-foreground">
                {((data.profit / data.revenue.total) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(data.profit)} de lucro
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Ticket Médio
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(data.revenue.total / data.revenue.count)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Por transação realizada
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Novos Clientes
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatNumber(data.newClients)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Cadastrados no período
              </p>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

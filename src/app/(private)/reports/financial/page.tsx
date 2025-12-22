'use client';

import React from 'react';
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  CreditCard,
  Package,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  useRevenueByPeriod,
  usePaymentMethods,
  useProfitableServices,
  useReportFilters 
} from '@/hooks/useReports';
import { KPICard } from '@/components/reports/KPICard';
import { PeriodSelector } from '@/components/reports/PeriodSelector';
import { 
  AreaChartWithLegend,
  BarChartInteractive,
} from '@/components/charts';
import { Button } from '@/components/ui/Button';

export default function FinancialReportsPage() {
  const router = useRouter();
  const { filters, period, setPeriod, setCustomRange } = useReportFilters('month');
  
  const { data: revenueData, isLoading: revenueLoading, error: revenueError } = useRevenueByPeriod(filters);
  const { data: paymentData, isLoading: paymentLoading } = usePaymentMethods(filters);
  const { data: servicesData, isLoading: servicesLoading } = useProfitableServices(filters);

  // Formatadores
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className='flex items-center gap-4'>
          <Button variant="secondary" onClick={() => router.back()}>
            ← Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            Relatórios Financeiros
          </h1>
        </div>
          <p className="text-muted-foreground mt-1">
            Análise detalhada de receitas, despesas e performance financeira
          </p>
      </div>

      {/* Period Selector */}
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

      {/* Error State */}
      {revenueError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Erro ao carregar dados financeiros: {revenueError.message}
          </p>
        </div>
      )}

      {/* KPIs - Current Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Receita Total"
          value={revenueData ? formatCurrency(revenueData.current.revenue) : '---'}
          subtitle={`${revenueData?.current.transactionCount || 0} transações`}
          trend={revenueData && revenueData.comparison.revenueGrowth > 0 ? 'up' : 'down'}
          trendValue={revenueData ? formatPercentage(revenueData.comparison.revenueGrowth) : undefined}
          icon={<DollarSign className="w-5 h-5 text-green-600" />}
          colorScheme="success"
          isLoading={revenueLoading}
        />

        <KPICard
          title="Despesas"
          value={revenueData ? formatCurrency(revenueData.current.expenses) : '---'}
          subtitle="Total de despesas"
          trend={revenueData && revenueData.comparison.expensesGrowth < 0 ? 'up' : 'down'}
          trendValue={revenueData ? formatPercentage(revenueData.comparison.expensesGrowth) : undefined}
          icon={<TrendingDown className="w-5 h-5 text-red-600" />}
          colorScheme="danger"
          isLoading={revenueLoading}
        />

        <KPICard
          title="Lucro Líquido"
          value={revenueData ? formatCurrency(revenueData.current.profit) : '---'}
          subtitle="Receita - Despesas"
          trend={revenueData && revenueData.comparison.profitGrowth > 0 ? 'up' : 'down'}
          trendValue={revenueData ? formatPercentage(revenueData.comparison.profitGrowth) : undefined}
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
          colorScheme="info"
          isLoading={revenueLoading}
        />

        <KPICard
          title="Ticket Médio"
          value={
            revenueData && revenueData.current.transactionCount > 0
              ? formatCurrency(revenueData.current.revenue / revenueData.current.transactionCount)
              : '---'
          }
          subtitle="Por transação"
          icon={<DollarSign className="w-5 h-5 text-violet-600" />}
          colorScheme="default"
          isLoading={revenueLoading}
        />
      </div>

      {/* Revenue Chart - Daily Data */}
      {revenueData && revenueData.dailyData && (
        <div className="bg-card border border-border rounded-lg p-6">
          <AreaChartWithLegend
            data={revenueData.dailyData.map(d => ({
              date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
              Receita: d.revenue,
              Despesas: d.despesas,
              Lucro: d.lucro,
            }))}
            xAxisKey="date"
            series={[
              { dataKey: 'Receita', name: 'Receita', color: '#10b981' },
              { dataKey: 'Despesas', name: 'Despesas', color: '#ef4444' },
              { dataKey: 'Lucro', name: 'Lucro', color: '#8b5cf6' },
            ]}
            title="Evolução Financeira Diária"
            height={400}
            formatValue={formatCurrency}
          />
        </div>
      )}

      {/* Payment Methods */}
      {paymentData && paymentData.methods && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Receita por Método de Pagamento
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div>
              <BarChartInteractive
                data={paymentData.methods.map(m => ({
                  method: m.method,
                  value: m.total,
                  percentage: m.percentage,
                }))}
                dataKey="value"
                xAxisKey="method"
                height={300}
                formatValue={formatCurrency}
              />
            </div>

            {/* Method Cards */}
            <div className="space-y-3">
              {paymentData.methods.map((method, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-card rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {method.method}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {method.count} transações
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {formatCurrency(method.total)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {method.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Most Profitable Services */}
      {servicesData && servicesData.services && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Serviços Mais Lucrativos
          </h2>

          <div className="space-y-3">
            {servicesData.services.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-card rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-600 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {service.serviceName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {service.timesBooked} agendamentos • Ticket médio: {formatCurrency(service.averagePrice)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(service.totalRevenue)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {service.percentage.toFixed(1)}% do total
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-border flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-bold text-foreground">
              {formatCurrency(servicesData.totalRevenue)}
            </span>
          </div>
        </div>
      )}

      {/* Expenses Details */}
      {revenueData && revenueData.expenseDetails && revenueData.expenseDetails.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Detalhes de Despesas
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-card">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Data
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y ">
                {revenueData.expenseDetails.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-3 text-sm text-foreground">
                      {expense.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {expense.category}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(expense.paidDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-red-600 dark:text-red-400">
                      {formatCurrency(expense.amount)}
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

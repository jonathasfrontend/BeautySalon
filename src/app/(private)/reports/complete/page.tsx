'use client';

import React, { useState, useRef } from 'react';
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Package,
  CreditCard,
  FileText,
  Download,
  Printer,
  Share2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wallet,
  ShoppingCart,
  UserCheck,
  Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  useCompleteFinancialReport,
  useAppointmentStats,
  useTopSellingProducts,
  useClientAnalysis,
  useReportFilters,
  useCommissionsReport,
} from '@/hooks/useReports';
import { KPICard } from '@/components/reports/KPICard';
import { PeriodSelector } from '@/components/reports/PeriodSelector';
import { 
  AreaChartWithLegend,
  BarChartInteractive,
  BarChartMultiple,
} from '@/components/charts';
import { Button } from '@/components/ui/Button';

export default function CompleteReportPage() {
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const { filters, period, setPeriod, setCustomRange } = useReportFilters('month');
  
  // Buscar todos os dados
  const { data: financialData, isLoading: financialLoading, error: financialError } = useCompleteFinancialReport(filters);
  const { data: appointmentsData, isLoading: appointmentsLoading } = useAppointmentStats(filters);
  const { data: productsData, isLoading: productsLoading } = useTopSellingProducts(filters);
  const { data: clientsData, isLoading: clientsLoading } = useClientAnalysis(filters);
  const { data: commissionsData, isLoading: commissionsLoading } = useCommissionsReport(filters);

  const isLoading = financialLoading || appointmentsLoading || productsLoading || clientsLoading || commissionsLoading;

  // Formatadores
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Funções de exportação
  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Aqui você implementaria a lógica de exportação para PDF
      // Pode usar bibliotecas como jsPDF ou html2pdf
      alert('Funcionalidade de exportação PDF em desenvolvimento');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // Aqui você implementaria a lógica de exportação para Excel
      // Pode usar bibliotecas como xlsx ou exceljs
      alert('Funcionalidade de exportação Excel em desenvolvimento');
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      alert('Erro ao exportar Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Relatório Completo',
        text: 'Confira o relatório completo do período',
        url: window.location.href,
      });
    } else {
      // Fallback: copiar link
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => router.back()}>
            ← Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Relatório Completo
            </h1>
            <p className="text-muted-foreground mt-1">
              Visão consolidada de todas as métricas do negócio
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={handlePrint}
            disabled={isExporting}
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportExcel}
            disabled={isExporting}
          >
            <FileText className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button
            variant="secondary"
            onClick={handleShare}
            disabled={isExporting}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-card border border-border rounded-lg p-6 print:hidden">
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
      {financialError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 print:hidden">
          <p className="text-red-800 dark:text-red-200">
            Erro ao carregar dados: {financialError.message}
          </p>
        </div>
      )}

      {/* Report Content */}
      <div ref={reportRef} className="space-y-6">
        {/* Header para impressão */}
        <div className="hidden print:block mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Relatório Completo</h1>
          <p className="text-center text-muted-foreground">
            {financialData?.summary && (
              <>
                Período: {formatDate(filters.startDate || '')} até {formatDate(filters.endDate || '')}
              </>
            )}
          </p>
          <p className="text-center text-sm text-muted-foreground mt-1">
            Gerado em: {new Date().toLocaleString('pt-BR')}
          </p>
        </div>

        {/* 1. RESUMO EXECUTIVO */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Resumo Executivo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Receita Total"
              value={financialData ? formatCurrency(financialData.summary.revenue) : '---'}
              subtitle="receita bruta"
              icon={<DollarSign className="w-5 h-5 text-green-600" />}
              colorScheme="success"
              isLoading={financialLoading}
            />
            <KPICard
              title="Lucro Líquido"
              value={financialData ? formatCurrency(financialData.summary.netProfit) : '---'}
              subtitle="após comissões"
              icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
              colorScheme="info"
              isLoading={financialLoading}
            />
            <KPICard
              title="Total de Agendamentos"
              value={appointmentsData ? formatNumber(appointmentsData.summary.total) : '---'}
              subtitle={appointmentsData ? `${appointmentsData.summary.completionRate.toFixed(1)}% conclusão` : ''}
              icon={<Calendar className="w-5 h-5 text-orange-600" />}
              colorScheme="warning"
              isLoading={appointmentsLoading}
            />
            <KPICard
              title="Clientes Ativos"
              value={clientsData ? formatNumber(clientsData.summary.active) : '---'}
              subtitle={clientsData ? `${clientsData.summary.retentionRate.toFixed(1)}% retenção` : ''}
              icon={<Users className="w-5 h-5 text-violet-600" />}
              colorScheme="default"
              isLoading={clientsLoading}
            />
          </div>
        </div>

        {/* 2. ANÁLISE FINANCEIRA DETALHADA */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-green-600" />
            Análise Financeira Detalhada
          </h2>

          {/* Métricas Financeiras */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Receita Bruta</p>
              <p className="text-2xl font-bold text-foreground">
                {financialData ? formatCurrency(financialData.summary.revenue) : '---'}
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Despesas</p>
              <p className="text-2xl font-bold text-red-600">
                {financialData ? formatCurrency(financialData.summary.expenses) : '---'}
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Comissões</p>
              <p className="text-2xl font-bold text-orange-600">
                {financialData ? formatCurrency(financialData.summary.commissions) : '---'}
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Lucro Líquido</p>
              <p className="text-2xl font-bold text-blue-600">
                {financialData ? formatCurrency(financialData.summary.netProfit) : '---'}
              </p>
            </div>
          </div>

          {/* Gráfico de Evolução Financeira */}
          {financialData?.revenueByPeriod?.dailyData && (
            <div className="mt-6">
              <AreaChartWithLegend
                data={financialData.revenueByPeriod.dailyData.map(d => ({
                  date: new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                  Receita: d.revenue,
                  Despesas: d.despesas,
                  Lucro: d.lucro,
                }))}
                xAxisKey="date"
                series={[
                  { dataKey: 'Receita', name: 'Receita', color: '#10b981' },
                  { dataKey: 'Despesas', name: 'Despesas', color: '#ef4444' },
                  { dataKey: 'Lucro', name: 'Lucro', color: '#3b82f6' },
                ]}
                title="Evolução Financeira Diária"
                height={300}
              />
            </div>
          )}

          {/* Distribuição por Método de Pagamento */}
          {financialData?.revenueByMethod?.methods && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Receita por Método de Pagamento
              </h3>
              <BarChartInteractive
                data={financialData.revenueByMethod.methods.map(m => ({
                  name: m.method,
                  value: m.total,
                  count: m.count,
                }))}
                xAxisKey="name"
                dataKey="value"
                title=""
                height={250}
              />
            </div>
          )}
        </div>

        {/* 3. AGENDAMENTOS E PERFORMANCE */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-orange-600" />
            Agendamentos e Performance
          </h2>

          {/* Métricas de Agendamentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {appointmentsData ? formatNumber(appointmentsData.summary.total) : '---'}
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-muted-foreground">Concluídos</p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {appointmentsData ? formatNumber(appointmentsData.summary.completed) : '---'}
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-muted-foreground">Cancelados</p>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {appointmentsData ? formatNumber(appointmentsData.summary.cancelled) : '---'}
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <p className="text-sm text-muted-foreground">No-Show</p>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {appointmentsData ? formatNumber(appointmentsData.summary.noShow) : '---'}
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-muted-foreground">Taxa Conclusão</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {appointmentsData ? `${appointmentsData.summary.completionRate.toFixed(1)}%` : '---'}
              </p>
            </div>
          </div>

          {/* Performance por Profissional */}
          {appointmentsData?.byStaff && appointmentsData.byStaff.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Performance por Profissional
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                        Profissional
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                        Agendamentos
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                        Receita Total
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                        Ticket Médio
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointmentsData.byStaff.map((staff) => (
                      <tr key={staff.staffId} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 text-sm text-foreground">
                          {staff.staffName}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-foreground">
                          {formatNumber(staff.appointmentsCount)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-foreground font-medium">
                          {formatCurrency(staff.totalRevenue)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-foreground">
                          {formatCurrency(staff.averageTicket)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Distribuição por Horário */}
          {appointmentsData?.byHour && appointmentsData.byHour.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Horários de Pico
              </h3>
              <BarChartInteractive
                data={appointmentsData.byHour.map(h => ({
                  name: `${h.hour}h`,
                  value: h.count,
                }))}
                xAxisKey="name"
                dataKey="value"
                title=""
                height={250}
              />
            </div>
          )}
        </div>

        {/* 4. PRODUTOS E ESTOQUE */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Package className="w-6 h-6 text-violet-600" />
            Produtos e Estoque
          </h2>

          {/* Métricas de Produtos */}
          {productsData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Receita de Produtos</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(productsData.summary.totalRevenue)}
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Lucro de Produtos</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(productsData.summary.totalProfit)}
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Itens Vendidos</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatNumber(productsData.summary.totalItemsSold)}
                </p>
              </div>
            </div>
          )}

          {/* Top Produtos */}
          {productsData?.products && productsData.products.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Produtos Mais Vendidos
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                        Produto
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                        Categoria
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                        Vendidos
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                        Receita
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                        Lucro
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                        Margem
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsData.products.slice(0, 10).map((product) => (
                      <tr key={product.productId} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 text-sm text-foreground">
                          {product.productName}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {product.category}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-foreground">
                          {formatNumber(product.quantitySold)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-foreground font-medium">
                          {formatCurrency(product.revenue)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-green-600 font-medium">
                          {formatCurrency(product.profit)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-foreground">
                          {product.profitMargin.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 5. ANÁLISE DE CLIENTES */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Análise de Clientes
          </h2>

          {/* Métricas de Clientes */}
          {clientsData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total de Clientes</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatNumber(clientsData.summary.total)}
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Novos Clientes</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(clientsData.summary.new)}
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Clientes Ativos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(clientsData.summary.active)}
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Taxa de Retenção</p>
                <p className="text-2xl font-bold text-violet-600">
                  {clientsData.summary.retentionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          )}

          {/* Top Clientes */}
          {clientsData?.topClients && clientsData.topClients.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Top 10 Clientes
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                        Cliente
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                        Telefone
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                        Transações
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                        Total Gasto
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                        Ticket Médio
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                        Pontos
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientsData.topClients.slice(0, 10).map((client) => (
                      <tr key={client.clientId} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 text-sm text-foreground">
                          {client.clientName}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {client.clientPhone}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-foreground">
                          {formatNumber(client.transactionCount)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-foreground font-medium">
                          {formatCurrency(client.totalSpent)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-foreground">
                          {formatCurrency(client.averageTicket)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-violet-600 font-medium">
                          {formatNumber(client.loyaltyPoints)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 6. COMISSÕES */}
        {commissionsData && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-indigo-600" />
              Comissões
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total em Comissões</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(commissionsData.summary.total)}
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Comissões Pagas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(commissionsData.summary.paid)}
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Comissões Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(commissionsData.summary.pending)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 7. SERVIÇOS MAIS LUCRATIVOS */}
        {financialData?.profitableServices?.services && financialData.profitableServices.services.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-green-600" />
              Serviços Mais Lucrativos
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                      Serviço
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                      Vezes Agendado
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                      Receita Total
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                      Preço Médio
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                      % da Receita
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {financialData.profitableServices.services.map((service) => (
                    <tr key={service.serviceId} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 text-sm text-foreground">
                        {service.serviceName}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-foreground">
                        {formatNumber(service.timesBooked)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-foreground font-medium">
                        {formatCurrency(service.totalRevenue)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-foreground">
                        {formatCurrency(service.averagePrice)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-green-600 font-medium">
                        {service.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. INSIGHTS E RECOMENDAÇÕES */}
        <div className="bg-card border-border-blue rounded-lg p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Insights e Recomendações
          </h2>
          
          <div className="space-y-3">
            {financialData && (
              <>
                {financialData.revenueByPeriod.comparison.revenueGrowth > 0 ? (
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">
                        Crescimento de Receita Positivo
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Sua receita cresceu {formatPercentage(financialData.revenueByPeriod.comparison.revenueGrowth)} em relação ao período anterior. Continue com as estratégias atuais!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">
                        Atenção: Queda na Receita
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Houve uma redução de {formatPercentage(Math.abs(financialData.revenueByPeriod.comparison.revenueGrowth))} na receita. Considere revisar estratégias de marketing e preços.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {appointmentsData && appointmentsData.summary.cancellationRate > 15 && (
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">
                    Taxa de Cancelamento Elevada
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {appointmentsData.summary.cancellationRate.toFixed(1)}% dos agendamentos foram cancelados. Considere enviar lembretes automáticos e implementar política de confirmação.
                  </p>
                </div>
              </div>
            )}

            {clientsData && clientsData.summary.retentionRate < 70 && (
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">
                    Taxa de Retenção Pode Melhorar
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Taxa de retenção atual: {clientsData.summary.retentionRate.toFixed(1)}%. Invista em programas de fidelidade e campanhas de reativação de clientes inativos.
                  </p>
                </div>
              </div>
            )}

            {productsData && productsData.summary.totalProfit > 0 && (
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">
                    Venda de Produtos Rentável
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Os produtos geraram {formatCurrency(productsData.summary.totalProfit)} em lucro. Continue incentivando a venda de produtos durante os atendimentos.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-6 border-t border-border">
          <p>Relatório gerado em {new Date().toLocaleString('pt-BR')}</p>
          <p className="mt-1">Sistema de Gerenciamento de Salão © 2025</p>
        </div>
      </div>
    </div>
  );
}

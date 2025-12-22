'use client';

import React from 'react';
import {
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Users,
    BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    useAppointmentStats,
    useOccupancyRate,
    useReportFilters
} from '@/hooks/useReports';
import { KPICard } from '@/components/reports/KPICard';
import { PeriodSelector } from '@/components/reports/PeriodSelector';
import {
    BarChartSingle,
    BarChartMultiple,
    BarChartInteractive
} from '@/components/charts';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function AppointmentsReportsPage() {
    const router = useRouter();
    const { filters, period, setPeriod, setCustomRange } = useReportFilters('month');
    const { data: statsData, isLoading: statsLoading, error: statsError } = useAppointmentStats(filters);
    const { data: occupancyData, isLoading: occupancyLoading, error: occupancyError } = useOccupancyRate(filters);

    const isLoading = statsLoading || occupancyLoading;
    const error = statsError || occupancyError;

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('pt-BR').format(value);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    // Preparar dados para gráfico de status
    const statusChartData = statsData?.byStatus.map(item => ({
        name: item.status === 'COMPLETED' ? 'Concluído' :
            item.status === 'CANCELLED' ? 'Cancelado' :
                item.status === 'NO_SHOW' ? 'Faltou' :
                    item.status,
        value: item.count,
        percentage: item.percentage
    })) || [];

    // Preparar dados para gráfico por hora
    const hourlyChartData = statsData?.byHour.map(item => ({
        hour: `${item.hour}h`,
        count: item.count
    })) || [];

    // Preparar dados para gráfico de staff (top 10)
    const staffChartData = statsData?.byStaff
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10)
        .map(item => ({
            name: item.staffName,
            agendamentos: item.appointmentsCount,
            receita: item.totalRevenue,
            ticketMedio: item.averageTicket
        })) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className='flex items-center gap-4'>
                    <Button variant="secondary" onClick={() => router.back()}>
                        ← Voltar
                    </Button>
                    <h1 className="text-3xl font-bold text-foreground">
                        Relatórios de Agendamentos
                    </h1>
                </div>
                <p className="text-muted-foreground mt-1">
                    Análise completa de agendamentos, conclusões, cancelamentos e ocupação
                </p>
            </div>

            {/* Period Selector */}
            <div className="bg-card border border-boredr rounded-lg p-6">
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
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200">
                        Erro ao carregar dados: {error.message}
                    </p>
                </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total de Agendamentos"
                    value={statsData ? formatNumber(statsData.summary.total) : '---'}
                    subtitle="agendamentos no período"
                    icon={<Calendar className="w-5 h-5 text-violet-600" />}
                    colorScheme="default"
                    isLoading={isLoading}
                />

                <KPICard
                    title="Taxa de Conclusão"
                    value={statsData ? `${statsData.summary.completionRate.toFixed(1)}%` : '---'}
                    subtitle={`${statsData?.summary.completed || 0} concluídos`}
                    icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                    colorScheme="success"
                    isLoading={isLoading}
                />

                <KPICard
                    title="Taxa de Cancelamento"
                    value={statsData ? `${statsData.summary.cancellationRate.toFixed(1)}%` : '---'}
                    subtitle={`${statsData?.summary.cancelled || 0} cancelados`}
                    icon={<XCircle className="w-5 h-5 text-red-600" />}
                    colorScheme="danger"
                    isLoading={isLoading}
                />

                <KPICard
                    title="Taxa de Ocupação Média"
                    value={occupancyData ? `${occupancyData.overall.averageOccupancy.toFixed(1)}%` : '---'}
                    subtitle={`${occupancyData?.overall.totalStaff || 0} profissionais`}
                    icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
                    colorScheme="info"
                    isLoading={isLoading}
                />
            </div>

            {/* Gráficos e Tabelas */}
            {statsData && (
                <>
                    {/* Distribuição por Status */}
                    <div className="bg-card border border-boredr rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">
                                    Distribuição por Status
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Análise dos status dos agendamentos
                                </p>
                            </div>
                            <BarChart3 className="w-5 h-5 text-gray-400" />
                        </div>

                        <BarChartSingle
                            data={statusChartData}
                            dataKey="value"
                            xAxisKey="name"
                            title=""
                            height={300}
                        />

                        {/* Legenda com percentuais */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            {statsData.byStatus.map((item) => (
                                <div
                                    key={item.status}
                                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                >
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {item.status === 'COMPLETED' ? 'Concluído' :
                                            item.status === 'CANCELLED' ? 'Cancelado' :
                                                item.status === 'NO_SHOW' ? 'Faltou' :
                                                    item.status}
                                    </span>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-foreground">
                                            {item.count}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.percentage.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Agendamentos por Hora do Dia */}
                    <div className="bg-card border border-boredr rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">
                                    Agendamentos por Hora do Dia
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Distribuição horária dos agendamentos
                                </p>
                            </div>
                            <Clock className="w-5 h-5 text-gray-400" />
                        </div>

                        <BarChartSingle
                            data={hourlyChartData}
                            dataKey="count"
                            xAxisKey="hour"
                            title=""
                            height={300}
                        />
                    </div>

                    {/* Performance por Profissional */}
                    <div className="bg-card border border-boredr rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">
                                    Performance por Profissional
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Top 10 profissionais por receita gerada
                                </p>
                            </div>
                            <Users className="w-5 h-5 text-gray-400" />
                        </div>

                        <BarChartInteractive
                            data={staffChartData}
                            dataKey="receita"
                            xAxisKey="name"
                            title=""
                            height={400}
                            formatValue={formatCurrency}
                        />

                        {/* Tabela detalhada */}
                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-secondary/50">
                                        <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                                            Profissional
                                        </th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                            Agendamentos
                                        </th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                            Receita Total
                                        </th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                            Ticket Médio
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {statsData.byStaff
                                        .sort((a, b) => b.totalRevenue - a.totalRevenue)
                                        .map((staff) => (
                                            <tr
                                                key={staff.staffId}
                                                className={cn(
                                                    "border-b border-border bg-card last:border-0 hover:bg-secondary/30 transition-colors",
                                                    "animate-fade-in"
                                                )}
                                            >
                                                <td className="py-3 px-4 text-sm text-foreground">
                                                    {staff.staffName}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                                                    {staff.appointmentsCount}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-right font-medium text-foreground">
                                                    {formatCurrency(staff.totalRevenue)}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                                                    {formatCurrency(staff.averageTicket)}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Taxa de Ocupação por Profissional */}
            {occupancyData && (
                <div className="bg-card border border-boredr rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Taxa de Ocupação por Profissional
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Análise de ocupação e horas trabalhadas
                            </p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-secondary/50">
                                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                                        Profissional
                                    </th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                        Agendamentos
                                    </th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                        Horas Ocupadas
                                    </th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                        Horas Disponíveis
                                    </th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                        Taxa de Ocupação
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {occupancyData.byStaff
                                    .sort((a, b) => b.occupancyRate - a.occupancyRate)
                                    .map((staff) => (
                                        <tr
                                            key={staff.staffId}
                                            className={cn(
                                                "border-b border-border bg-card last:border-0 hover:bg-secondary/30 transition-colors",
                                                "animate-fade-in"
                                            )}
                                        >

                                            <td className="py-3 px-4 text-sm text-foreground">
                                                {staff.staffName}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                                                {staff.appointmentsCount}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                                                {staff.occupiedHours.toFixed(1)}h
                                            </td>
                                            <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                                                {staff.availableHours.toFixed(1)}h
                                            </td>
                                            <td className="py-3 px-4 text-sm text-right">
                                                <span
                                                    className={`font-medium ${staff.occupancyRate >= 80
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : staff.occupancyRate >= 50
                                                            ? 'text-yellow-600 dark:text-yellow-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                        }`}
                                                >
                                                    {staff.occupancyRate.toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Resumo geral */}
                    <div className="mt-6 p-4 bg-card border border-border-blue rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                                    Total de Profissionais
                                </p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-100">
                                    {occupancyData.overall.totalStaff}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                                    Ocupação Média
                                </p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-100">
                                    {occupancyData.overall.averageOccupancy.toFixed(1)}%
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                                    Total de Horas Disponíveis
                                </p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-100">
                                    {occupancyData.overall.totalAvailableHours.toFixed(1)}h
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

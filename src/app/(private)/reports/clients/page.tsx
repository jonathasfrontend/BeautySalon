
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    UserPlus,
    TrendingUp,
    AlertCircle,
    Award,
    Phone,
    Mail,
    Calendar,
    DollarSign
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";
import {
    useClientAnalysis,
    useInactiveClients,
    useLoyaltyAnalysis,
    useReportFilters
} from '@/hooks/useReports';
import { KPICard } from '@/components/reports/KPICard';
import { PeriodSelector } from '@/components/reports/PeriodSelector';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function ClientsReportsPage() {
    const router = useRouter();
    const { filters, period, setPeriod, setCustomRange } = useReportFilters('month');
    const [daysInactive, setDaysInactive] = useState(60);

    const { data: analysis, isLoading: analysisLoading, error: analysisError } = useClientAnalysis(filters);
    const { data: inactive, isLoading: inactiveLoading, error: inactiveError } = useInactiveClients({ daysInactive });
    const { data: loyalty, isLoading: loyaltyLoading, error: loyaltyError } = useLoyaltyAnalysis();

    const isLoading = analysisLoading || inactiveLoading || loyaltyLoading;
    const error = analysisError || inactiveError || loyaltyError;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('pt-BR').format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
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
                        Relatórios de Clientes
                    </h1>
                </div>
                <p className="text-muted-foreground mt-1">
                    Análise de retenção, clientes inativos e programa de fidelidade
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
                    title="Total de Clientes"
                    value={analysis ? formatNumber(analysis.summary.total) : '---'}
                    subtitle="clientes cadastrados"
                    icon={<Users className="w-5 h-5 text-violet-600" />}
                    colorScheme="default"
                    isLoading={isLoading}
                />

                <KPICard
                    title="Novos Clientes"
                    value={analysis ? formatNumber(analysis.summary.new) : '---'}
                    subtitle="no período selecionado"
                    icon={<UserPlus className="w-5 h-5 text-green-600" />}
                    colorScheme="success"
                    isLoading={isLoading}
                />

                <KPICard
                    title="Taxa de Retenção"
                    value={analysis ? `${analysis.summary.retentionRate.toFixed(1)}%` : '---'}
                    subtitle={`${analysis?.summary.active || 0} clientes ativos`}
                    icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
                    colorScheme="info"
                    isLoading={isLoading}
                />

                <KPICard
                    title="Clientes Inativos"
                    value={inactive ? formatNumber(inactive.summary.total) : '---'}
                    subtitle={`${daysInactive}+ dias sem visitar`}
                    icon={<AlertCircle className="w-5 h-5 text-yellow-600" />}
                    colorScheme="warning"
                    isLoading={isLoading}
                />
            </div>

            {/* Top Clientes */}
            {analysis && (
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Top Clientes por Valor Gasto
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Clientes que mais geraram receita no período
                            </p>
                        </div>
                        <Award className="w-5 h-5 text-yellow-500" />
                    </div>

                    {analysis.topClients.length > 0 ? (
                        <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-secondary/50">
                                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                                        Posição
                                    </th>
                                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                                        Cliente
                                    </th>
                                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                                        Telefone
                                    </th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                        Total Gasto
                                    </th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                        Transações
                                    </th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                        Ticket Médio
                                    </th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                        Pontos
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {analysis.topClients.map((client, index) => (
                                    <tr
                                        key={client.clientId}
                                        className={cn(
                                            "border-b border-border bg-card last:border-0 hover:bg-secondary/30 transition-colors",
                                            "animate-fade-in"
                                        )}
                                    >
                                        <td className="py-3 px-4">
                                            <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                                index === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' :
                                                    index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                                        'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                                                }`}>
                                                {index + 1}º
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm font-medium text-foreground">
                                            {client.clientName}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                            {client.clientPhone || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right font-medium text-foreground">
                                            {formatCurrency(client.totalSpent)}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                                            {client.transactionCount}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                                            {formatCurrency(client.averageTicket)}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full font-medium">
                                                <Award className="w-3 h-3" />
                                                {client.loyaltyPoints}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-lg font-medium">Nenhum cliente com gastos no período</p>
                            <p className="text-sm mt-1">Os dados aparecerão quando houver transações de clientes</p>
                        </div>
                    )}
                </div>
            )}

            {/* Clientes Inativos */}
            {inactive && (
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Clientes Inativos
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Clientes com {daysInactive}+ dias sem visitar - Oportunidades de reativação
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select
                                value={String(daysInactive)}
                                onValueChange={(value) => setDaysInactive(Number(value))}
                                required
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Numero de dias" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="30">30 dias</SelectItem>
                                        <SelectItem value="60">60 dias</SelectItem>
                                        <SelectItem value="90">90 dias</SelectItem>
                                        <SelectItem value="180">180 dias</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                        </div>
                    </div>

                    {/* Resumo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-muted  border border-border-yellow rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">
                                Total de Clientes Inativos
                            </p>
                            <p className="text-3xl font-bold text-yellow-600">
                                {inactive.summary.total}
                            </p>
                        </div>
                        <div className="p-4 bg-muted  border border-border-green rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">
                                Receita Potencial
                            </p>
                            <p className="text-3xl font-bold text-green-600">
                                {formatCurrency(inactive.summary.potentialRevenue)}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Baseado no histórico de gastos
                            </p>
                        </div>
                    </div>

                    {inactive.clients.length > 0 ? (
                        <div className="space-y-3">
                        {inactive.clients.map((client) => (
                            <div
                                key={client.clientId}
                                className="p-4 bg-card border border-border-yellow rounded-lg"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-medium text-foreground">
                                                {client.name}
                                            </h3>
                                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300">
                                                {client.daysSinceLastVisit} dias inativo
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Phone className="w-4 h-4" />
                                                <span>{client.phone || 'Sem telefone'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail className="w-4 h-4" />
                                                <span className="truncate">{client.email || 'Sem email'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                <span>Última visita: {formatDate(client.lastVisit)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <DollarSign className="w-4 h-4" />
                                                <span>Total gasto: {formatCurrency(client.totalSpent)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                            <span>{client.appointmentsCount} agendamentos</span>
                                            <span>•</span>
                                            <span>{client.loyaltyPoints} pontos de fidelidade</span>
                                        </div>
                                    </div>

                                    <button className="ml-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors">
                                        Reativar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-lg font-medium">Nenhum cliente inativo encontrado</p>
                            <p className="text-sm mt-1">Todos os clientes estão ativos no período selecionado</p>
                        </div>
                    )}
                </div>
            )}

            {/* Programa de Fidelidade */}
            {loyalty && (
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Programa de Fidelidade
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Clientes mais fiéis e engajados
                            </p>
                        </div>
                        <Award className="w-5 h-5 text-violet-500" />
                    </div>

                    {/* Resumo do programa */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
                            <p className="text-sm text-violet-700 dark:text-violet-300 mb-1">
                                Total de Pontos em Circulação
                            </p>
                            <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">
                                {formatNumber(loyalty.summary.totalPointsInCirculation)}
                            </p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                                Clientes com Pontos
                            </p>
                            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                {loyalty.summary.clientsWithPoints}
                            </p>
                        </div>
                    </div>

                    {loyalty.topLoyalClients.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-secondary/50">
                                        <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                                            Posição
                                        </th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                                            Cliente
                                        </th>
                                        <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                                            Telefone
                                        </th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                            Pontos
                                        </th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                            Agendamentos
                                        </th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                            Membro Desde
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loyalty.topLoyalClients.map((client, index) => (
                                    <tr
                                        key={client.clientId}
                                        className={cn(
                                            "border-b border-border bg-card last:border-0 hover:bg-secondary/30 transition-colors",
                                            "animate-fade-in"
                                        )}
                                    >
                                        <td className="py-3 px-4">
                                            <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                                index === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' :
                                                    index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                                                        'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                                                }`}>
                                                {index + 1}º
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm font-medium text-foreground">
                                            <div className="flex items-center gap-2">
                                                {client.name}
                                                {index < 3 && <Award className="w-4 h-4 text-yellow-500" />}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                            {client.phone || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full font-bold">
                                                <Award className="w-3 h-3" />
                                                {formatNumber(client.points)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                                            {client.appointmentsCount}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                                            {formatDate(client.memberSince)}
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-lg font-medium">Nenhum cliente com pontos de fidelidade</p>
                            <p className="text-sm mt-1">Os dados aparecerão quando os clientes acumularem pontos</p>
                        </div>
                    )}
                </div>
            )}

            {/* Estatísticas Adicionais */}
            {analysis && (
                <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                        Estatísticas Gerais
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">
                                Clientes Ativos
                            </p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {analysis.summary.active}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {((analysis.summary.active / analysis.summary.total) * 100).toFixed(1)}% do total
                            </p>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">
                                Clientes Inativos
                            </p>
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {analysis.summary.inactive}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {((analysis.summary.inactive / analysis.summary.total) * 100).toFixed(1)}% do total
                            </p>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">
                                Novos no Período
                            </p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {analysis.summary.new}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Crescimento da base
                            </p>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">
                                Taxa de Retenção
                            </p>
                            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                                {analysis.summary.retentionRate.toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Clientes que retornaram
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

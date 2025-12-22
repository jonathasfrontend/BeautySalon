'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Package,
    TrendingUp,
    AlertTriangle,
    DollarSign,
    ShoppingCart,
    ArrowUpCircle,
    ArrowDownCircle,
    RefreshCw
} from 'lucide-react';
import {
    useTopSellingProducts,
    useLowStockProducts,
    useStockMovement,
    useReportFilters
} from '@/hooks/useReports';
import { KPICard } from '@/components/reports/KPICard';
import { PeriodSelector } from '@/components/reports/PeriodSelector';
import {
    BarChartInteractive,
    BarChartMultiple
} from '@/components/charts';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function ProductsReportsPage() {
    const router = useRouter();
    const { filters, period, setPeriod, setCustomRange } = useReportFilters('month');
    const { data: topProducts, isLoading: topLoading, error: topError } = useTopSellingProducts(filters);
    const { data: lowStock, isLoading: lowStockLoading, error: lowStockError } = useLowStockProducts();
    const { data: stockMovement, isLoading: movementLoading, error: movementError } = useStockMovement(filters);

    const isLoading = topLoading || lowStockLoading || movementLoading;
    const error = topError || lowStockError || movementError;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('pt-BR').format(value);
    };

    // Preparar dados para gráfico de top produtos (top 10)
    const topProductsChartData = topProducts?.products
        .slice(0, 10)
        .map(product => ({
            name: product.productName,
            receita: product.revenue,
            lucro: product.profit,
            quantidade: product.quantitySold
        })) || [];

    // Preparar dados para gráfico de movimentação (top 10 produtos)
    const movementChartData = stockMovement?.byProduct
        .sort((a, b) => (b.in + b.out) - (a.in + a.out))
        .slice(0, 10)
        .map(product => ({
            name: product.productName,
            entradas: product.in,
            saidas: product.out,
            ajustes: product.adjustment
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
                        Relatórios de Produtos
                    </h1>
                </div>
                <p className="text-muted-foreground mt-1">
                    Análise completa de vendas, controle de estoque e movimentação de produtos
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
                    title="Receita Total"
                    value={topProducts ? formatCurrency(topProducts.summary.totalRevenue) : '---'}
                    subtitle="vendas de produtos"
                    icon={<DollarSign className="w-5 h-5 text-green-600" />}
                    colorScheme="success"
                    isLoading={isLoading}
                />

                <KPICard
                    title="Lucro Total"
                    value={topProducts ? formatCurrency(topProducts.summary.totalProfit) : '---'}
                    subtitle={topProducts ? `${((topProducts.summary.totalProfit / topProducts.summary.totalRevenue) * 100).toFixed(1)}% margem` : ''}
                    icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
                    colorScheme="info"
                    isLoading={isLoading}
                />

                <KPICard
                    title="Itens Vendidos"
                    value={topProducts ? formatNumber(topProducts.summary.totalItemsSold) : '---'}
                    subtitle="unidades no período"
                    icon={<ShoppingCart className="w-5 h-5 text-violet-600" />}
                    colorScheme="default"
                    isLoading={isLoading}
                />

                <KPICard
                    title="Produtos em Alerta"
                    value={lowStock ? lowStock.summary.total.toString() : '---'}
                    subtitle={`${lowStock?.summary.critical || 0} críticos`}
                    icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
                    colorScheme="danger"
                    isLoading={isLoading}
                />
            </div>

            {/* Top Produtos Mais Vendidos */}
            {topProducts && (
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Top 10 Produtos Mais Vendidos
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Ranking por receita gerada no período
                            </p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-muted-foreground" />
                    </div>

                    <BarChartInteractive
                        data={topProductsChartData}
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
                                        Produto
                                    </th>
                                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                                        Categoria
                                    </th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                        Qtd. Vendida
                                    </th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                        Receita
                                    </th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                        Lucro
                                    </th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                        Margem
                                    </th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                        % Receita
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.products.map((product, index) => (
                                    <tr
                                        key={product.productId}
                                        className={cn(
                                            "border-b border-border bg-card last:border-0 hover:bg-secondary/30 transition-colors",
                                            "animate-fade-in"
                                        )}
                                    >
                                        <td className="py-3 px-4 text-sm text-foreground">
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-bold">
                                                    {index + 1}
                                                </span>
                                                {product.productName}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                            {product.category}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                                            {product.quantitySold}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right font-medium text-foreground">
                                            {formatCurrency(product.revenue)}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right font-medium text-green-600 dark:text-green-400">
                                            {formatCurrency(product.profit)}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                                            {product.profitMargin.toFixed(1)}%
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                                            {product.revenuePercentage.toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Produtos com Estoque Baixo */}
            {lowStock && lowStock.products.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Produtos com Estoque Baixo
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Produtos que requerem atenção ou reabastecimento
                            </p>
                        </div>
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>

                    <div className="space-y-3">
                        {lowStock.products.map((product) => (
                            <div
                                key={product.id}
                                className={`p-4 rounded-lg border-l-4 ${product.status === 'OUT_OF_STOCK'
                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                    : product.quantity === 0
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-foreground">
                                                {product.name}
                                            </h3>
                                            <span
                                                className={`px-2 py-0.5 text-xs font-medium rounded-full ${product.status === 'OUT_OF_STOCK'
                                                    ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                                                    : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                                                    }`}
                                            >
                                                {product.status === 'OUT_OF_STOCK' ? 'SEM ESTOQUE' : 'ESTOQUE BAIXO'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                            <div>
                                                <p className="text-xs text-muted-foreground">SKU</p>
                                                <p className="text-sm font-medium text-foreground">
                                                    {product.sku}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Categoria</p>
                                                <p className="text-sm font-medium text-foreground">
                                                    {product.category}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Quantidade Atual</p>
                                                <p className="text-sm font-medium text-foreground">
                                                    {product.quantity} / {product.reorderThreshold}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Sugerido Recompra</p>
                                                <p className="text-sm font-medium text-foreground">
                                                    {product.reorderQuantity} unidades
                                                </p>
                                            </div>
                                        </div>
                                        {product.supplier && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Fornecedor: {product.supplier}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-xs text-muted-foreground">Custo</p>
                                        <p className="text-sm font-medium text-foreground">
                                            {formatCurrency(product.costPrice)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Resumo de estoque baixo */}
                    <div className="mt-6 p-4 bg-muted border border-border rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    Total em Alerta
                                </p>
                                <p className="text-2xl font-bold text-foreground">
                                    {lowStock.summary.total}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    Críticos
                                </p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {lowStock.summary.critical}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    Estoque Baixo
                                </p>
                                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {lowStock.summary.lowStock}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Movimentação de Estoque */}
            {stockMovement && (
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Movimentação de Estoque
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Top 10 produtos com maior movimentação no período
                            </p>
                        </div>
                        <Package className="w-5 h-5 text-gray-400" />
                    </div>

                    {/* Resumo de movimentações */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-muted border border-border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Total de Movimentações
                                </p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {stockMovement.summary.totalMovements}
                            </p>
                        </div>
                        <div className="p-4 bg-muted border border-border-green rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowUpCircle className="w-4 h-4 text-green-600" />
                                <p className="text-sm text-green-700">
                                    Entradas
                                </p>
                            </div>
                            <p className="text-2xl font-bold text-green-600">
                                {stockMovement.summary.byType.IN?.count || 0}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                                {stockMovement.summary.byType.IN?.quantity || 0} unidades
                            </p>
                        </div>
                        <div className="p-4 bg-muted border border-border-red rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowDownCircle className="w-4 h-4 text-red-600" />
                                <p className="text-sm text-red-700">
                                    Saídas
                                </p>
                            </div>
                            <p className="text-2xl font-bold text-red-600">
                                {stockMovement.summary.byType.OUT?.count || 0}
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                                {stockMovement.summary.byType.OUT?.quantity || 0} unidades
                            </p>
                        </div>
                        <div className="p-4 bg-muted border border-border-blue rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <RefreshCw className="w-4 h-4 text-blue-600" />
                                <p className="text-sm text-blue-700">
                                    Ajustes
                                </p>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">
                                {stockMovement.summary.byType.ADJUSTMENT?.count || 0}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                {stockMovement.summary.byType.ADJUSTMENT?.quantity || 0} unidades
                            </p>
                        </div>
                    </div>

                    <BarChartMultiple
                        data={movementChartData}
                        xAxisKey="name"
                        series={[
                            { dataKey: 'entradas', name: 'Entradas', color: '#10b981' },
                            { dataKey: 'saidas', name: 'Saídas', color: '#ef4444' },
                            { dataKey: 'ajustes', name: 'Ajustes', color: '#3b82f6' }
                        ]}
                        title=""
                        height={350}
                    />

                    {/* Tabela de movimentação */}
                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-secondary/50">
                                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                                        Produto
                                    </th>
                                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                                        Categoria
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-green-700 dark:text-green-300">
                                        Entradas
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-red-700 dark:text-red-300">
                                        Saídas
                                    </th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-blue-700 dark:text-blue-300">
                                        Ajustes
                                    </th>
                                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockMovement.byProduct
                                    .sort((a, b) => (b.in + b.out + b.adjustment) - (a.in + a.out + a.adjustment))
                                    .map((product) => (
                                        <tr
                                            key={product.productId}
                                            className={cn(
                                                "border-b border-border bg-card last:border-0 hover:bg-secondary/30 transition-colors",
                                                "animate-fade-in"
                                            )}
                                        >
                                                <td className="py-3 px-4 text-sm text-foreground">
                                                {product.productName}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                                {product.category}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-right text-green-600 dark:text-green-400 font-medium">
                                                +{product.in}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-right text-red-600 dark:text-red-400 font-medium">
                                                -{product.out}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-right text-blue-600 dark:text-blue-400 font-medium">
                                                {product.adjustment > 0 ? '+' : ''}{product.adjustment}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-right text-foreground font-medium">
                                                {product.in + product.out + product.adjustment}
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

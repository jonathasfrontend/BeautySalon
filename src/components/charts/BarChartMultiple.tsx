/**
 * Bar Chart Component - Multiple Series
 * 
 * Gráfico de barras para múltiplas séries de dados lado a lado.
 * 
 * @example
 * ```tsx
 * <BarChartMultiple
 *   data={[
 *     { month: 'Jan', receita: 4000, despesa: 2400 },
 *     { month: 'Fev', receita: 3000, despesa: 1398 },
 *   ]}
 *   xAxisKey="month"
 *   series={[
 *     { dataKey: 'receita', name: 'Receita', color: '#10b981' },
 *     { dataKey: 'despesa', name: 'Despesa', color: '#ef4444' },
 *   ]}
 *   title="Receita vs Despesa"
 * />
 * ```
 */

'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface BarSeries {
  dataKey: string;
  name: string;
  color: string;
}

export interface BarChartMultipleProps {
  data: Array<Record<string, any>>;
  xAxisKey: string;
  series: BarSeries[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  formatValue?: (value: number) => string;
  formatLabel?: (value: string) => string;
  stacked?: boolean;
}

export function BarChartMultiple({
  data,
  xAxisKey,
  series,
  title,
  height = 300,
  showLegend = true,
  showGrid = true,
  formatValue,
  formatLabel,
  stacked = false,
}: BarChartMultipleProps) {
  const defaultFormatValue = (value: number) => {
    if (formatValue) return formatValue(value);
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const defaultFormatLabel = (value: string) => {
    if (formatLabel) return formatLabel(value);
    return value;
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          )}
          <XAxis
            dataKey={xAxisKey}
            tickFormatter={defaultFormatLabel}
            className="text-sm text-gray-600 dark:text-gray-400"
          />
          <YAxis
            tickFormatter={defaultFormatValue}
            className="text-sm text-gray-600 dark:text-gray-400"
          />
          <Tooltip
            formatter={(value: any) => defaultFormatValue(Number(value))}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          />
          {showLegend && <Legend />}
          {series.map((s) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name}
              fill={s.color}
              radius={[4, 4, 0, 0]}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartMultiple;

/**
 * Area Chart Component - Stacked
 * 
 * Gráfico de área empilhado para visualizar tendências de múltiplas séries.
 * Ideal para mostrar composição ao longo do tempo.
 * 
 * @example
 * ```tsx
 * <AreaChartStacked
 *   data={[
 *     { date: '01/12', servicos: 4000, produtos: 2400, outros: 1000 },
 *     { date: '02/12', servicos: 3000, produtos: 1398, outros: 800 },
 *   ]}
 *   xAxisKey="date"
 *   series={[
 *     { dataKey: 'servicos', name: 'Serviços', color: '#8b5cf6' },
 *     { dataKey: 'produtos', name: 'Produtos', color: '#3b82f6' },
 *     { dataKey: 'outros', name: 'Outros', color: '#10b981' },
 *   ]}
 *   title="Receita por Categoria"
 * />
 * ```
 */

'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface AreaSeries {
  dataKey: string;
  name: string;
  color: string;
}

export interface AreaChartStackedProps {
  data: Array<Record<string, any>>;
  xAxisKey: string;
  series: AreaSeries[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  formatValue?: (value: number) => string;
  formatLabel?: (value: string) => string;
}

export function AreaChartStacked({
  data,
  xAxisKey,
  series,
  title,
  height = 300,
  showLegend = true,
  showGrid = true,
  formatValue,
  formatLabel,
}: AreaChartStackedProps) {
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
        <AreaChart
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
            <Area
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stackId="1"
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AreaChartStacked;

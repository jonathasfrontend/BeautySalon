/**
 * Bar Chart Component - Single Series
 * 
 * Gráfico de barras simples para visualizar uma série de dados.
 * 
 * @example
 * ```tsx
 * <BarChartSingle
 *   data={[
 *     { name: 'Jan', value: 400 },
 *     { name: 'Fev', value: 300 },
 *   ]}
 *   dataKey="value"
 *   xAxisKey="name"
 *   title="Vendas Mensais"
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
  Cell,
} from 'recharts';

export interface BarChartSingleProps {
  data: Array<Record<string, any>>;
  dataKey: string;
  xAxisKey: string;
  title?: string;
  color?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  formatValue?: (value: number) => string;
  formatLabel?: (value: string) => string;
}

export function BarChartSingle({
  data,
  dataKey,
  xAxisKey,
  title,
  color = '#8b5cf6',
  height = 300,
  showLegend = false,
  showGrid = true,
  formatValue,
  formatLabel,
}: BarChartSingleProps) {
  const defaultFormatValue = (value: number) => {
    if (formatValue) return formatValue(value);
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const defaultFormatLabel = (value: string) => {
    if (formatLabel) return formatLabel(value);
    return value;
  };
    const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground mb-1">
            {defaultFormatLabel(label)}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              {entry.name}: <span className="font-medium">{defaultFormatValue(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };


  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          )}
          <XAxis
            dataKey={xAxisKey}
            tickFormatter={defaultFormatLabel}
            className="text-sm text-muted-foreground"
          />
          <YAxis
            tickFormatter={defaultFormatValue}
            className="text-sm text-muted-foreground"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
          {showLegend && <Legend />}
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartSingle;

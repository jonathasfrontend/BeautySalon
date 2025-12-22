/**
 * Area Chart Component - With Legend
 * 
 * Gráfico de área com legendas interativas para mostrar/ocultar séries.
 * Não empilhado, mostra cada série de forma independente.
 * 
 * @example
 * ```tsx
 * <AreaChartWithLegend
 *   data={[
 *     { month: 'Jan', atual: 4000, anterior: 2400 },
 *     { month: 'Fev', atual: 3000, anterior: 1398 },
 *   ]}
 *   xAxisKey="month"
 *   series={[
 *     { dataKey: 'atual', name: 'Período Atual', color: '#8b5cf6' },
 *     { dataKey: 'anterior', name: 'Período Anterior', color: '#94a3b8' },
 *   ]}
 *   title="Comparação de Períodos"
 * />
 * ```
 */

'use client';

import React, { useState } from 'react';
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

export interface AreaChartWithLegendProps {
  data: Array<Record<string, any>>;
  xAxisKey: string;
  series: AreaSeries[];
  title?: string;
  height?: number;
  showGrid?: boolean;
  formatValue?: (value: number) => string;
  formatLabel?: (value: string) => string;
  allowToggleSeries?: boolean;
}

export function AreaChartWithLegend({
  data,
  xAxisKey,
  series,
  title,
  height = 300,
  showGrid = true,
  formatValue,
  formatLabel,
  allowToggleSeries = true,
}: AreaChartWithLegendProps) {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const defaultFormatValue = (value: number) => {
    if (formatValue) return formatValue(value);
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const defaultFormatLabel = (value: string) => {
    if (formatLabel) return formatLabel(value);
    return value;
  };

  const handleLegendClick = (dataKey: string) => {
    if (!allowToggleSeries) return;

    setHiddenSeries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey);
      } else {
        newSet.add(dataKey);
      }
      return newSet;
    });
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {payload.map((entry: any, index: number) => {
          const isHidden = hiddenSeries.has(entry.dataKey);
          
          return (
            <button
              key={`legend-${index}`}
              onClick={() => handleLegendClick(entry.dataKey)}
              className={`
                flex items-center gap-2 px-3 py-1 rounded-md transition-all
                ${allowToggleSeries ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : ''}
                ${isHidden ? 'opacity-40' : 'opacity-100'}
              `}
              disabled={!allowToggleSeries}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">
                {entry.value}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-foreground">
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
            className="text-sm text-muted-foreground"
          />
          <YAxis
            tickFormatter={defaultFormatValue}
            className="text-sm text-muted-foreground"
          />
          <Tooltip
            formatter={(value: any) => defaultFormatValue(Number(value))}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          />
          <Legend content={<CustomLegend />} />
          {series.map((s) => {
            const isHidden = hiddenSeries.has(s.dataKey);
            
            return (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.3}
                strokeWidth={2}
                hide={isHidden}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
      {allowToggleSeries && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Clique nas legendas para mostrar/ocultar séries
        </p>
      )}
    </div>
  );
}

export default AreaChartWithLegend;

/**
 * Bar Chart Component - Interactive
 * 
 * Gráfico de barras interativo com hover detalhado, click handlers e filtros visuais.
 * 
 * @example
 * ```tsx
 * <BarChartInteractive
 *   data={[
 *     { name: 'Produto A', value: 400, category: 'Cat1' },
 *     { name: 'Produto B', value: 300, category: 'Cat2' },
 *   ]}
 *   dataKey="value"
 *   xAxisKey="name"
 *   title="Produtos Interativos"
 *   onBarClick={(item) => console.log('Clicked:', item)}
 * />
 * ```
 */

'use client';

import React, { useState } from 'react';
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

export interface BarChartInteractiveProps {
  data: Array<Record<string, any>>;
  dataKey: string;
  xAxisKey: string;
  title?: string;
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  formatValue?: (value: number) => string;
  formatLabel?: (value: string) => string;
  onBarClick?: (data: any, index: number) => void;
  highlightKey?: string;
}

const DEFAULT_COLORS = [
  '#8b5cf6',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#6366f1',
  '#14b8a6',
];

export function BarChartInteractive({
  data,
  dataKey,
  xAxisKey,
  title,
  colors = DEFAULT_COLORS,
  height = 300,
  showLegend = false,
  showGrid = true,
  formatValue,
  formatLabel,
  onBarClick,
  highlightKey,
}: BarChartInteractiveProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const defaultFormatValue = (value: number) => {
    if (formatValue) return formatValue(value);
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const defaultFormatLabel = (value: string) => {
    if (formatLabel) return formatLabel(value);
    return value;
  };

  const handleBarClick = (data: any, index: number) => {
    setActiveIndex(index);
    if (onBarClick) {
      onBarClick(data, index);
    }
  };

  const handleMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  const getBarColor = (index: number) => {
    return colors[index % colors.length];
  };

  const getBarOpacity = (index: number) => {
    if (activeIndex === null) return 1;
    return activeIndex === index ? 1 : 0.5;
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
          {highlightKey && payload[0].payload[highlightKey] && (
            <p className="text-xs text-muted-foreground mt-1 border-t pt-1">
              {payload[0].payload[highlightKey]}
            </p>
          )}
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
          onMouseLeave={handleMouseLeave}
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
          <Bar
            dataKey={dataKey}
            radius={[4, 4, 0, 0]}
            onClick={handleBarClick}
            onMouseEnter={handleMouseEnter}
            className="cursor-pointer"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(index)}
                opacity={getBarOpacity(index)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartInteractive;

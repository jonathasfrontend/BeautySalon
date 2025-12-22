/**
 * KPI Card Component
 * 
 * Card para exibir indicadores-chave de performance (KPIs).
 * Suporta trends, comparações e variações percentuais.
 */

'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  colorScheme?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  isLoading?: boolean;
}

const colorSchemes = {
  default: {
    bg: 'bg-card',
    iconBg: 'bg-gray-100',
    text: 'text-gray-500',
    border: 'border-border',
  },
  success: {
    bg: 'bg-card',
    iconBg: 'bg-green-100',
    text: 'text-green-600',
    border: 'border-border-green',
  },
  warning: {
    bg: 'bg-card',
    iconBg: 'bg-yellow-100',
    text: 'text-yellow-600',
    border: 'border-border-yellow',
  },
  danger: {
    bg: 'bg-card',
    iconBg: 'bg-red-100',
    text: 'text-red-600',
    border: 'border-border-red',
  },
  info: {
    bg: 'bg-card',
    iconBg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-border-blue',
  },
};

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  colorScheme = 'default',
  isLoading = false,
}: KPICardProps) {
  const colors = colorSchemes[colorScheme];

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'neutral':
        return <Minus className="w-4 h-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      case 'neutral':
        return 'text-muted-foreground';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <div className={`rounded-lg border ${colors.border} p-6 ${colors.bg} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">
          {title}
        </p>
        {icon && (
          <div className={`p-2 rounded-lg ${colors.iconBg}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className={`text-3xl font-bold ${colors.text}`}>
          {value}
        </p>

        {(subtitle || trendValue) && (
          <div className="flex items-center gap-2 text-sm">
            {trend && getTrendIcon()}
            {trendValue && (
              <span className={`font-medium ${getTrendColor()}`}>
                {trendValue}
              </span>
            )}
            {subtitle && (
              <span className="text-muted-foreground">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default KPICard;

/**
 * Period Selector Component
 * 
 * Seletor de período com presets (hoje, semana, mês, etc.) e range customizado.
 */

'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import type { ReportPeriodPreset } from '@/types/reports';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';

export interface PeriodSelectorProps {
  period: ReportPeriodPreset;
  onPeriodChange: (period: ReportPeriodPreset) => void;
  onCustomRangeChange?: (startDate: string, endDate: string) => void;
  showCustomRange?: boolean;
}

const periodOptions: { value: ReportPeriodPreset; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Última Semana' },
  { value: 'month', label: 'Último Mês' },
  { value: 'quarter', label: 'Último Trimestre' },
  { value: 'year', label: 'Último Ano' },
  { value: 'custom', label: 'Período Personalizado' },
];

export function PeriodSelector({
  period,
  onPeriodChange,
  onCustomRangeChange,
  showCustomRange = true,
}: PeriodSelectorProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handlePeriodChange = (newPeriod: ReportPeriodPreset) => {
    onPeriodChange(newPeriod);
  };

  const handleCustomRangeApply = () => {
    if (startDate && endDate && onCustomRangeChange) {
      onCustomRangeChange(startDate, endDate);
    }
  };

  return (
    <div className="space-y-4">
      {/* Period Presets */}
      <div className="flex flex-wrap gap-2">
        {periodOptions
          .filter((opt) => showCustomRange || opt.value !== 'custom')
          .map((opt) => (
            <button
              key={opt.value}
              onClick={() => handlePeriodChange(opt.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  period === opt.value
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/60'
                }
              `}
            >
              {opt.label}
            </button>
          ))}
      </div>

      {/* Custom Range Inputs */}
      {showCustomRange && period === 'custom' && (
        <div className="flex items-end gap-3 p-4 bg-muted rounded-lg border border-border">
          <div className="flex-1">
            <Label className="block text-sm font-medium text-muted-foreground mb-1">
              Data Inicial
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className='bg-card'
            />
          </div>

          <div className="flex-1">
            <Label className="block text-sm font-medium text-muted-foreground mb-1">
              Data Final
            </Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className='bg-card'
              min={startDate}
            />
          </div>

          <Button
            variant="default"
            onClick={handleCustomRangeApply}
            disabled={!startDate || !endDate}
          >
            <Calendar className="w-4 h-4" />
            Aplicar
          </Button>
        </div>
      )}
    </div>
  );
}

export default PeriodSelector;

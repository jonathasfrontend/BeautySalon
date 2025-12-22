'use client';

import { useState } from 'react';
import { WorkSchedule } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '../ui/Checkbox';

interface ScheduleEditorProps {
  schedule?: WorkSchedule;
  onSave: (schedule: WorkSchedule) => Promise<void>;
  onCancel?: () => void;
  readOnly?: boolean;
}

const daysOfWeek = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

export function ScheduleEditor({ schedule, onSave, onCancel, readOnly = false }: ScheduleEditorProps) {
  const [loading, setLoading] = useState(false);
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>(
    schedule || {
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '18:00' },
      friday: { start: '09:00', end: '18:00' },
      saturday: null,
      sunday: null,
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(workSchedule);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setWorkSchedule((prev: WorkSchedule) => ({
      ...prev,
      [day]: prev[day as keyof WorkSchedule] === null
        ? { start: '09:00', end: '18:00' }
        : null,
    }));
  };

  const updateTime = (day: string, field: 'start' | 'end', value: string) => {
    setWorkSchedule((prev: WorkSchedule) => ({
      ...prev,
      [day]: prev[day as keyof WorkSchedule]
        ? { ...(prev[day as keyof WorkSchedule] as any), [field]: value }
        : { start: '09:00', end: '18:00' },
    }));
  };

  if (readOnly) {
    return (
      <div className="space-y-4">
        {daysOfWeek.map(({ key, label }) => {
          const daySchedule = workSchedule[key as keyof WorkSchedule];
          const isActive = daySchedule !== null;

          return (
            <div
              key={key}
              className="bg-muted border border-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">
                  {label}
                </span>
                {isActive ? (
                  <span className="text-sm text-muted-foreground">
                    {(daySchedule as any)?.start} - {(daySchedule as any)?.end}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Folga
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (!readOnly) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {daysOfWeek.map(({ key, label }) => {
          const daySchedule = workSchedule[key as keyof WorkSchedule];
          const isActive = daySchedule !== null;

          return (
            <div
              key={key}
              className="bg-background border border-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center cursor-pointer">
                  <Checkbox
                    id="show-blocked"
                    checked={isActive}
                    onCheckedChange={() => {
                      toggleDay(key);
                    }}
                  />
                  <span className="ml-2 font-medium text-foreground">
                    {label}
                  </span>
                </label>
              </div>

              {isActive && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`${key}-start`}>Início</Label>
                    <Input
                      id={`${key}-start`}
                      type="time"
                      value={(daySchedule as any)?.start || '09:00'}
                      onChange={(e) => updateTime(key, 'start', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${key}-end`}>Fim</Label>
                    <Input
                      id={`${key}-end`}
                      type="time"
                      value={(daySchedule as any)?.end || '18:00'}
                      onChange={(e) => updateTime(key, 'end', e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="w-full h-full pt-3 flex justify-between border-t border-border">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Horários'}
          </Button>
        </div>
      </form>
    );
  }
}

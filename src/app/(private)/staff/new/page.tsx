'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { staffService } from '@/services/staff.service';
import { StaffForm } from '@/components/staff/StaffForm';
import { ScheduleEditor } from '@/components/staff/ScheduleEditor';
import { Button } from '@/components/ui/Button';
import { WorkSchedule } from '@/types';

function NewStaffContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId'); // Recebe o userId da query
  const [error, setError] = useState('');
  const [step, setStep] = useState<'info' | 'schedule'>('info');
  const [staffData, setStaffData] = useState<any>(null);

  const handleInfoSubmit = async (data: any) => {
    setStaffData(data);
    setStep('schedule');
  };

  const handleScheduleSubmit = async (schedule: WorkSchedule) => {
    try {
      setError('');
      await staffService.create({
        ...staffData,
        workSchedule: schedule,
      });
      router.push('/staff');
    } catch (err: any) {
      console.error('Erro ao criar profissional:', err);
      setError(err.message || 'Erro ao criar profissional');
    }
  };

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <div className='flex items-center gap-4'>
          <Button variant="secondary" onClick={() => step === 'schedule' ? setStep('info') : router.back()}>
            ← Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            Novo Profissional
          </h1>
        </div>
        <p className="text-muted-foreground mt-1">
          {step === 'info'
            ? userId
              ? 'Passo 2 de 2: Configurar perfil de profissional'
              : 'Passo 1: Informações básicas'
            : 'Passo 2: Horário de trabalho'
          }
        </p>
      </div>

      {userId && step === 'info' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            ✅ Usuário criado com sucesso! Agora configure as informações do profissional.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        {step === 'info' ? (
          <StaffForm
            onSubmit={handleInfoSubmit}
            onCancel={() => router.back()}
            preSelectedUserId={userId || undefined}
          />
        ) : (
          <ScheduleEditor
            onSave={handleScheduleSubmit}
            onCancel={() => setStep('info')}
          />
        )}
      </div>
    </div>
  );
}

export default function NewStaffPage() {
  return (
    <Suspense fallback={
      <div className="w-full mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">
            Novo Profissional
          </h1>
          <p className="text-muted-foreground mt-1">
            Carregando...
          </p>
        </div>
      </div>
    }>
      <NewStaffContent />
    </Suspense>
  );
}

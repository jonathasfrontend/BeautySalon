'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { waitlistService } from '@/services/waitlist.service';
import { WaitlistForm } from '@/components/waitlist/WaitlistForm';
import { Button } from '@/components/ui/Button';

export default function NewWaitlistPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (data: any) => {
    try {
      setError('');
      await waitlistService.create(data);
      router.push('/waitlist');
    } catch (err: any) {
      console.error('Erro ao adicionar à lista de espera:', err);
      setError(err.message || 'Erro ao adicionar à lista de espera');
    }
  };

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <div className='flex items-center gap-4'>
          <Button variant="secondary" onClick={() => router.back()}>
            ← Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            Adicionar à Lista de Espera
          </h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Adicione um cliente interessado em um serviço
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <WaitlistForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { serviceService } from '@/services/service.service';
import { ServiceForm } from '@/components/services/ServiceForm';
import { Button } from '@/components/ui/Button';

export default function NewServicePage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (data: any) => {
    try {
      setError('');
      await serviceService.create(data);
      router.push('/services');
    } catch (err: any) {
      console.error('Erro ao criar serviço:', err);
      setError(err.message || 'Erro ao criar serviço');
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
            Novo Serviço
          </h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Cadastre um novo serviço no sistema
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <ServiceForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}

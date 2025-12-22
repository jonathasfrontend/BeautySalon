'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientService } from '@/services/client.service';
import { ClientForm } from '@/components/clients/ClientForm';
import { Button } from '@/components/ui/Button';

export default function NewClientPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (data: any) => {
    try {
      setError('');
      await clientService.create(data);
      router.push('/clients');
    } catch (err: any) {
      console.error('Erro ao criar cliente:', err);
      setError(err.message || 'Erro ao criar cliente');
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
            Novo Cliente
          </h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Cadastre um novo cliente no sistema
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <ClientForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}

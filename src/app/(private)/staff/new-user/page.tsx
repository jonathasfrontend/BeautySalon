'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/user.service';
import { UserForm } from '@/components/staff/UserForm';
import { Button } from '@/components/ui/Button';

export default function NewUserForStaffPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdUserId, setCreatedUserId] = useState<string>('');
  const [createdUserName, setCreatedUserName] = useState<string>('');

  const handleSubmit = async (data: any) => {
    try {
      setError('');
      setSuccess(false);

      const user = await userService.createUser(data);

      setCreatedUserId(user.id);
      setCreatedUserName(user.name);
      setSuccess(true);
    } catch (err: any) {
      console.error('Erro ao criar usuário:', err);
      setError(err.response?.data?.message || err.message || 'Erro ao criar usuário');
    }
  };

  const handleContinueToStaff = () => {
    // Redireciona para a página de criação de staff com o userId
    router.push(`/staff/new?userId=${createdUserId}`);
  };

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <div className='flex items-center gap-4'>
          <Button variant="secondary" onClick={() => router.back()}>
            ← Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            Criar Usuário para Profissional
          </h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Passo 1 de 2: Cadastre o usuário que será promovido a profissional
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-200 mb-2">
              ✅ Usuário criado com sucesso!
            </h3>
            <p className="text-green-800 dark:text-green-300">
              O usuário <strong>{createdUserName}</strong> foi cadastrado no sistema.
            </p>
            <p className="text-sm text-green-700 dark:text-green-400 mt-2">
              ID do usuário: <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded">{createdUserId}</code>
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleContinueToStaff}>
              Continuar para Cadastro de Profissional →
            </Button>
            <Button variant="outline" onClick={() => router.push('/staff')}>
              Ir para Lista de Profissionais
            </Button>
          </div>
        </div>
      )}

      {!success && (
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <UserForm
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            defaultRoleName="Profissional"
          />
        </div>
      )}
    </div>
  );
}

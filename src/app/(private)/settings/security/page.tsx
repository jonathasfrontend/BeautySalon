'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

/**
 * A API responde em inglês; a UI é pt-BR. Traduz apenas os erros conhecidos
 * e cai no texto genérico para o resto.
 */
function translatePasswordError(error: any): string {
  const message: string = error?.response?.data?.message ?? '';

  if (message.includes('Current password is incorrect')) {
    return 'Senha atual incorreta.';
  }
  if (message.includes('Forbidden') || message.includes('permission')) {
    return 'Você não tem permissão para alterar esta senha.';
  }
  if (message.includes('not found')) {
    return 'Usuário não encontrado.';
  }
  if (error?.response?.status === 400) {
    return 'Senha atual incorreta.';
  }

  return 'Erro ao alterar senha. Verifique se a senha atual está correta.';
}

export default function SettingsSecurityPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!user?.id) {
      toast.error('Sessão inválida. Faça login novamente.');
      return;
    }

    try {
      setSaving(true);
      await userService.changePassword(
        user.id,
        passwordData.currentPassword,
        passwordData.newPassword
      );
      toast.success('Senha alterada com sucesso!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(translatePasswordError(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => router.back()}>
            ← Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Segurança</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Gerencie a segurança da sua conta
        </p>
      </div>

      {/* Alterar Senha */}
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Alterar Senha</h2>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              required
              minLength={6}
            />
            <p className="text-sm text-muted-foreground mt-1">Mínimo de 6 caracteres</p>
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              required
              minLength={6}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="default" disabled={saving}>
              {saving ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </form>
      </div>

      {/* Informação da conta */}
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Conta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Usuário</p>
            <p className="font-medium text-foreground">{user?.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cargo</p>
            <p className="font-medium text-foreground">{user?.role?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Último acesso</p>
            <p className="font-medium text-foreground">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

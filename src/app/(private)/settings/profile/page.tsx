'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Dados do perfil
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Dados de alteração de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();

      if (userData) {
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
        });
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      alert('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Aqui você adicionaria a chamada para API de atualização de perfil
      // await userService.updateProfile(profileData);

      alert('Perfil atualizado com sucesso!');
      loadUserProfile();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setSaving(true);

      // Aqui você adicionaria a chamada para API de alteração de senha
      // await authService.changePassword(passwordData);

      alert('Senha alterada com sucesso!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert('Erro ao alterar senha. Verifique se a senha atual está correta.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className='flex items-center gap-4'>
          <Button variant="secondary" onClick={() => router.back()}>
            ← Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            Meu Perfil
          </h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Gerencie suas informações pessoais
        </p>
      </div>

      {/* Informações do Usuário */}
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {user?.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            <div className="mt-2">
              <Badge className="bg-blue-100 text-blue-800">
                {user?.role?.name || 'Usuário'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Edição de Perfil */}
      <div className="bg-card rounded-lg shadow-sm p-6 border border-">
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          Informações Pessoais
        </h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="default" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>

      {/* Alterar Senha */}
      <div className="bg-card rounded-lg shadow-sm p-6 border border-">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Segurança
          </h2>
          {!showPasswordForm && (
            <Button
              variant="outline"
              onClick={() => setShowPasswordForm(true)}
            >
              Alterar Senha
            </Button>
          )}
        </div>

        {showPasswordForm ? (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
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
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                required
                minLength={6}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Mínimo de 6 caracteres
              </p>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                required
                minLength={6}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="default" disabled={saving}>
                {saving ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            Mantenha sua conta segura alterando sua senha regularmente.
          </p>
        )}
      </div>

      {/* Informações da Conta */}
      <div className="bg-card rounded-lg shadow-sm p-6 border border-">
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          Informações da Conta
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cargo/Função</p>
            <p className="font-medium text-foreground">
              {user?.role?.name || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <p className="font-medium text-green-600 dark:text-green-400">
                {user?.isActive ? 'Ativo' : 'Inativo'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Membro desde</p>
            <p className="font-medium text-foreground">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('pt-BR')
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Último acesso</p>
            <p className="font-medium text-foreground">
              {user?.lastLogin
                ? new Date(user.lastLogin).toLocaleString('pt-BR')
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Permissões */}
      {user?.permissions && user.permissions.length > 0 && (
        <div className="bg-card rounded-lg shadow-sm p-6 border border-">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            Permissões
          </h2>
          <div className="flex flex-wrap gap-2">
            {user.permissions.map((permission, index) => (
              <Badge
                key={index}
                className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
              >
                {permission}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

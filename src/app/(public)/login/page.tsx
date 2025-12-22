'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import loginArt from '@/assets/bg2.png'
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await authService.login(data);
      
      // Busca o usuário completo com permissões
      const userWithPermissions = await authService.getCurrentUser();
      setUser(userWithPermissions);

      toast.success('Login realizado com sucesso!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-between">

      {/* Left Panel - Art */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">

        <div className="absolute top-8 left-8">
          <span className="text-2xl font-bold text-green-700 z-10">BeautySalon</span>
        </div>

        <img
          src={loginArt.src}
          alt="Abstract art"
          className="w-full h-full object-cover "
        />
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-background">
        {/* Card */}
        <div className="w-full max-w-md animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Entrar no Painel
          </h1>
          <p className="text-muted-foreground mb-8">
            Acesse com suas credenciais para gerenciar o salão
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="h-12 "
                  placeholder="seu@email.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-muted-foreground">
                Senha
              </Label>
              <div className="relative">
                <Input
                  {...register('password')}
                  type="password"
                  id="password"
                  className="h-12 "
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12"
              disabled={isLoading}
              variant="default"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Credenciais de teste:
            </p>
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>Admin:</strong> admin@salao.com / admin123</p>
              <p><strong>Recepção:</strong> recepcao@salao.com / reception123</p>
              <p><strong>Profissional:</strong> maria@salao.com / staff123</p>
            </div>
          </div> */}
        </div>

      </div>
    </div>
  );
}

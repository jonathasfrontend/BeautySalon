'use client';

import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  const settingsSections = [
    {
      title: 'Perfil do Usuário',
      description: 'Gerencie suas informações pessoais e credenciais',
      icon: '👤',
      href: '/settings/profile',
      color: 'blue',
    },
    {
      title: 'Configurações do Salão',
      description: 'Dados do estabelecimento, horário de funcionamento',
      icon: '🏢',
      href: '/settings/salon',
      color: 'purple',
    },
    {
      title: 'Notificações',
      description: 'Configure alertas e lembretes',
      icon: '🔔',
      href: '/settings/notifications',
      color: 'yellow',
    },
    {
      title: 'Integrações',
      description: 'WhatsApp, Email, pagamentos e outras integrações',
      icon: '🔗',
      href: '/settings/integrations',
      color: 'green',
    },
    {
      title: 'Segurança',
      description: 'Alterar senha, autenticação em dois fatores',
      icon: '🔒',
      href: '/settings/security',
      color: 'red',
    },
    {
      title: 'Backup e Dados',
      description: 'Exportar dados, fazer backup',
      icon: '💾',
      href: '/settings/backup',
      color: 'gray',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30',
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30',
      red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30',
      gray: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900/30',
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as preferências e configurações do sistema
        </p>
      </div>

      {/* Grid de Configurações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section, index) => (
          <button
            key={index}
            onClick={() => router.push(section.href)}
            className={`
              text-left p-6 rounded-lg border-2 transition-all
              ${getColorClasses(section.color)}
            `}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{section.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {section.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Informações do Sistema */}
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          Informações do Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Versão</p>
            <p className="font-medium text-foreground">1.0.0</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ambiente</p>
            <p className="font-medium text-foreground">
              {process.env.NODE_ENV === 'production' ? 'Produção' : 'Desenvolvimento'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Última Atualização</p>
            <p className="font-medium text-foreground">
              {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status do Sistema</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <p className="font-medium text-green-600 dark:text-green-400">Operacional</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

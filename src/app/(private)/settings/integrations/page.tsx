'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface IntegrationCard {
  name: string;
  description: string;
  icon: string;
}

const integrations: IntegrationCard[] = [
  {
    name: 'WhatsApp Business',
    description:
      'Confirmações e lembretes de agendamento via WhatsApp. A fila de envio (BullMQ) já existe no backend.',
    icon: '💬',
  },
  {
    name: 'E-mail (SMTP)',
    description:
      'Notificações por e-mail para clientes e equipe. Serviço de e-mail implementado no backend.',
    icon: '📧',
  },
  {
    name: 'Mercado Pago',
    description: 'Gateway de pagamento para agendamentos e vendas.',
    icon: '💳',
  },
  {
    name: 'Stripe',
    description: 'Gateway de pagamento internacional (stub implementado).',
    icon: '💳',
  },
  {
    name: 'Google Calendar',
    description: 'Sincronização de agenda com o Google Calendar.',
    icon: '📅',
  },
];

export default function SettingsIntegrationsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => router.back()}>
            ← Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Integrações</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Serviços externos conectados ao sistema
        </p>
      </div>

      {/* Nota de configuração */}
      <div className="p-4 rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          ℹ️ As integrações são configuradas via variáveis de ambiente no servidor
          (<code className="px-1 rounded bg-muted">backend/.env</code>). Credenciais nunca
          aparecem nesta tela.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="bg-card rounded-lg shadow-sm p-6 border border-border"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{integration.icon}</span>
              <h3 className="text-lg font-semibold text-foreground">{integration.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{integration.description}</p>
            <div className="mt-3">
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                Configurado no servidor
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

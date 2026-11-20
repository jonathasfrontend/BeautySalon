'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { clientService } from '@/services/client.service';
import { useAuthStore } from '@/store/auth.store';

const EXPORT_PERMISSION = 'clients.export';

export default function SettingsBackupPage() {
  const router = useRouter();
  const { user, permissions } = useAuthStore();
  const [exporting, setExporting] = useState(false);

  const canExport = !!user && permissions.includes(EXPORT_PERMISSION);

  const handleExportClientsCSV = async () => {
    setExporting(true);
    try {
      const { blob, count } = await clientService.exportCsv();

      if (count === 0) {
        toast.error('Nenhum cliente para exportar');
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `clientes-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exportados ${count} clientes`);
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 403) {
        toast.error('Você não tem permissão para exportar dados de clientes.');
      } else {
        toast.error('Erro ao exportar clientes. Tente novamente.');
      }
    } finally {
      setExporting(false);
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
          <h1 className="text-3xl font-bold text-foreground">Backup e Dados</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Exporte dados do sistema para planilhas
        </p>
      </div>

      {/* Exportar clientes */}
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <h2 className="text-lg font-semibold mb-2 text-foreground">Exportar Clientes (CSV)</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Gera um arquivo CSV com todos os clientes (nome, contato, pontos de fidelidade).
          Abre direto no Excel ou Google Sheets.
        </p>

        {canExport ? (
          <Button variant="default" onClick={handleExportClientsCSV} disabled={exporting}>
            {exporting ? 'Exportando...' : 'Exportar clientes (CSV)'}
          </Button>
        ) : (
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Exportação de dados de clientes é restrita a administradores.
              Fale com o administrador do salão para solicitar o arquivo.
            </p>
          </div>
        )}
      </div>

      {/* Relatórios exportáveis */}
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <h2 className="text-lg font-semibold mb-2 text-foreground">Relatórios Completos</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Os relatórios do sistema incluem download de dados consolidados (financeiro,
          agendamentos, produtos, clientes e comissões).
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => router.push('/reports')}>
            Ver Relatórios
          </Button>
          <Button variant="outline" onClick={() => router.push('/reports/complete')}>
            Relatório Completo
          </Button>
        </div>
      </div>

      {/* Banco de dados */}
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <h2 className="text-lg font-semibold mb-2 text-foreground">Banco de Dados</h2>
        <p className="text-sm text-muted-foreground">
          O banco (Postgres/Neon) possui backup automático do provedor. Migrações ficam
          versionadas em <code className="px-1 rounded bg-muted">backend/prisma/migrations</code>.
        </p>
      </div>
    </div>
  );
}

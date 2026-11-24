'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Settings, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useFinanceSettings } from '@/hooks/useFinance';
import { financeService } from '@/services/finance.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ErrorState } from '@/components/finance/common/ErrorState';
import { TableSkeleton } from '@/components/finance/common/TableSkeleton';
import { errorMessage } from '@/lib/error';
import { centsToInputValue, num, parseMoneyInput } from '@/lib/money';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const permissions = useAuthStore((state) => state.permissions);
  const canSettings = permissions.includes('finance.settings');

  const { data, isLoading, error, refresh } = useFinanceSettings();

  const [requireOpenCashSession, setRequireOpenCashSession] = useState(false);
  const [cashClosingTolerance, setCashClosingTolerance] = useState('0,00');
  const [matchWindowDays, setMatchWindowDays] = useState('3');
  const [autoConfirmScore, setAutoConfirmScore] = useState('');
  const [cardTolerancePct, setCardTolerancePct] = useState('0,5');
  const [fileRetentionDays, setFileRetentionDays] = useState('365');
  const [enableOverdueAlerts, setEnableOverdueAlerts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!canSettings) router.push('/financeiro');
  }, [canSettings, router]);

  useEffect(() => {
    if (!data) return;
    setRequireOpenCashSession(data.requireOpenCashSession);
    setCashClosingTolerance(centsToInputValue(toCentsSafe(data.cashClosingTolerance)));
    setMatchWindowDays(String(data.matchWindowDays));
    setAutoConfirmScore(
      data.autoConfirmScore == null ? '' : String(data.autoConfirmScore).replace('.', ',')
    );
    setCardTolerancePct(String(num(data.cardTolerancePct)).replace('.', ','));
    setFileRetentionDays(String(data.fileRetentionDays));
    setEnableOverdueAlerts(data.enableOverdueAlerts);
  }, [data]);

  if (!canSettings) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setServerError(null);
    setSubmitting(true);
    try {
      const scoreRaw = autoConfirmScore.trim().replace(',', '.');
      const score = scoreRaw === '' ? null : Number.parseFloat(scoreRaw);
      if (score !== null && (!Number.isFinite(score) || score < 0 || score > 1)) {
        setServerError('Autoconfirmação deve ficar entre 0 e 1');
        return;
      }
      await financeService.updateSettings({
        requireOpenCashSession,
        cashClosingTolerance: parseMoneyInput(cashClosingTolerance) / 100,
        matchWindowDays: Number(matchWindowDays) || 0,
        autoConfirmScore: score,
        cardTolerancePct: toNumberBR(cardTolerancePct),
        fileRetentionDays: Number(fileRetentionDays) || 0,
        enableOverdueAlerts,
      });
      toast.success('Configurações salvas');
      await refresh();
    } catch (err) {
      setServerError(errorMessage(err, 'Erro ao salvar configurações'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/financeiro/cadastros')}
          aria-label="Voltar para cadastros"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="rounded-lg bg-primary/10 p-2">
          <Settings className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Configurações financeiras</h2>
          <p className="text-sm text-muted-foreground">
            Regras de caixa, conciliação e alertas da empresa
          </p>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="bg-card rounded-lg border border-border">
          <TableSkeleton rows={6} cols={2} />
        </div>
      ) : error ? (
        <div className="bg-card rounded-lg border border-border">
          <ErrorState
            message={errorMessage(error, 'Erro ao carregar configurações')}
            onRetry={() => refresh()}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="bg-card rounded-lg border border-border p-6 space-y-4">
            <h3 className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              Caixa
            </h3>

            <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
              <input
                type="checkbox"
                checked={requireOpenCashSession}
                onChange={(event) => setRequireOpenCashSession(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-input"
              />
              <span>
                Exigir sessão de caixa aberta para registrar vendas em dinheiro
                <span className="block text-xs text-muted-foreground">
                  Bloqueia lançamentos em dinheiro quando nenhum caixa está aberto.
                </span>
              </span>
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="settings-tolerance">Tolerância de fechamento (R$)</Label>
                <Input
                  id="settings-tolerance"
                  value={cashClosingTolerance}
                  onChange={(event) => setCashClosingTolerance(event.target.value)}
                  inputMode="decimal"
                />
                <p className="text-xs text-muted-foreground">
                  Diferenças acima deste valor exigem justificativa no fechamento.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-alerts">Alertas de vencimento</Label>
                <label className="flex h-10 cursor-pointer items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={enableOverdueAlerts}
                    onChange={(event) => setEnableOverdueAlerts(event.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  Enviar alertas de contas vencidas
                </label>
              </div>
            </div>
          </section>

          <section className="bg-card rounded-lg border border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Conciliação (Fase 2)</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="settings-window">Janela de match (dias)</Label>
                <Input
                  id="settings-window"
                  type="number"
                  min={0}
                  max={30}
                  value={matchWindowDays}
                  onChange={(event) => setMatchWindowDays(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Tolerância de data entre extrato e lançamento.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-score">Autoconfirmação (0–1)</Label>
                <Input
                  id="settings-score"
                  value={autoConfirmScore}
                  onChange={(event) => setAutoConfirmScore(event.target.value)}
                  placeholder="vazio = sempre confirmar"
                  inputMode="decimal"
                />
                <p className="text-xs text-muted-foreground">
                  Acima da pontuação o match é confirmado sem revisão.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-card-tolerance">Tolerância de cartão (%)</Label>
                <Input
                  id="settings-card-tolerance"
                  value={cardTolerancePct}
                  onChange={(event) => setCardTolerancePct(event.target.value)}
                  inputMode="decimal"
                />
              </div>
            </div>
          </section>

          <section className="bg-card rounded-lg border border-border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Arquivos</h3>
            <div className="max-w-xs space-y-2">
              <Label htmlFor="settings-retention">Retenção de extratos (dias)</Label>
              <Input
                id="settings-retention"
                type="number"
                min={0}
                max={3650}
                value={fileRetentionDays}
                onChange={(event) => setFileRetentionDays(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Arquivos importados são apagados após este prazo.
              </p>
            </div>
          </section>

          {serverError && (
            <p role="alert" className="text-sm text-destructive">
              {serverError}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar configurações'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function toCentsSafe(value: number | string | null | undefined): number {
  return Math.round(num(value) * 100);
}

function toNumberBR(raw: string): number {
  const normalized = raw.trim().replace(/\./g, '').replace(',', '.');
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

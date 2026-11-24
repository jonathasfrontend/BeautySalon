'use client';

import {
  AlertTriangle,
  Ban,
  CalendarClock,
  CheckCircle2,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { PayableStatus, ReceivableStatus } from '@/types/finance';

type Variant = 'success' | 'warning' | 'error' | 'outline' | 'secondary';

interface StatusConfig {
  label: string;
  variant: Variant;
  Icon: typeof Clock;
}

const PAYABLE: Record<PayableStatus, StatusConfig> = {
  PENDING: { label: 'Pendente', variant: 'warning', Icon: Clock },
  DUE_TODAY: { label: 'Vence hoje', variant: 'warning', Icon: CalendarClock },
  OVERDUE: { label: 'Vencida', variant: 'error', Icon: AlertTriangle },
  PAID: { label: 'Paga', variant: 'success', Icon: CheckCircle2 },
  CANCELED: { label: 'Cancelada', variant: 'outline', Icon: Ban },
};

const RECEIVABLE: Record<ReceivableStatus, StatusConfig> = {
  PENDING: { label: 'Pendente', variant: 'warning', Icon: Clock },
  PAID: { label: 'Recebida', variant: 'success', Icon: CheckCircle2 },
  OVERDUE: { label: 'Atrasada', variant: 'error', Icon: AlertTriangle },
  REFUNDED: { label: 'Estornada', variant: 'outline', Icon: RotateCcw },
};

/**
 * Badge com ÍCONE + TEXTO nunca só cor (spec §10.2, a11y).
 */
export function StatusBadge({
  status,
  kind = 'payable',
}: {
  status: PayableStatus | ReceivableStatus;
  kind?: 'payable' | 'receivable';
}) {
  const config =
    kind === 'payable'
      ? PAYABLE[status as PayableStatus]
      : RECEIVABLE[status as ReceivableStatus];
  if (!config) return null;

  const { label, variant, Icon } = config;
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </Badge>
  );
}

export default StatusBadge;

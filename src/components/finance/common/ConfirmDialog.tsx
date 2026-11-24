'use client';

import { useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  /** Quando definido, o usuário precisa digitar exatamente este texto. */
  requireText?: string;
  /** Quando definido, o motivo é obrigatório (anular, reabrir...). */
  requireReason?: boolean;
  reasonLabel?: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

/**
 * Confirmação em duas etapas para ações destrutivas (spec §10.2):
 * menu → este diálogo → confirmação explícita (com texto/motivo quando aplicável).
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  destructive = true,
  requireText,
  requireReason = false,
  reasonLabel = 'Motivo',
  loading = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [text, setText] = useState('');
  const [reason, setReason] = useState('');

  const textOk = !requireText || text.trim() === requireText;
  const reasonOk = !requireReason || reason.trim().length > 0;

  const handleConfirm = () => {
    if (!textOk || !reasonOk || loading) return;
    onConfirm(requireReason ? reason.trim() : undefined);
  };

  return (
    <Modal
      isOpen={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            size="sm"
            onClick={handleConfirm}
            disabled={!textOk || !reasonOk || loading}
          >
            {loading ? 'Aguarde...' : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-3">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <div className="text-sm text-foreground">{message}</div>
        </div>

        {requireReason && (
          <div className="space-y-2">
            <Label htmlFor="confirm-reason">{reasonLabel} *</Label>
            <Input
              id="confirm-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Descreva o motivo"
              maxLength={500}
              autoFocus
            />
          </div>
        )}

        {requireText && (
          <div className="space-y-2">
            <Label htmlFor="confirm-text">
              Digite <span className="font-mono font-semibold">{requireText}</span> para confirmar
            </Label>
            <Input
              id="confirm-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={requireText}
              autoFocus={!requireReason}
            />
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}

export default ConfirmDialog;

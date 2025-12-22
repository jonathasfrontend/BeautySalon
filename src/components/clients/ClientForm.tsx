'use client';

import { useState } from 'react';
import { Client } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '../ui/Checkbox';
import { FilePlus, RotateCcw, X } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: Partial<Client>) => Promise<void>;
  onCancel?: () => void;
}

export function ClientForm({ client, onSubmit, onCancel }: ClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: client?.name || '',
    phone: client?.phone || '',
    email: client?.email || '',
    cpf: client?.cpf || '',
    birthdate: client?.birthdate ? new Date(client.birthdate).toISOString().split('T')[0] : '',
    notes: client?.notes || '',
    consentLGPD: client?.consentLGPD ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData: any = {
        name: formData.name,
        phone: formData.phone.replace(/\D/g, ''), // Remove formatação do telefone
        email: formData.email || undefined,
        cpf: formData.cpf ? formData.cpf.replace(/\D/g, '') : undefined, // Remove formatação do CPF
        notes: formData.notes || undefined,
        consentLGPD: formData.consentLGPD,
      };

      if (formData.birthdate) {
        submitData.birthdate = new Date(formData.birthdate).toISOString();
      }

      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Nome Completo *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Ex: Maria Silva"
          />
        </div>

        <div>
          <Label htmlFor="phone">Telefone *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value);
              setFormData({ ...formData, phone: formatted });
            }}
            required
            placeholder="(11) 99999-9999"
            maxLength={15}
          />
        </div>

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="cliente@email.com"
          />
        </div>

        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            type="text"
            value={formData.cpf}
            onChange={(e) => {
              const formatted = formatCPF(e.target.value);
              setFormData({ ...formData, cpf: formatted });
            }}
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </div>

        <div>
          <Label htmlFor="birthdate">Data de Nascimento</Label>
          <Input
            id="birthdate"
            type="date"
            value={formData.birthdate}
            onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-lg bg-muted"
          placeholder="Preferências, alergias, observações..."
        />
      </div>

      <div className="flex items-center">
        <Checkbox
          id="show-blocked"
          checked={formData.consentLGPD}
          onCheckedChange={(checked: boolean) => setFormData({ ...formData, consentLGPD: checked })}
        />

        <label htmlFor="consent" className="ml-2 block text-sm text-muted-foreground">
          Cliente consentiu com o uso de dados (LGPD)
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            <X className="h-4 w-4" />
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading} variant="success">
          {loading ? <LoadingSpinner /> : client ? <RotateCcw className="h-4 w-4" /> : <FilePlus className="h-4 w-4" />}
          {loading ? 'Salvando...' : client ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}

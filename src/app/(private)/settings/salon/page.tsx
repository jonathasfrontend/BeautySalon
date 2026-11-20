'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

const STORAGE_KEY = 'salon_settings';

interface SalonData {
  name: string;
  phone: string;
  address: string;
  openTime: string;
  closeTime: string;
}

const DEFAULT_SALON: SalonData = {
  name: '',
  phone: '',
  address: '',
  openTime: '09:00',
  closeTime: '18:00',
};

export default function SettingsSalonPage() {
  const router = useRouter();
  const [data, setData] = useState<SalonData>(DEFAULT_SALON);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setData({ ...DEFAULT_SALON, ...JSON.parse(stored) });
      }
    } catch {
      // storage corrompido — usar default
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      toast.success('Configurações salvas localmente!');
    } catch {
      toast.error('Erro ao salvar no navegador');
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
          <h1 className="text-3xl font-bold text-foreground">Configurações do Salão</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Dados do estabelecimento e horário de funcionamento
        </p>
      </div>

      {/* Aviso de persistência local */}
      <div className="p-4 rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          ⚠️ <strong>Salvo localmente</strong> — estes dados ficam apenas neste navegador.
          Integração com a API está pendente.
        </p>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Dados do Salão</h2>
        <form onSubmit={handleSave} className="space-y-4 max-w-lg">
          <div>
            <Label htmlFor="salonName">Nome do Salão</Label>
            <Input
              id="salonName"
              type="text"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="Ex.: BeautySalon"
              required
            />
          </div>
          <div>
            <Label htmlFor="salonPhone">Telefone</Label>
            <Input
              id="salonPhone"
              type="tel"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              placeholder="(11) 3333-4444"
            />
          </div>
          <div>
            <Label htmlFor="salonAddress">Endereço</Label>
            <Input
              id="salonAddress"
              type="text"
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              placeholder="Rua, número, bairro"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="openTime">Abertura</Label>
              <Input
                id="openTime"
                type="time"
                value={data.openTime}
                onChange={(e) => setData({ ...data, openTime: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="closeTime">Fechamento</Label>
              <Input
                id="closeTime"
                type="time"
                value={data.closeTime}
                onChange={(e) => setData({ ...data, closeTime: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="default" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

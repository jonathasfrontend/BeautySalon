'use client';

import { useState, useEffect } from 'react';
import { CreateWaitlistData, UpdateWaitlistData, WaitlistEntry, Service } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { serviceService } from '@/services/service.service';
import { FilePlus, RotateCcw, X } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface WaitlistFormProps {
  entry?: WaitlistEntry;
  onSubmit: (data: CreateWaitlistData | UpdateWaitlistData) => Promise<void>;
  onCancel?: () => void;
}

export function WaitlistForm({ entry, onSubmit, onCancel }: WaitlistFormProps) {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [formData, setFormData] = useState({
    clientName: entry?.clientName || '',
    clientPhone: entry?.clientPhone || '',
    clientEmail: entry?.clientEmail || '',
    serviceId: entry?.serviceId || '',
    preferredDate: entry?.preferredDate ? new Date(entry.preferredDate).toISOString().split('T')[0] : '',
    notes: entry?.notes || '',
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const response = await serviceService.getAll({ isActive: true });
      setServices(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData: any = {
        clientName: formData.clientName,
        clientPhone: formData.clientPhone.replace(/\D/g, ''),
        clientEmail: formData.clientEmail || undefined,
        serviceId: formData.serviceId,
        notes: formData.notes || undefined,
      };

      if (formData.preferredDate) {
        submitData.preferredDate = new Date(formData.preferredDate).toISOString();
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

  // Agrupar serviços por categoria
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="clientName">Nome do Cliente *</Label>
          <Input
            id="clientName"
            type="text"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            required
            placeholder="Ex: João Silva"
          />
        </div>

        <div>
          <Label htmlFor="clientPhone">Telefone *</Label>
          <Input
            id="clientPhone"
            type="tel"
            value={formData.clientPhone}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value);
              setFormData({ ...formData, clientPhone: formatted });
            }}
            required
            placeholder="(11) 99999-9999"
            maxLength={15}
          />
        </div>

        <div>
          <Label htmlFor="clientEmail">E-mail</Label>
          <Input
            id="clientEmail"
            type="email"
            value={formData.clientEmail}
            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
            placeholder="cliente@email.com"
          />
        </div>

        <div>
          <Label htmlFor="serviceId">Serviço Desejado *</Label>
          <Select
            value={formData.serviceId}
            onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
            required
            disabled={loadingServices}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={loadingServices ? "Carregando..." : "Selecione um serviço"} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                <SelectGroup key={category}>
                  <SelectLabel>{category}</SelectLabel>
                  {categoryServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - R$ {service.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="preferredDate">Data Preferencial</Label>
          <Input
            id="preferredDate"
            type="date"
            value={formData.preferredDate}
            onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Data preferencial para o agendamento
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Preferência de horário, observações especiais..."
        />
      </div>

      <div className="flex gap-4 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            <X className="h-4 w-4" />
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="success"
          disabled={loading || !formData.clientName || !formData.clientPhone || !formData.serviceId}
        >
          {loading ? <LoadingSpinner /> : entry ? <RotateCcw className="h-4 w-4" /> : <FilePlus className="h-4 w-4" />}
          {loading ? 'Salvando...' : entry ? 'Atualizar' : 'Adicionar à Lista'}
        </Button>
      </div>
    </form>
  );
}

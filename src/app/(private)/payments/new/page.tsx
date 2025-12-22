'use client';

import * as React from "react"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Client } from '@/types';
import { paymentService } from '@/services/payment.service';
import { clientService } from '@/services/client.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Check, FilePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function NewPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = React.useState(false)
  const [selectedCliente, setSelectedCliente] = React.useState<Client | null>(
    null
  )
  const [clienteFilter, setClienteFilter] = useState('all');

  const [formData, setFormData] = useState({
    clientId: '',
    amount: 0,
    method: 'CASH',
    appointmentId: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await clientService.getAll({ limit: 100 });
      setClients(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await paymentService.create({
        clientId: formData.clientId,
        amount: Number(formData.amount),
        method: formData.method as any,
        appointmentId: formData.appointmentId || undefined,
      });

      router.push('/payments');
    } catch (err: any) {
      console.error('Erro ao registrar pagamento:', err);
      setError(err.message || 'Erro ao registrar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <div className='flex items-center gap-4'>
          <Button variant="secondary" onClick={() => router.back()}>
            ← Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            Registrar Pagamento
          </h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Registre um novo pagamento no sistema
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-sm p-6 border border-border space-y-6">
        <div>
          <Label htmlFor="clientId">Cliente *</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="secondary" className="w-full justify-start">
                {selectedCliente ? <>{selectedCliente.name}</> : <>Selecione o cliente</>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" side="bottom" align="start">
              <Command>
                <CommandInput placeholder="Pesquisar categoria..." />
                <CommandList>
                  <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                  <CommandGroup>
                    {clients.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={client.name}
                        keywords={[client.name]}
                        onSelect={(currentLabel) => {
                          const selected = clients.find((c) => c.name === currentLabel)
                          setSelectedCliente(selected || null)
                          setClienteFilter(selected?.id || 'all')
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCliente?.id === client.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {client.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="amount">Valor (R$) *</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            required
          />
        </div>

        <div>
          <Label htmlFor="method">Método de Pagamento *</Label>
          <Select
            value={formData.method}
            onValueChange={(value) => setFormData({ ...formData, method: value })}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um método de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Método de Pagamento</SelectLabel>
                <SelectItem value="CASH">Dinheiro</SelectItem>
                <SelectItem value="DEBIT">Débito</SelectItem>
                <SelectItem value="CREDIT">Crédito</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="LINK">Link de Pagamento</SelectItem>
                <SelectItem value="WALLET">Carteira Digital</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="appointmentId">ID do Agendamento (opcional)</Label>
          <Input
            id="appointmentId"
            type="text"
            value={formData.appointmentId}
            onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
            placeholder="UUID do agendamento"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Vincule este pagamento a um agendamento existente
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} variant="success">
            {loading ? <LoadingSpinner /> : <FilePlus className="h-4 w-4" />}
            {loading ? 'Registrando...' : 'Registrar Pagamento'}
          </Button>
        </div>
      </form>
    </div>
  );
}

'use client';

import * as React from "react"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Client, Service, Staff } from '@/types';
import { appointmentService } from '@/services/appointment.service';
import { clientService } from '@/services/client.service';
import { serviceService } from '@/services/service.service';
import { staffService } from '@/services/staff.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Check, FilePlus, X } from 'lucide-react';

type User = {
  name: string;
  phone: string;
}

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

import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function NewAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [openClient, setOpenClient] = React.useState(false)
  const [selectUser, setSelectUser] = React.useState<User | null>(
    null
  )
  const [userFilter, setUserFilter] = useState('all');

  const [openStaff, setOpenStaff] = React.useState(false)
  const [selectStaff, setSelectStaff] = React.useState<Staff | null>(null)
  const [staffFilter, setStaffFilter] = useState('all');

  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  const [formData, setFormData] = useState({
    clientId: '',
    staffId: '',
    startTime: '',
    selectedServices: [] as string[],
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clientsRes, servicesRes, staffRes] = await Promise.all([
        clientService.getAll({ limit: 100 }),
        serviceService.getAll({ isActive: true }),
        staffService.getAll({ isAvailable: true }),
      ]);

      setClients(clientsRes.data);
      setServices(servicesRes.data || []);
      setStaff(staffRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }));
  };

  const calculateTotal = () => {
    return formData.selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const selectedServicesData = formData.selectedServices.map(serviceId => {
        const service = services.find(s => s.id === serviceId)!;
        return {
          id: service.id,
          name: service.name,
          price: service.price,
          duration: service.durationMinutes,
        };
      });

      await appointmentService.create({
        clientId: formData.clientId,
        staffId: formData.staffId,
        startTime: new Date(formData.startTime).toISOString(),
        services: selectedServicesData,
        notes: formData.notes || undefined,
      });

      router.push('/appointments');
    } catch (err: any) {
      console.error('Erro ao criar agendamento:', err);
      setError(err.message || 'Erro ao criar agendamento');
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
            Novo Agendamento
          </h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Crie um novo agendamento
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-sm p-6 border border-border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="clientId">Cliente *</Label>
            <Popover open={openClient} onOpenChange={setOpenClient}>
              <PopoverTrigger asChild>
                <Button variant="secondary" className="w-full justify-start">
                  {selectUser ? <>{selectUser.name}</> : <>Selecione o cliente</>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" side="bottom" align="start">
                <Command>
                  <CommandInput placeholder="Pesquisar cliente..." />
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
                            setSelectUser(selected || null)
                            setUserFilter(selected?.id || 'all')
                            setFormData({ ...formData, clientId: selected?.id || '' })
                            setOpenClient(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectUser?.name === client.name
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
            <Label htmlFor="staffId">Profissional *</Label>
            <Popover open={openStaff} onOpenChange={setOpenStaff}>
              <PopoverTrigger asChild>
                <Button variant="secondary" className="w-full justify-start">
                  {selectStaff ? <>{selectStaff.user?.name || 'Nome não disponível'}</> : <>Selecione o profissional</>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" side="bottom" align="start">
                <Command>
                  <CommandInput placeholder="Pesquisar profissional..." />
                  <CommandList>
                    <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                    <CommandGroup>
                      {staff.map((member) => (
                        <CommandItem
                          key={member.user?.id}
                          value={member.user?.name || 'Nome não disponível'}
                          keywords={[member.user?.name || '']}
                          onSelect={(currentLabel) => {
                            const selected = staff.find((c) => c.user?.name === currentLabel)
                            setSelectStaff(selected || null)
                            setStaffFilter(selected?.id || 'all')
                            setFormData({ ...formData, staffId: selected?.id || '' })
                            setOpenStaff(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectStaff?.user?.name === member.user?.name
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {member.user?.name || 'Nome não disponível'}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="startTime">Data e Hora *</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <Label>Serviços * (Selecione pelo menos um)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between "
              >
                <Label htmlFor={`service-${service.id}`} className="w-full h-full p-3 border rounded-lg bg-muted border-border hover:bg-muted/80 cursor-pointer flex items-center justify-between gap-3">

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={formData.selectedServices.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {service.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {service.durationMinutes}min
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    R$ {service.price.toFixed(2)}
                  </p>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Observações</Label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg outline-none bg-muted"
            placeholder="Observações sobre o agendamento..."
          />
        </div>

        {formData.selectedServices.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total:
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                R$ {calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || formData.selectedServices.length === 0}
            variant="success"
          >
            {loading ? <LoadingSpinner /> : <FilePlus className="h-4 w-4" />}
            {loading ? 'Criando...' : 'Criar Agendamento'}
          </Button>
        </div>
      </form>
    </div>
  );
}

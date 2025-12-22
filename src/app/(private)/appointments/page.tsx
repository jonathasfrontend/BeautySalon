'use client';

import * as React from "react"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Appointment } from '@/types';
import { appointmentService } from '@/services/appointment.service';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

type Status = {
  value: string
  label: string
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

import { CustomLink } from '@/components/ui/Link';
import { Label } from '@/components/ui/Label';

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | []>([]);

  const [open, setOpen] = React.useState(false)
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(
    null
  )
  // new Date().toISOString().split('T')[0]
  const [statusFilter, setStatusFilter] = useState('all');

  // Lista de status disponíveis
  const statuses: Status[] = [
    { value: "all", label: "Todos" },
    { value: "SCHEDULED", label: "Agendado" },
    { value: "CONFIRMED", label: "Confirmado" },
    { value: "COMPLETED", label: "Concluído" },
    { value: "CANCELLED", label: "Cancelado" },
  ]

  // Define o status inicial
  useEffect(() => {
    if (!selectedStatus) {
      setSelectedStatus(statuses[0]) // Define "Todos" como padrão
    }
  }, [])

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, statusFilter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params: any = { date: selectedDate };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await appointmentService.getAll(params);
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

    try {
      await appointmentService.cancel(id);
      loadAppointments();
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      alert('Erro ao cancelar agendamento');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Agendamentos
          </h1>
          <p className="text-gray-600 ">
            Gerencie os agendamentos do salão
          </p>
        </div>

        <CustomLink href="/appointments/new" variant="gradient" >
          + Novo Agendamento
        </CustomLink>
      </div>

      {/* Filtros */}
      <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Data
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">
              Status
            </Label>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="secondary" className="w-full justify-start">
                  {selectedStatus ? <>{selectedStatus.label}</> : <>Selecione um status</>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" side="bottom" align="start">
                <Command>
                  <CommandInput placeholder="Pesquisar status..." />
                  <CommandList>
                    <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                    <CommandGroup>
                      {statuses.map((status) => (
                        <CommandItem
                          key={status.value}
                          value={status.label}
                          keywords={[status.value]}
                          onSelect={(currentLabel) => {
                            const selected = statuses.find((s) => s.label === currentLabel)
                            setSelectedStatus(selected || null)
                            setStatusFilter(selected?.value || 'all')
                            setOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedStatus?.value === status.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {status.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Lista de Agendamentos */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onViewDetails={() => router.push(`/appointments/${appointment.id}`)}
              onCancel={() => handleCancel(appointment.id)}
            />
          ))}
        </div>
      )}

      {!loading && appointments.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground">
            Nenhum agendamento encontrado para esta data
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Staff, User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { userService } from '@/services/user.service';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Checkbox } from '../ui/Checkbox';
import { FilePlus, RotateCcw, X } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface StaffFormProps {
  staff?: Staff;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  preSelectedUserId?: string; // Usuário pré-selecionado (vindo da query param)
}

const specialtiesOptions = [
  { value: 'cabelo', label: 'Cabelo' },
  { value: 'manicure', label: 'Manicure' },
  { value: 'pedicure', label: 'Pedicure' },
  { value: 'design-sobrancelhas', label: 'Design de Sobrancelhas' },
  { value: 'maquiagem', label: 'Maquiagem' },
  { value: 'depilacao', label: 'Depilação' },
  { value: 'estetica', label: 'Estética' },
  { value: 'massagem', label: 'Massagem' },
];

export function StaffForm({ staff, onSubmit, onCancel, preSelectedUserId }: StaffFormProps) {
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    userId: staff?.userId || preSelectedUserId || '',
    specialties: staff?.specialties || [],
    commissionType: staff?.commissionType || 'PERCENT',
    commissionValue: staff?.commissionValue || 0,
    isAvailable: staff?.isAvailable ?? true,
  });

  useEffect(() => {
    if (!staff) {
      loadAvailableUsers();
    }
  }, [staff]);

  const loadAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      // Usuários ativos com cargo (qualquer) e sem perfil de staff
      const users = await userService.getUsers({ isActive: true });
      setAvailableUsers(
        users.filter((u) => !u.staff && !!u.role)
      );
    } catch (error) {
      console.error('Erro ao carregar usuários disponíveis:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        userId: formData.userId,
        specialties: formData.specialties,
        commissionType: formData.commissionType,
        commissionValue: Number(formData.commissionValue),
        isAvailable: formData.isAvailable,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {!staff && (
          <div>
            <Label htmlFor="userId">Usuário *</Label>
            <Select
              value={formData.userId}
              onValueChange={(value) => setFormData({ ...formData, userId: value })}
              required
              disabled={loadingUsers}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Apenas usuários ativos com cargo e sem perfil de profissional são exibidos
            </p>
          </div>
        )}

        <div>
          <Label>Especialidades *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {specialtiesOptions.map((option) => (
              <Label
                key={option.value}
                className="flex items-center cursor-pointer p-2 border rounded-lg bg-muted hover:bg-muted/80"
              >
                <Checkbox
                  id="show-blocked"
                  checked={formData.specialties.includes(option.value)}
                  onCheckedChange={() => {
                    toggleSpecialty(option.value);
                  }}
                />
                <span className="ml-2 text-sm text-foreground">
                  {option.label}
                </span>
              </Label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="commissionType">Tipo de Comissão *</Label>
            <Select
              value={formData.commissionType}
              onValueChange={(value) => setFormData({ ...formData, commissionType: value })}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem key="PERCENT" value="PERCENT">Percentual</SelectItem>
                  <SelectItem key="FIXED" value="FIXED">Valor Fixo</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="commissionValue">
              Valor da Comissão * {formData.commissionType === 'PERCENT' ? '(%)' : '(R$)'}
            </Label>
            <Input
              id="commissionValue"
              type="number"
              min="0"
              step={formData.commissionType === 'PERCENT' ? '1' : '0.01'}
              value={formData.commissionValue}
              onChange={(e) => setFormData({ ...formData, commissionValue: Number(e.target.value) })}
              required
            />
          </div>
        </div>

        <div>
          <label className="flex items-center cursor-pointer">
            <Checkbox
              id="show-blocked"
              checked={formData.isAvailable}
              onCheckedChange={(checked: boolean) => {
                setFormData({ ...formData, isAvailable: checked });
              }}
            />
            <span className="ml-2 text-sm text-muted-foreground">
              Profissional disponível para agendamentos
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            <X className="h-4 w-4" />
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading || formData.specialties.length === 0} variant="success">
          {loading ? <LoadingSpinner /> : staff ? <RotateCcw className="h-4 w-4" /> : <FilePlus className="h-4 w-4" />}
          {loading ? 'Salvando...' : staff ? 'Atualizar Profissional' : 'Criar Profissional'}
        </Button>
      </div>
    </form>
  );
}

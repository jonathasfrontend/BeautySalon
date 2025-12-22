'use client';

import { useState, useEffect } from 'react';
import { User, Role, CreateUserData } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { roleService } from '@/services/role.service';

import * as React from "react"
type RoleType = {
  name: string;
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

import { cn } from '@/lib/utils';
import { Check, FilePlus, RotateCcw, X } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserData) => Promise<void>;
  onCancel?: () => void;
  defaultRoleName?: string; // Para pre-selecionar a role "Profissional"
}

export function UserForm({ user, onSubmit, onCancel, defaultRoleName = 'Profissional' }: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [selectRole, setSelectRole] = React.useState<RoleType | null>(
    null
  )
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [open, setOpen] = React.useState(false)

  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState<CreateUserData>({
    email: user?.email || '',
    password: '',
    name: user?.name || '',
    phone: user?.phone || '',
    roleId: user?.roleId || '',
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const rolesData = await roleService.getRoles();
      setRoles(rolesData);

      // Se não há usuário (criação nova), selecionar automaticamente a role "Profissional"
      if (!user && defaultRoleName) {
        const defaultRole = rolesData.find(
          role => role.name.toLowerCase() === defaultRoleName.toLowerCase()
        );
        if (defaultRole) {
          setFormData(prev => ({ ...prev, roleId: defaultRole.id }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
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
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="maria@salao.com"
            disabled={!!user}
          />
          {user && (
            <p className="text-xs text-muted-foreground mt-1">
              O e-mail não pode ser alterado
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(11) 98765-4321"
          />
        </div>

        {!user && (
          <div className="md:col-span-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
            <p className="text-xs text-muted-foreground mt-1">
              A senha deve ter no mínimo 6 caracteres
            </p>
          </div>
        )}

        <div className="md:col-span-2">
          <Label htmlFor="roleId">Cargo/Função *</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="secondary" className="w-full justify-start">
                {selectRole ? <>{selectRole.name}</> : <>Selecione o cargo</>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" side="bottom" align="start">
              <Command>
                <CommandInput placeholder="Pesquisar cargo..." />
                <CommandList>
                  <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                  <CommandGroup>
                    {roles.map((role) => (
                      <CommandItem
                        key={role.id}
                        value={role.name}
                        keywords={[role.name]}
                        onSelect={(currentLabel) => {
                          const selected = roles.find((r) => r.name === currentLabel)
                          setSelectRole(selected || null)
                          setRoleFilter(selected?.id || '')
                          setFormData({ ...formData, roleId: selected?.id || '' })
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectRole?.name === role.name
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {role.name}
                        {role.description && <span className="text-muted-foreground text-xs ml-2">{role.description}</span>}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground mt-1">
            Para criar um profissional, selecione o cargo "Profissional"
          </p>
        </div>
      </div>


      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            <X className="h-4 w-4" />
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading || loadingRoles} variant="success">
          {loading ? <LoadingSpinner /> : user ? <RotateCcw className="h-4 w-4" /> : <FilePlus className="h-4 w-4" />}
          {loading ? 'Salvando...' : user ? 'Atualizar Usuário' : 'Criar Usuário'}
        </Button>
      </div>
    </form>
  );
}

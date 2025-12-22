'use client';

import * as React from "react"
import { useState } from 'react';
import { Service } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
type CategoryType = {
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

import { Checkbox } from '../ui/Checkbox';
import { Check, FilePlus, RotateCcw, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "../ui/LoadingSpinner";

interface ServiceFormProps {
  service?: Service;
  onSubmit: (data: Partial<Service>) => Promise<void>;
  onCancel?: () => void;
}

const categories = [
  { value: 'cabelo', label: 'Cabelo' },
  { value: 'manicure', label: 'Manicure' },
  { value: 'pedicure', label: 'Pedicure' },
  { value: 'design-sobrancelhas', label: 'Design de Sobrancelhas' },
  { value: 'maquiagem', label: 'Maquiagem' },
  { value: 'depilacao', label: 'Depilação' },
  { value: 'estetica', label: 'Estética' },
  { value: 'massagem', label: 'Massagem' },
  { value: 'outros', label: 'Outros' },
];

export function ServiceForm({ service, onSubmit, onCancel }: ServiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryType | null>(
    null
  )
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || 'cabelo',
    durationMinutes: service?.durationMinutes || 60,
    price: service?.price || 0,
    isActive: service?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category,
        durationMinutes: Number(formData.durationMinutes),
        price: Number(formData.price),
        isActive: formData.isActive,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="name">Nome do Serviço *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Ex: Corte Feminino"
          />
        </div>

        <div>
          <Label htmlFor="category">Categoria *</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="secondary" className="w-full justify-start">
                {selectedCategory ? <>{selectedCategory.label}</> : <>Selecione uma categoria</>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" side="bottom" align="start">
              <Command>
                <CommandInput placeholder="Pesquisar categoria..." />
                <CommandList>
                  <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                  <CommandGroup>
                    {categories.map((category) => (
                      <CommandItem
                        key={category.value}
                        value={category.label}
                        keywords={[category.value]}
                        onSelect={(currentLabel) => {
                          const selected = categories.find((c) => c.label === currentLabel)
                          setSelectedCategory(selected || null)
                          setCategoryFilter(selected?.value || 'all')
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCategory?.value === category.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {category.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="duration">Duração (minutos) *</Label>
          <Input
            id="duration"
            type="number"
            min="5"
            step="5"
            value={formData.durationMinutes}
            onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
            required
          />
        </div>

        <div>
          <Label htmlFor="price">Preço (R$) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg  bg-muted"
            placeholder="Descrição do serviço..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center cursor-pointer">
            <Checkbox
              id="show-blocked"
              checked={formData.isActive}
              onCheckedChange={(checked: boolean) => {
                setFormData({ ...formData, isActive: checked });
              }}
            />
            <span className="ml-2 text-sm text-muted-foreground">
              Serviço ativo
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
        <Button type="submit" disabled={loading} variant="success">
          {loading ? <LoadingSpinner /> : service ? <RotateCcw className="h-4 w-4" /> : <FilePlus className="h-4 w-4" />}
          {loading ? 'Salvando...' : service ? 'Atualizar Serviço' : 'Criar Serviço'}
        </Button>
      </div>
    </form>
  );
}

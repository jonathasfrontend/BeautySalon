'use client';

import { useState } from 'react';

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

const categories = [
  { value: 'all', label: 'Todos' },
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

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onChange(category.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selected === category.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground hover:bg-muted hover:dark:bg-muted'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}

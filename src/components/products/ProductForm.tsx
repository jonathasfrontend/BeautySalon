'use client';

import { useState, useEffect } from 'react';
import { Product, CreateProductData } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { FilePlus, RotateCcw, X } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: CreateProductData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [formData, setFormData] = useState<CreateProductData>({
    sku: '',
    name: '',
    description: '',
    category: '',
    quantity: 0,
    costPrice: 0,
    salePrice: 0,
    reorderThreshold: 10,
    supplier: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        category: product.category,
        quantity: product.quantity,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        reorderThreshold: product.reorderThreshold,
        supplier: product.supplier || '',
      });
    }
  }, [product]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU é obrigatório';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (formData.costPrice < 0) {
      newErrors.costPrice = 'Preço de custo não pode ser negativo';
    }

    if (formData.salePrice < 0) {
      newErrors.salePrice = 'Preço de venda não pode ser negativo';
    }

    if (formData.salePrice < formData.costPrice) {
      newErrors.salePrice = 'Preço de venda não pode ser menor que o custo';
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantidade não pode ser negativa';
    }

    if (formData.reorderThreshold < 0) {
      newErrors.reorderThreshold = 'Estoque mínimo não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="Ex: PROD001"
            className="mt-1"
          />
          {errors.sku && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.sku}</p>
          )}
        </div>

        <div>
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Shampoo Profissional"
            className="mt-1"
          />
          {errors.name && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            placeholder="Descrição detalhada do produto..."
          />
        </div>

        <div>
          <Label htmlFor="category">Categoria *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Ex: produtos-cabelo"
            className="mt-1"
          />
          {errors.category && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.category}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Use formato kebab-case (produtos-cabelo, manicure-pedicure)
          </p>
        </div>

        <div>
          <Label htmlFor="supplier">Fornecedor</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            placeholder="Ex: Fornecedor ABC"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="quantity">Quantidade Inicial *</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            className="mt-1"
          />
          {errors.quantity && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.quantity}</p>
          )}
        </div>

        <div>
          <Label htmlFor="reorderThreshold">Estoque Mínimo *</Label>
          <Input
            id="reorderThreshold"
            type="number"
            min="0"
            value={formData.reorderThreshold}
            onChange={(e) => setFormData({ ...formData, reorderThreshold: parseInt(e.target.value) || 0 })}
            className="mt-1"
          />
          {errors.reorderThreshold && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.reorderThreshold}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Você será alertado quando o estoque atingir este valor
          </p>
        </div>

        <div>
          <Label htmlFor="costPrice">Preço de Custo (R$) *</Label>
          <Input
            id="costPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.costPrice}
            onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
            className="mt-1"
          />
          {errors.costPrice && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.costPrice}</p>
          )}
        </div>

        <div>
          <Label htmlFor="salePrice">Preço de Venda (R$) *</Label>
          <Input
            id="salePrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.salePrice}
            onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
            className="mt-1"
          />
          {errors.salePrice && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.salePrice}</p>
          )}
          {formData.salePrice > 0 && formData.costPrice > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Margem de lucro: {(((formData.salePrice - formData.costPrice) / formData.salePrice) * 100).toFixed(1)}%
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          <X className="h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} variant="success">
          {isLoading ? <LoadingSpinner /> : product ? <RotateCcw className="h-4 w-4" /> : <FilePlus className="h-4 w-4" />}
          {isLoading ? 'Salvando...' : product ? 'Atualizar Produto' : 'Criar Produto'}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        * Campos obrigatórios
      </p>
    </form>
  );
}

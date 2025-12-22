'use client';

import { Product } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Package, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onView?: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onView }: ProductCardProps) {
  const isLowStock = product.quantity <= product.reorderThreshold;
  const profitMargin = ((product.salePrice - product.costPrice) / product.salePrice) * 100;

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            SKU: {product.sku}
          </p>
        </div>
        <div className={cn(
          "p-2 rounded-full",
          isLowStock ? "bg-yellow-100 dark:bg-yellow-900/20" : "bg-blue-100 dark:bg-blue-900/20"
        )}>
          <Package className={cn(
            "w-5 h-5",
            isLowStock ? "text-yellow-600 dark:text-yellow-500" : "text-blue-600 dark:text-blue-500"
          )} />
        </div>
      </div>

      {product.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {product.description}
        </p>
      )}

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Categoria:</span>
          <Badge variant="secondary">
            {product.category.replace('-', ' ')}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Estoque:</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {product.quantity} un
            </span>
            {isLowStock && (
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Preço:</span>
          <span className="font-semibold text-green-600 dark:text-green-500">
            R$ {product.salePrice.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Margem:</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-500" />
            <span className="font-semibold text-purple-600 dark:text-purple-500">
              {profitMargin.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          {product.isActive ? (
            <Badge variant="success">Ativo</Badge>
          ) : (
            <Badge variant="error">Inativo</Badge>
          )}
        </div>
        <div className="flex gap-2">
          {onView && (
            <Button variant="outline" size="sm" onClick={() => onView(product)}>
              Ver Detalhes
            </Button>
          )}
          {onEdit && (
            <Button size="sm" onClick={() => onEdit(product)}>
              Editar
            </Button>
          )}
        </div>
      </div>

      {isLowStock && (
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>Estoque baixo!</strong> Apenas {product.quantity} unidades restantes.
          </p>
        </div>
      )}
    </div>
  );
}

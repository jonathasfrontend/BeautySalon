'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { productService } from '@/services/product.service';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils';
import { CustomLink } from '@/components/ui/Link';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [search, showLowStock]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (search) {
        params.search = search;
      }

      if (showLowStock) {
        params.lowStock = true;
      }

      const response = await productService.getAll(params);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Produtos e Estoque
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie o estoque de produtos
          </p>
        </div>
        <CustomLink href="/products/new" variant="gradient" size="default">
          + Novo Produto
        </CustomLink>
      </div>

      {/* Filtros */}
      <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              type="text"
              placeholder="Buscar por nome ou SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <Checkbox
                checked={showLowStock}
                onCheckedChange={(checked) => {
                  setShowLowStock(checked === true);
                }}
              />
              <span className="ml-2 text-sm text-muted-foreground">
                Mostrar apenas estoque baixo
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Tabela de Produtos */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    SKU / Produto
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Categoria
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Estoque
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Preço Venda
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const isLowStock = product.quantity <= product.reorderThreshold;
                  return (
                    <tr
                      key={product.id}
                      className={cn(
                        "border-b border-border bg-card last:border-0 hover:bg-secondary/30 transition-colors",
                        "animate-fade-in"
                      )}
                    >
                      <td className="px-5 py-4 text-sm font-medium text-foreground">
                        {product.name}
                        <div className="text-sm text-muted-foreground">
                          SKU: {product.sku}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-foreground">
                        {product.category.replace('-', ' ')}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-foreground">
                        {product.quantity} unidades
                        {isLowStock && (
                          <Badge variant="warning" className="mt-1">
                            Estoque baixo
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-foreground">
                        R$ {product.salePrice.toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-foreground">
                        {product.isActive ? (
                          <Badge variant="success">Ativo</Badge>
                        ) : (
                          <Badge variant="error">Inativo</Badge>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-foreground text-right">
                        <CustomLink href={`/products/${product.id}`} variant="secondary" size="sm" className='flex-1'>
                          Detalhes
                        </CustomLink>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum produto encontrado
            </div>
          )}
        </div>
      )}
    </div>
  );
}

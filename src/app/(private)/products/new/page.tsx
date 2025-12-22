'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { productService } from '@/services/product.service';
import { Button } from '@/components/ui/Button';
import { ProductForm } from '@/components/products/ProductForm';
import { CreateProductData } from '@/types';
import toast from 'react-hot-toast';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateProductData) => {
    setLoading(true);

    try {
      await productService.create(data);
      toast.success('Produto criado com sucesso!');
      router.push('/products');
    } catch (err: any) {
      console.error('Erro ao criar produto:', err);
      toast.error(err.response?.data?.message || 'Erro ao criar produto');
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
            Novo Produto
          </h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Cadastre um novo produto no estoque
        </p>
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={loading}
        />
      </div>
    </div>
  );
}

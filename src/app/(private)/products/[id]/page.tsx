'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Product } from '@/types';
import { productService } from '@/services/product.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import {
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
  Save,
  X,
  Plus,
  Minus,
  History,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/Checkbox';

interface StockMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  reference?: string;
  createdAt: string;
  createdBy?: {
    name: string;
  };
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modais
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showRemoveStockModal, setShowRemoveStockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMovementsModal, setShowMovementsModal] = useState(false);

  // Formulário de edição
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    costPrice: 0,
    salePrice: 0,
    reorderThreshold: 0,
    supplier: '',
    isActive: true,
  });

  // Formulário de adicionar estoque
  const [addStockData, setAddStockData] = useState({
    quantity: 0,
    reason: '',
    reference: '',
  });

  // Formulário de remover estoque
  const [removeStockData, setRemoveStockData] = useState({
    quantity: 0,
    reason: '',
  });

  useEffect(() => {
    loadProductData();
  }, [productId]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      const productData = await productService.getProductById(productId);
      console.log('Produto carregado:', productData); // Debug
      setProduct(productData);
      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        sku: productData.sku || '',
        category: productData.category || '',
        costPrice: productData.costPrice || 0,
        salePrice: productData.salePrice || 0,
        reorderThreshold: productData.reorderThreshold || 0,
        supplier: productData.supplier || '',
        isActive: productData.isActive ?? true,
      });
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      toast.error('Erro ao carregar dados do produto');
    } finally {
      setLoading(false);
    }
  };

  const loadMovements = async () => {
    try {
      const movementsData = await productService.getMovements(productId);
      setMovements(movementsData);
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
      toast.error('Erro ao carregar histórico de movimentações');
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await productService.updateProduct(productId, formData);
      await loadProductData();
      setEditing(false);
      toast.success('Produto atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar produto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await productService.deleteProduct(productId);
      toast.success('Produto deletado com sucesso!');
      router.push('/dashboard/products');
    } catch (error: any) {
      console.error('Erro ao deletar produto:', error);
      toast.error(error.response?.data?.message || 'Erro ao deletar produto');
    }
  };

  const handleAddStock = async () => {
    try {
      if (addStockData.quantity <= 0) {
        toast.error('A quantidade deve ser maior que zero');
        return;
      }
      if (!addStockData.reason.trim()) {
        toast.error('Informe o motivo da entrada');
        return;
      }

      await productService.addStock(
        productId,
        addStockData.quantity,
        addStockData.reason,
        addStockData.reference || undefined
      );

      await loadProductData();
      setShowAddStockModal(false);
      setAddStockData({ quantity: 0, reason: '', reference: '' });
      toast.success('Estoque adicionado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao adicionar estoque:', error);
      toast.error(error.response?.data?.message || 'Erro ao adicionar estoque');
    }
  };

  const handleRemoveStock = async () => {
    try {
      if (removeStockData.quantity <= 0) {
        toast.error('A quantidade deve ser maior que zero');
        return;
      }
      if (!removeStockData.reason.trim()) {
        toast.error('Informe o motivo da saída');
        return;
      }
      if (product && removeStockData.quantity > product.quantity) {
        toast.error('Quantidade maior que o estoque disponível');
        return;
      }

      await productService.removeStock(
        productId,
        removeStockData.quantity,
        removeStockData.reason
      );

      await loadProductData();
      setShowRemoveStockModal(false);
      setRemoveStockData({ quantity: 0, reason: '' });
      toast.success('Estoque removido com sucesso!');
    } catch (error: any) {
      console.error('Erro ao remover estoque:', error);
      toast.error(error.response?.data?.message || 'Erro ao remover estoque');
    }
  };

  const handleCancelEdit = () => {
    if (!product) return;
    setFormData({
      name: product.name || '',
      description: product.description || '',
      sku: product.sku || '',
      category: product.category || '',
      costPrice: product.costPrice || 0,
      salePrice: product.salePrice || 0,
      reorderThreshold: product.reorderThreshold || 0,
      supplier: product.supplier || '',
      isActive: product.isActive ?? true,
    });
    setEditing(false);
  };

  const openMovementsModal = async () => {
    setShowMovementsModal(true);
    await loadMovements();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Produto não encontrado</p>
        <Button onClick={() => router.back()} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  const isLowStock = product.quantity <= product.reorderThreshold;
  const costPrice = product.costPrice || 0;
  const salePrice = product.salePrice || 0;
  const profitMargin = salePrice > 0 ? ((salePrice - costPrice) / salePrice) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className='flex items-center gap-4'>
            <Button variant="secondary" onClick={() => router.back()}>
              ← Voltar
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              {editing ? 'Editar Produto' : 'Detalhes do Produto'}
            </h1>
          </div>
            <p className="text-muted-foreground mt-1">
              {editing ? 'Atualize as informações do produto' : 'Visualize e gerencie o produto'}
            </p>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <Button variant="gradient" onClick={() => setEditing(true)}>
                <Edit2 className="w-4 h-4" />
                Editar
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
                <Trash2 className="w-4 h-4" />
                Deletar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                <X className="w-4 h-4" />
                Cancelar
              </Button>
              <Button onClick={handleUpdate} disabled={saving} variant="success">
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Alert de estoque baixo */}
      {isLowStock && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">
              Estoque Baixo
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              O estoque está abaixo do limite mínimo de {product.reorderThreshold} unidades.
              Considere fazer uma nova compra.
            </p>
          </div>
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Estoque Atual</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {product.quantity}
              </p>
              <p className="text-xs text-muted-foreground mt-1">unidades</p>
            </div>
            <div className={cn(
              "p-3 rounded-full",
              isLowStock ? "bg-yellow-100 dark:bg-yellow-900/20" : "bg-blue-100 dark:bg-blue-900/20"
            )}>
              <Package className={cn(
                "w-6 h-6",
                isLowStock ? "text-yellow-600 dark:text-yellow-500" : "text-blue-600 dark:text-blue-500"
              )} />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Custo</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                R$ {costPrice.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">por unidade</p>
            </div>
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Preço de Venda</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                R$ {salePrice.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">por unidade</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Margem de Lucro</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {profitMargin.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                R$ {(salePrice - costPrice).toFixed(2)} / un
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      {!editing && (
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h2>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setShowAddStockModal(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Estoque
            </Button>
            <Button onClick={() => setShowRemoveStockModal(true)} variant="outline">
              <Minus className="w-4 h-4 mr-2" />
              Remover Estoque
            </Button>
            <Button onClick={openMovementsModal} variant="outline">
              <History className="w-4 h-4 mr-2" />
              Ver Movimentações
            </Button>
          </div>
        </div>
      )}

      {/* Formulário de Detalhes */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Informações do Produto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              disabled={!editing}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!editing}
              className="mt-1"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={!editing}
              rows={3}
              className="mt-1 w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-secondary disabled:cursor-not-allowed bg-background text-foreground"
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria *</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={!editing}
              className="mt-1"
              placeholder="Ex: produtos-cabelo"
            />
          </div>

          <div>
            <Label htmlFor="supplier">Fornecedor</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              disabled={!editing}
              className="mt-1"
            />
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
              disabled={!editing}
              className="mt-1"
            />
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
              disabled={!editing}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="reorderThreshold">Estoque Mínimo *</Label>
            <Input
              id="reorderThreshold"
              type="number"
              min="0"
              value={formData.reorderThreshold}
              onChange={(e) => setFormData({ ...formData, reorderThreshold: parseInt(e.target.value) || 0 })}
              disabled={!editing}
              className="mt-1"
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <Checkbox
              checked={formData.isActive}
              onCheckedChange={(checked) => {
                setFormData({ ...formData, isActive: checked === true });
              }}
              disabled={!editing}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Produto Ativo
            </Label>
          </div>
        </div>

        {editing && (
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              * Campos obrigatórios
            </p>
          </div>
        )}
      </div>

      {/* Informações Adicionais */}
      {!editing && (
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Informações Adicionais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-1">
                {product.isActive ? (
                  <Badge variant="success">Ativo</Badge>
                ) : (
                  <Badge variant="error">Inativo</Badge>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Criado em</p>
              <p className="text-sm font-medium text-foreground mt-1">
                {new Date(product.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última atualização</p>
              <p className="text-sm font-medium text-foreground mt-1">
                {new Date(product.updatedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Estoque */}
      <Modal
        isOpen={showAddStockModal}
        onClose={() => {
          setShowAddStockModal(false);
          setAddStockData({ quantity: 0, reason: '', reference: '' });
        }}
        title="Adicionar Estoque"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddStockModal(false);
                setAddStockData({ quantity: 0, reason: '', reference: '' });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddStock}>
              Confirmar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="addQuantity">Quantidade *</Label>
            <Input
              id="addQuantity"
              type="number"
              min="1"
              value={addStockData.quantity || ''}
              onChange={(e) => setAddStockData({ ...addStockData, quantity: parseInt(e.target.value) || 0 })}
              className="mt-1"
              placeholder="Ex: 50"
            />
          </div>
          <div>
            <Label htmlFor="addReason">Motivo *</Label>
            <Input
              id="addReason"
              value={addStockData.reason}
              onChange={(e) => setAddStockData({ ...addStockData, reason: e.target.value })}
              className="mt-1"
              placeholder="Ex: Compra do fornecedor"
            />
          </div>
          <div>
            <Label htmlFor="addReference">Referência (NF, etc.)</Label>
            <Input
              id="addReference"
              value={addStockData.reference}
              onChange={(e) => setAddStockData({ ...addStockData, reference: e.target.value })}
              className="mt-1"
              placeholder="Ex: NF-12345"
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Remover Estoque */}
      <Modal
        isOpen={showRemoveStockModal}
        onClose={() => {
          setShowRemoveStockModal(false);
          setRemoveStockData({ quantity: 0, reason: '' });
        }}
        title="Remover Estoque"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowRemoveStockModal(false);
                setRemoveStockData({ quantity: 0, reason: '' });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleRemoveStock} variant="destructive">
              Confirmar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="removeQuantity">Quantidade *</Label>
            <Input
              id="removeQuantity"
              type="number"
              min="1"
              max={product.quantity}
              value={removeStockData.quantity || ''}
              onChange={(e) => setRemoveStockData({ ...removeStockData, quantity: parseInt(e.target.value) || 0 })}
              className="mt-1"
              placeholder="Ex: 5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Estoque disponível: {product.quantity} unidades
            </p>
          </div>
          <div>
            <Label htmlFor="removeReason">Motivo *</Label>
            <Input
              id="removeReason"
              value={removeStockData.reason}
              onChange={(e) => setRemoveStockData({ ...removeStockData, reason: e.target.value })}
              className="mt-1"
              placeholder="Ex: Produto danificado"
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Deletar Produto */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Exclusão"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Deletar Produto
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-foreground">
            Tem certeza que deseja deletar o produto <strong>{product.name}</strong>?
          </p>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita. Todos os dados do produto serão permanentemente removidos.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal: Histórico de Movimentações */}
      <Modal
        isOpen={showMovementsModal}
        onClose={() => setShowMovementsModal(false)}
        title="Histórico de Movimentações"
        size="lg"
      >
        <div className="space-y-4">
          {movements.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma movimentação registrada
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {movements.map((movement) => (
                <div
                  key={movement.id}
                  className="bg-secondary/30 rounded-lg p-4 border border-border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {movement.type === 'IN' ? (
                          <Badge variant="success">
                            <Plus className="w-3 h-3 mr-1" />
                            Entrada
                          </Badge>
                        ) : (
                          <Badge variant="error">
                            <Minus className="w-3 h-3 mr-1" />
                            Saída
                          </Badge>
                        )}
                        <span className="font-semibold text-foreground">
                          {movement.quantity} unidades
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-1">
                        <strong>Motivo:</strong> {movement.reason}
                      </p>
                      {movement.reference && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Referência:</strong> {movement.reference}
                        </p>
                      )}
                      {movement.createdBy && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Por:</strong> {movement.createdBy.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {new Date(movement.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                      <br />
                      {new Date(movement.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

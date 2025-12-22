'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Payment } from '@/types';
import { paymentService } from '@/services/payment.service';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from '@/lib/utils';
import { CustomLink } from '@/components/ui/Link';

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await paymentService.getAll(params);
      setPayments(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error'> = {
      PAID: 'success',
      PENDING: 'warning',
      PARTIAL: 'warning',
      REFUNDED: 'error',
      CANCELLED: 'error',
    };
    const labels: Record<string, string> = {
      PAID: 'Pago',
      PENDING: 'Pendente',
      PARTIAL: 'Parcial',
      REFUNDED: 'Reembolsado',
      CANCELLED: 'Cancelado',
    };
    return <Badge variant={variants[status]}>{labels[status] || status}</Badge>;
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CASH: 'Dinheiro',
      DEBIT: 'Débito',
      CREDIT: 'Crédito',
      PIX: 'PIX',
      LINK: 'Link',
      WALLET: 'Carteira Digital',
    };
    return labels[method] || method;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Pagamentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os pagamentos e finanças
          </p>
        </div>
        <CustomLink href="/payments/new" variant="gradient" size="default">
          + Registrar Pagamento
        </CustomLink>
      </div>

      {/* Filtros */}
      <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Status
          </label>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PAID">Pago</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="PARTIAL">Parcial</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
                <SelectItem value="REFUNDED">Reembolsado</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabela de Pagamentos */}
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
                    Data
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Cliente
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Método
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Valor
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className={cn(
                      "border-b border-border bg-card last:border-0 hover:bg-secondary/30 transition-colors",
                      "animate-fade-in"
                    )}
                  >
                    <td className="px-5 py-4 text-sm font-medium text-foreground">
                      {new Date(payment.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-foreground">
                      {payment.client?.name || 'N/A'}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-foreground">
                      {getMethodLabel(payment.method)}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-foreground text-left">
                      R$ {payment.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-foreground text-right">
                      {getStatusBadge(payment.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {payments.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum pagamento encontrado
            </div>
          )}
        </div>
      )}
    </div>
  );
}

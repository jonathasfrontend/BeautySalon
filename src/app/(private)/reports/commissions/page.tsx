'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Filter,
  Calendar
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  useCommissionsReport,
  useReportFilters
} from '@/hooks/useReports';
import { KPICard } from '@/components/reports/KPICard';
import { PeriodSelector } from '@/components/reports/PeriodSelector';
import { BarChartInteractive } from '@/components/charts';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { cn } from '@/lib/utils';

export default function CommissionsReportsPage() {
  const router = useRouter();
  const { filters, period, setPeriod, setCustomRange } = useReportFilters('month');
  const [selectedStaffId, setSelectedStaffId] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');

  const { data, isLoading, error } = useCommissionsReport({
    startDate: filters.startDate,
    endDate: filters.endDate,
    staffId: selectedStaffId
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Agrupar comissões por profissional
  const commissionsByStaff = useMemo(() => {
    if (!data) return [];

    const staffMap = new Map<string, {
      staffId: string;
      staffName: string;
      total: number;
      paid: number;
      pending: number;
      count: number;
      commissions: typeof data.commissions;
    }>();

    data.commissions.forEach(commission => {
      const staffId = commission.staff.id;
      const staffName = commission.staff.user.name;

      if (!staffMap.has(staffId)) {
        staffMap.set(staffId, {
          staffId,
          staffName,
          total: 0,
          paid: 0,
          pending: 0,
          count: 0,
          commissions: []
        });
      }

      const staffData = staffMap.get(staffId)!;
      staffData.total += commission.amount;
      staffData.count++;
      staffData.commissions.push(commission);

      if (commission.isPaid) {
        staffData.paid += commission.amount;
      } else {
        staffData.pending += commission.amount;
      }
    });

    return Array.from(staffMap.values()).sort((a, b) => b.total - a.total);
  }, [data]);

  // Filtrar comissões por status
  const filteredCommissions = useMemo(() => {
    if (!data) return [];

    let filtered = data.commissions;

    if (filterStatus === 'paid') {
      filtered = filtered.filter(c => c.isPaid);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter(c => !c.isPaid);
    }

    return filtered.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data, filterStatus]);

  // Preparar dados para gráfico
  const chartData = commissionsByStaff.slice(0, 10).map(staff => ({
    name: staff.staffName,
    total: staff.total,
    pagas: staff.paid,
    pendentes: staff.pending
  }));

  // Lista única de profissionais para o filtro
  const staffList = useMemo(() => {
    if (!data) return [];
    const uniqueStaff = new Map();
    data.commissions.forEach(c => {
      if (!uniqueStaff.has(c.staff.id)) {
        uniqueStaff.set(c.staff.id, {
          id: c.staff.id,
          name: c.staff.user.name
        });
      }
    });
    return Array.from(uniqueStaff.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className='flex items-center gap-4'>
          <Button variant="secondary" onClick={() => router.back()}>
            ← Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            Relatórios de Comissões
          </h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Análise detalhada de comissões por profissional e status de pagamento
        </p>
      </div>

      {/* Period Selector */}
      <div className="bg-card border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Período de Análise
        </h2>
        <PeriodSelector
          period={period}
          onPeriodChange={setPeriod}
          onCustomRangeChange={setCustomRange}
        />
      </div>

      {/* Filtros Adicionais */}
      <div className="bg-card border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            Filtros
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtro por Profissional */}
          <div>
            <Label className="block text-sm font-medium text-muted-foreground mb-2">
              Profissional
            </Label>
            <Select
              value={selectedStaffId || ''}
              onValueChange={(value) => setSelectedStaffId(value || undefined)}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Profissionais</SelectLabel>
                  {staffList.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Status */}
          <div>
            <Label className="block text-sm font-medium text-muted-foreground mb-2">
              Status de Pagamento
            </Label>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'secondary'}
                onClick={() => setFilterStatus('all')}
                className='flex-1'
              >
                Todas
              </Button>
              <Button
                onClick={() => setFilterStatus('paid')}
                variant={filterStatus === 'paid' ? 'default' : 'secondary'}
                className='flex-1'
              >
                Pagas
              </Button>
              <Button
                onClick={() => setFilterStatus('pending')}
                variant={filterStatus === 'pending' ? 'default' : 'secondary'}
                className='flex-1'
              >
                Pendentes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Erro ao carregar dados: {error.message}
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total de Comissões"
          value={data ? formatCurrency(data.summary.total) : '---'}
          subtitle={`${data?.commissions.length || 0} comissões`}
          icon={<Wallet className="w-5 h-5 text-violet-600" />}
          colorScheme="default"
          isLoading={isLoading}
        />

        <KPICard
          title="Comissões Pagas"
          value={data ? formatCurrency(data.summary.paid) : '---'}
          subtitle={data ? `${((data.summary.paid / data.summary.total) * 100).toFixed(1)}% do total` : ''}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          colorScheme="success"
          isLoading={isLoading}
        />

        <KPICard
          title="Comissões Pendentes"
          value={data ? formatCurrency(data.summary.pending) : '---'}
          subtitle={data ? `${((data.summary.pending / data.summary.total) * 100).toFixed(1)}% do total` : ''}
          icon={<Clock className="w-5 h-5 text-yellow-600" />}
          colorScheme="warning"
          isLoading={isLoading}
        />

        <KPICard
          title="Profissionais"
          value={commissionsByStaff.length.toString()}
          subtitle="com comissões no período"
          icon={<Users className="w-5 h-5 text-blue-600" />}
          colorScheme="info"
          isLoading={isLoading}
        />
      </div>

      {/* Gráfico de Comissões por Profissional */}
      {data && commissionsByStaff.length > 0 && (
        <div className="bg-card border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Comissões por Profissional
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Top 10 profissionais por valor total de comissões
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>

          <BarChartInteractive
            data={chartData}
            dataKey="total"
            xAxisKey="name"
            title=""
            height={400}
            formatValue={formatCurrency}
          />
        </div>
      )}

      {/* Tabela Resumida por Profissional */}
      {commissionsByStaff.length > 0 && (
        <div className="bg-card border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Resumo por Profissional
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Totalizadores de comissões por profissional
              </p>
            </div>
            <Users className="w-5 h-5 text-gray-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Profissional
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    Qtd. Comissões
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    Total
                  </th>
                  <th className="text-right text-xs font-medium text-green-700 dark:text-green-300 px-5 py-3">
                    Pagas
                  </th>
                  <th className="text-right text-xs font-medium text-yellow-700 dark:text-yellow-300 px-5 py-3">
                    Pendentes
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    % Pagas
                  </th>
                </tr>
              </thead>
              <tbody>
                {commissionsByStaff.map((staff) => (
                  <tr
                    key={staff.staffId}
                    className={cn(
                      "border-b border-border bg-card last:border-0 hover:bg-secondary/30 transition-colors",
                      "animate-fade-in"
                    )}
                  >
                    <td className="py-3 px-4 text-sm font-medium text-foreground">
                      {staff.staffName}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                      {staff.count}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-foreground">
                      {formatCurrency(staff.total)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(staff.paid)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-yellow-600 dark:text-yellow-400">
                      {formatCurrency(staff.pending)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                      {((staff.paid / staff.total) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                <tr className="font-bold">
                  <td className="py-3 px-4 text-sm text-foreground">
                    TOTAL
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-foreground">
                    {data?.commissions.length}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-foreground">
                    {data && formatCurrency(data.summary.total)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-green-600 dark:text-green-400">
                    {data && formatCurrency(data.summary.paid)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-yellow-600 dark:text-yellow-400">
                    {data && formatCurrency(data.summary.pending)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-foreground">
                    {data && ((data.summary.paid / data.summary.total) * 100).toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Lista Detalhada de Comissões */}
      {filteredCommissions.length > 0 && (
        <div className="bg-card border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Detalhamento de Comissões
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredCommissions.length} comissões
                {filterStatus === 'paid' && ' pagas'}
                {filterStatus === 'pending' && ' pendentes'}
              </p>
            </div>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {filteredCommissions.map((commission) => (
              <div
                key={commission.id}
                className={`p-4 rounded-lg border-l-4 ${commission.isPaid
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-foreground">
                        {commission.staff.user.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${commission.isPaid
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                          }`}
                      >
                        {commission.isPaid ? 'PAGA' : 'PENDENTE'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Criada em: {formatDate(commission.createdAt)}
                        </span>
                      </div>
                      {commission.isPaid && commission.paidAt && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            Paga em: {formatDate(commission.paidAt)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          Pagamento: {formatCurrency(commission.payment.amount)}
                        </span>
                      </div>
                    </div>

                    {commission.payment.appointment && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Agendamento: {formatDateTime(commission.payment.appointment.startTime)}
                      </p>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      Comissão
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(commission.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {data && filteredCommissions.length === 0 && (
        <div className="bg-card border-border rounded-lg p-12 text-center">
          <Wallet className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhuma comissão encontrada
          </h3>
          <p className="text-muted-foreground">
            Não há comissões{' '}
            {filterStatus === 'paid' && 'pagas '}
            {filterStatus === 'pending' && 'pendentes '}
            para os filtros selecionados.
          </p>
        </div>
      )}
    </div>
  );
}

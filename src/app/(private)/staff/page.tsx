'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Staff } from '@/types';
import { staffService } from '@/services/staff.service';
import { StaffCard } from '@/components/staff/StaffCard';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Checkbox } from '@/components/ui/Checkbox';
import { CustomLink } from '@/components/ui/Link';

export default function StaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  useEffect(() => {
    loadStaff();
  }, [showAvailableOnly]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (showAvailableOnly) {
        params.isAvailable = true;
      }

      const response = await staffService.getAll(params);
      setStaff(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Profissionais
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie a equipe de profissionais
          </p>
        </div>
        <div className="flex gap-3">
          <CustomLink href="/staff/new-user" variant="gradient" size="default" className='flex-1'>
            + Criar Usuário
          </CustomLink>
          <CustomLink href="/staff/new" variant="gradient" size="default" className='flex-1'>
            + Novo Profissional
          </CustomLink>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <Checkbox
              checked={showAvailableOnly}
              onCheckedChange={(checked) => {
                setShowAvailableOnly(checked === true);
              }}
            />
            <span className="ml-2 text-sm text-muted-foreground">
              Mostrar apenas profissionais disponíveis
            </span>
          </label>
        </div>
      </div>

      {/* Grid de Profissionais */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <StaffCard
              key={member.id}
              staff={member}
              onViewDetails={() => router.push(`/staff/${member.id}`)}
              onEdit={() => router.push(`/staff/${member.id}`)}
            />
          ))}
        </div>
      )}

      {!loading && staff.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground">
            Nenhum profissional encontrado
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Staff } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { CustomLink } from '../ui/Link';
import { usePermission } from '@/hooks/useAuth';

interface StaffCardProps {
  staff: Staff;
  onEdit?: () => void;
  onViewDetails?: () => void;
}

export function StaffCard({ staff, onEdit, onViewDetails }: StaffCardProps) {
  const hasProfile = staff.hasProfile !== false;

  // Concluir cadastro exige staff.create (POST /staff é negado sem ela).
  // Gate pós-mount: no SSR as permissões não existem — renderizar o botão
  // direto quebraria o hydration (mesmo bug do Sidebar).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const canCreateStaff = usePermission('staff.create');
  const canCompleteRegistration = mounted && canCreateStaff;

  return (
    <div className="bg-card rounded-lg shadow-sm p-6 border border-border hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-lg font-semibold text-foreground">
              {staff.user?.name || 'Nome não disponível'}
            </h3>
            {staff.role?.name && (
              <Badge variant={staff.role.name === 'Admin' ? 'default' : 'secondary'}>
                {staff.role.name}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {staff.user?.email || 'E-mail não disponível'}
          </p>
        </div>
        {hasProfile &&
          (staff.isAvailable ? (
            <Badge variant="success">Disponível</Badge>
          ) : (
            <Badge variant="error">Indisponível</Badge>
          ))}
      </div>

      {!hasProfile ? (
        // Usuário com cargo sem perfil de staff — cadastro pendente.
        // Sem link de detalhe: /staff/{userId} daria 404 (não existe staff id).
        <div className="space-y-4">
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-sm font-medium text-foreground">
              Cadastro de profissional pendente
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Este usuário ainda não possui especialidades, comissão e horários de trabalho.
            </p>
          </div>
          {canCompleteRegistration ? (
            <CustomLink
              href={`/staff/new?userId=${staff.userId}`}
              variant="secondary"
              size="sm"
              className="inline-flex"
            >
              Completar cadastro
            </CustomLink>
          ) : (
            <p className="text-xs text-muted-foreground">
              Cadastro pendente — você não tem permissão para concluir cadastros de profissionais.
            </p>
          )}
        </div>
      ) : (
        <>
          {staff.specialties && staff.specialties.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Especialidades</p>
              <div className="flex flex-wrap gap-1">
                {staff.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded capitalize"
                  >
                    {specialty.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Tipo de Comissão</p>
              <p className="text-sm font-medium text-foreground mb-1 capitalize">
                {staff.commissionType === 'PERCENT' ? 'Percentual' : 'Valor Fixo'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Comissão</p>
              <p className="text-sm font-medium text-foreground mb-1">
                {staff.commissionType === 'PERCENT'
                  ? `${staff.commissionValue || 0}%`
                  : `R$ ${(staff.commissionValue || 0).toFixed(2)}`
                }
              </p>
            </div>
          </div>
          <div className="flex gap-2 pt-4 border-t border-border">
            <CustomLink href={`/staff/${staff.id}`} variant="secondary" size="sm" className='flex-1'>
              Ver Detalhes
            </CustomLink>
          </div>
        </>
      )}
    </div>
  );
}

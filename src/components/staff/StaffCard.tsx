'use client';

import { Staff } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CustomLink } from '../ui/Link';

interface StaffCardProps {
  staff: Staff;
  onEdit?: () => void;
  onViewDetails?: () => void;
}

export function StaffCard({ staff, onEdit, onViewDetails }: StaffCardProps) {
  return (
    <div className="bg-card rounded-lg shadow-sm p-6 border border-border hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {staff.user?.name || 'Nome não disponível'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {staff.user?.email || 'E-mail não disponível'}
          </p>
        </div>
        {staff.isAvailable ? (
          <Badge variant="success">Disponível</Badge>
        ) : (
          <Badge variant="error">Indisponível</Badge>
        )}
      </div>

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
    </div>
  );
}

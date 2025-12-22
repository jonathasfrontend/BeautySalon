'use client';

import { Service } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CustomLink } from '../ui/Link';

interface ServiceCardProps {
  service: Service;
  onEdit?: (service: Service) => void;
  onToggle?: (service: Service) => void;
}

export function ServiceCard({ service, onEdit, onToggle }: ServiceCardProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-6 border border-border hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">
            {service.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            {service.category.replace('-', ' ')}
          </p>
        </div>
        {service.isActive ? (
          <Badge variant="success">Ativo</Badge>
        ) : (
          <Badge variant="error">Inativo</Badge>
        )}
      </div>

      {service.description && (
        <p className="text-sm text-muted-foreground mb-4">
          {service.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Duração</p>
          <p className="text-sm font-medium text-foreground">
            {formatDuration(service.durationMinutes)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Preço</p>
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            R$ {service.price.toFixed(2)}
          </p>
        </div>
      </div>

      {(onEdit || onToggle) && (
        <div className="flex gap-2 pt-4 border-t border-border">
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(service)}
              className="flex-1"
            >
              Editar
            </Button>
          )}
          {onToggle && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onToggle(service)}
              className="flex-1"
            >
              {service.isActive ? 'Desativar' : 'Ativar'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

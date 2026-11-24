'use client';

import { Button } from '@/components/ui/Button';

interface ListPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  loading?: boolean;
  entityLabel?: string;
  limit?: number;
  limitOptions?: number[];
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

/** Rodapé de lista paginada no servidor (padrão do módulo Empresas). */
export function ListPagination({
  page,
  totalPages,
  total,
  loading = false,
  entityLabel = 'itens',
  limit,
  limitOptions = [10, 20, 50],
  onPageChange,
  onLimitChange,
}: ListPaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
      <span>
        {total} {entityLabel} · Página {page} de {safeTotalPages}
      </span>
      <div className="flex items-center gap-2">
        {limit !== undefined && onLimitChange && (
          <>
            <label htmlFor="finance-limit">Por página:</label>
            <select
              id="finance-limit"
              value={limit}
              onChange={(event) => onLimitChange(Number(event.target.value))}
              className="rounded-md border border-input bg-muted px-2 py-1 text-foreground"
            >
              {limitOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </>
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= safeTotalPages || loading}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}

export default ListPagination;

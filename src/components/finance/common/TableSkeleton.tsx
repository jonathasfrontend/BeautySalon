'use client';

import { Skeleton } from '@/components/ui/skeleton';

/** Skeleton de tabela (carregamento sem salto de layout — spec §10.6). */
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 p-4" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: cols }).map((__, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cnSkeleton(colIndex, cols)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function cnSkeleton(colIndex: number, cols: number) {
  const isLast = colIndex === cols - 1;
  const isMoney = colIndex === cols - 2;
  return `h-5 rounded ${isLast ? 'ml-auto w-20' : isMoney ? 'w-24' : 'flex-1'}`;
}

export default TableSkeleton;

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface FinanceTab {
  href: string;
  label: string;
}

/**
 * Barra de abas secundária do módulo Financeiro (spec §10.1).
 * Rola horizontalmente no mobile; itens já chegam filtrados por permissão.
 */
export function TabsNav({ tabs }: { tabs: FinanceTab[] }) {
  const pathname = usePathname();

  if (tabs.length === 0) return null;

  return (
    <nav
      aria-label="Abas do financeiro"
      className="border-b border-border -mx-1 px-1 overflow-x-auto"
    >
      <ul className="flex min-w-max gap-1">
        {tabs.map((tab) => {
          const active =
            tab.href === '/financeiro'
              ? pathname === tab.href
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default TabsNav;

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, Scissors, Package } from 'lucide-react';
import { Input } from '../ui/Input';
import { clientService } from '@/services/client.service';
import { serviceService } from '@/services/service.service';
import { productService } from '@/services/product.service';
import type { Client, Service, Product } from '@/types';

interface SearchResults {
  clients: Client[];
  services: Service[];
  products: Product[];
}

const EMPTY: SearchResults = { clients: [], services: [], products: [] };

const MAX_PER_GROUP = 5;
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Limita a espera por uma fonte de busca: uma API travada não pode
 * segurar o dropdown inteiro em loading. Aborta a requisição de verdade
 * (o wrapper só rejeitaria, leaving a request viva no socket).
 */
function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  controller: AbortController
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('timeout'));
    }, ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer)) as Promise<T>;
}

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);

  // Debounce 300ms + fetch das 3 fontes em paralelo (best-effort por fonte)
  useEffect(() => {
    const q = query.trim();

    // Invalida imediatamente qualquer requisição em voo: uma resposta de
    // uma busca antiga não pode sobrescrever os resultados da busca atual.
    const requestId = ++requestIdRef.current;

    if (q.length < 2) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Um controller POR FONTE: o timeout de uma não pode abortar as outras
    // (com controller compartilhado, uma fonte lenta derrubava as 3).
    // O cleanup aborta todas, senão requests antigas ficam vivas no socket.
    const clientsController = new AbortController();
    const servicesController = new AbortController();
    const productsController = new AbortController();

    const timer = setTimeout(async () => {
      const [clients, services, products] = await Promise.allSettled([
        withTimeout(
          clientService.getAll(
            { search: q, page: 1, limit: MAX_PER_GROUP },
            clientsController.signal
          ),
          REQUEST_TIMEOUT_MS,
          clientsController
        ),
        withTimeout(
          serviceService.getAll({ search: q, limit: MAX_PER_GROUP }, servicesController.signal),
          REQUEST_TIMEOUT_MS,
          servicesController
        ),
        withTimeout(
          productService.getAll({ search: q, limit: MAX_PER_GROUP }, productsController.signal),
          REQUEST_TIMEOUT_MS,
          productsController
        ),
      ]);

      // Descarta resposta de uma busca antiga (usuário já digitou mais)
      if (requestId !== requestIdRef.current) return;

      setResults({
        clients:
          clients.status === 'fulfilled' ? (clients.value.data || []).slice(0, MAX_PER_GROUP) : [],
        services:
          services.status === 'fulfilled' ? (services.value.data || []).slice(0, MAX_PER_GROUP) : [],
        products:
          products.status === 'fulfilled' ? (products.value.data || []).slice(0, MAX_PER_GROUP) : [],
      });
      setLoading(false);
    }, 300);

    return () => {
      clearTimeout(timer);
      clientsController.abort();
      servicesController.abort();
      productsController.abort();
    };
  }, [query]);

  // Fecha no click-outside
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = query.trim();
      if (q.length >= 2) {
        setOpen(false);
        router.push(`/clients?search=${encodeURIComponent(q)}`);
      }
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const navigate = (path: string) => {
    setOpen(false);
    setQuery('');
    router.push(path);
  };

  const hasResults =
    results.clients.length > 0 || results.services.length > 0 || results.products.length > 0;

  return (
    <div className="relative w-80 hidden md:block" ref={containerRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder="Buscar clientes, serviços..."
        className="pl-10 bg-secondary border-0 outline-none"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        aria-label="Busca global"
      />

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden max-h-96 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">Buscando...</div>
          ) : !hasResults ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Nenhum resultado para &quot;{query.trim()}&quot;
            </div>
          ) : (
            <>
              {results.clients.length > 0 && (
                <div className="py-1">
                  <p className="px-4 py-1 text-xs font-medium uppercase text-muted-foreground">
                    Clientes
                  </p>
                  {results.clients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/clients/${c.id}`)}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{c.name}</span>
                      {c.phone && (
                        <span className="text-xs text-muted-foreground ml-auto shrink-0">
                          {c.phone}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {results.services.length > 0 && (
                <div className="py-1 border-t border-border">
                  <p className="px-4 py-1 text-xs font-medium uppercase text-muted-foreground">
                    Serviços
                  </p>
                  {results.services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => navigate(`/services?search=${encodeURIComponent(s.name)}`)}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <Scissors className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{s.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto shrink-0">
                        {s.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {results.products.length > 0 && (
                <div className="py-1 border-t border-border">
                  <p className="px-4 py-1 text-xs font-medium uppercase text-muted-foreground">
                    Produtos
                  </p>
                  {results.products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/products/${p.id}`)}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{p.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto shrink-0">
                        {p.sku}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="px-4 py-2 border-t border-border text-center">
                <button
                  onClick={() =>
                    navigate(`/clients?search=${encodeURIComponent(query.trim())}`)
                  }
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Ver todos os resultados em Clientes (Enter)
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

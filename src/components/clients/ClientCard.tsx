'use client';

import { Client } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface ClientCardProps {
  client: Client;
}

export function ClientCard({ client }: ClientCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informado';
    try {
      const date = new Date(dateString);
      // Verificar se a data é válida
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return 'Não informado';
    // Formatar telefone brasileiro: (11) 95555-5555
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatCPF = (cpf?: string) => {
    if (!cpf) return null;
    // Formatar CPF: 123.456.789-00
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }
    return cpf;
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-semibold text-foreground">
            {client.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Cliente desde {formatDate(client.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          {client.isBlocked ? (
            <Badge variant="error">Bloqueado</Badge>
          ) : (
            <Badge variant="success">Ativo</Badge>
          )}
          {client.consentLGPD && (
            <Badge variant="info">LGPD</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Telefone</p>
          <p className="text-sm font-medium text-foreground">
            {formatPhone(client.phone)}
          </p>
        </div>

        {client.email && (
          <div>
            <p className="text-sm text-muted-foreground">E-mail</p>
            <p className="text-sm font-medium text-foreground">
              {client.email}
            </p>
          </div>
        )}

        {client.birthdate && (
          <div>
            <p className="text-sm text-muted-foreground">Data de Nascimento</p>
            <p className="text-sm font-medium text-foreground">
              {formatDate(client.birthdate)}
            </p>
          </div>
        )}

        {formatCPF(client.cpf) && (
          <div>
            <p className="text-sm text-muted-foreground">CPF</p>
            <p className="text-sm font-medium text-foreground">
              {formatCPF(client.cpf)}
            </p>
          </div>
        )}

        {client.consentDate && (
          <div>
            <p className="text-sm text-muted-foreground">Consentimento LGPD</p>
            <p className="text-sm font-medium text-foreground">
              {formatDate(client.consentDate)}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
        <div>
          <p className="text-sm text-muted-foreground">Pontos de Fidelidade</p>
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            {client.loyaltyPoints || 0}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Agendamentos</p>
          <p className="text-lg font-semibold text-foreground">
            {client._count?.appointments || 0}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Faltas (No-Show)</p>
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
            {client.noShowCount || 0}
          </p>
        </div>
      </div>

      {client.notes && (
        <div className="pt-4 mt-4 border-t dark:border-gray-700">
          <p className="text-sm text-muted-foreground">Observações</p>
          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">
            {client.notes}
          </p>
        </div>
      )}

      {client.preferences && 
       typeof client.preferences === 'object' && 
       client.preferences !== null &&
       Object.keys(client.preferences).length > 0 && (
        <div className="pt-4 mt-4 border-t dark:border-gray-700">
          <p className="text-sm text-muted-foreground mb-2">Preferências</p>
          <div className="text-sm text-foreground">
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
              {Object.entries(client.preferences).map(([key, value]) => (
                <div key={key} className="mb-2 last:mb-0">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {key}:
                  </span>{' '}
                  <span className="text-gray-600 dark:text-gray-400">
                    {typeof value === 'object' 
                      ? JSON.stringify(value) 
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


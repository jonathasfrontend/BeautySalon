import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Appointment, PaymentStatus } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
}

export function formatTime(time: string | Date): string {
  if (!time) return '';
  
  const dateObj = typeof time === 'string' ? new Date(time) : time;
  
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

export function formatPhone(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 11) {
    // Mobile: (XX) XXXXX-XXXX
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    // Landline: (XX) XXXX-XXXX
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

export function getAppointmentPaymentStatus(appointment: Appointment): PaymentStatus {
  // Se o agendamento está cancelado
  if (appointment.status === 'CANCELLED') {
    return PaymentStatus.CANCELLED;
  }

  // Se não há pagamentos
  if (!appointment.payments || appointment.payments.length === 0) {
    return PaymentStatus.PENDING;
  }

  // Calcular total pago
  const totalPaid = appointment.payments
    .filter(p => p.status === PaymentStatus.PAID)
    .reduce((sum, p) => sum + p.amount, 0);

  // Verificar se há reembolsos
  const hasRefund = appointment.payments.some(p => p.status === PaymentStatus.REFUNDED);
  if (hasRefund) {
    return PaymentStatus.REFUNDED;
  }

  // Comparar com o total
  if (totalPaid >= appointment.totalAmount) {
    return PaymentStatus.PAID;
  } else if (totalPaid > 0) {
    return PaymentStatus.PARTIAL;
  }

  return PaymentStatus.PENDING;
}

export function getStatusLabel(status: PaymentStatus | string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendente',
    PAID: 'Pago',
    PARTIAL: 'Parcial',
    REFUNDED: 'Reembolsado',
    CANCELLED: 'Cancelado',
  };

  return labels[status] || status;
}

export function getStatusColor(status: PaymentStatus | string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PAID: 'bg-green-100 text-green-800 border-green-200',
    PARTIAL: 'bg-blue-100 text-blue-800 border-blue-200',
    REFUNDED: 'bg-purple-100 text-purple-800 border-purple-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  };

  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}

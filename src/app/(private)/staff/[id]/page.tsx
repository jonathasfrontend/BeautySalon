'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Staff, Appointment } from '@/types';
import { staffService } from '@/services/staff.service';
import { appointmentService } from '@/services/appointment.service';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { StaffForm } from '@/components/staff/StaffForm';
import { ScheduleEditor } from '@/components/staff/ScheduleEditor';
import toast from 'react-hot-toast';
import { Check, Edit2, Lock, X } from 'lucide-react';

export default function StaffDetailPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params?.id as string;

  const [staff, setStaff] = useState<Staff | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'schedule' | 'appointments'>('details');

  const loadStaffAppointments = async () => {
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

      const response = await appointmentService.getAll({
        staffId,
        startDate,
        endDate,
      });
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  };

  const loadStaffDetails = async () => {
    try {
      setLoading(true);
      const response = await staffService.getById(staffId);
      console.log('Staff response:', response); // Debug
      console.log('Staff data:', response.data); // Debug
      setStaff(response.data!);

      // Carregar agendamentos recentes do profissional
      await loadStaffAppointments();
    } catch (error) {
      toast.error('Erro ao carregar dados do profissional');
      router.push('/staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (staffId) {
      loadStaffDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId]);

  const handleUpdateStaff = async (data: any) => {
    try {
      await staffService.update(staffId, data);
      toast.success('Profissional atualizado com sucesso!');
      setEditMode(false);
      await loadStaffDetails();
    } catch (error) {
      toast.error('Erro ao atualizar profissional');
    }
  };

  const handleDeleteStaff = async () => {
    if (!confirm('Tem certeza que deseja excluir este profissional? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await staffService.delete(staffId);
      toast.success('Profissional excluído com sucesso!');
      router.push('/staff');
    } catch (error) {
      console.error('Erro ao excluir profissional:', error);
      toast.error('Erro ao excluir profissional');
    }
  };

  const handleToggleAvailability = async () => {
    if (!staff) return;

    try {
      await staffService.update(staffId, {
        isAvailable: !staff.isAvailable,
      });
      toast.success(`Profissional marcado como ${!staff.isAvailable ? 'disponível' : 'indisponível'}`);
      await loadStaffDetails();
    } catch (error) {
      console.error('Erro ao alterar disponibilidade:', error);
      toast.error('Erro ao alterar disponibilidade');
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'CONFIRMED': return 'info';
      case 'SCHEDULED': return 'warning';
      case 'CANCELLED': return 'error';
      case 'NO_SHOW': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      SCHEDULED: 'Agendado',
      CONFIRMED: 'Confirmado',
      IN_PROGRESS: 'Em Andamento',
      COMPLETED: 'Concluído',
      CANCELLED: 'Cancelado',
      NO_SHOW: 'Não Compareceu',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Profissional não encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className='flex items-center gap-4'>
            <Button variant="secondary" onClick={() => router.back()}>
              ← Voltar
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              {staff.user?.name || 'Nome não disponível'}
            </h1>
            {staff.isAvailable ? (
              <Badge variant="success">Disponível</Badge>
            ) : (
              <Badge variant="error">Indisponível</Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={staff.isAvailable ? 'outline' : 'default'}
            onClick={handleToggleAvailability}
          >
            {staff.isAvailable ? <Lock className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            {staff.isAvailable ? 'Marcar Indisponível' : 'Marcar Disponível'}
          </Button>
          <Button
            variant="gradient"
            onClick={() => setEditMode(true)}
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteStaff} 
          >
            <X className="w-4 h-4" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-0.5 border-b-2 cursor-pointer font-medium text-sm ${activeTab === 'details'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-primary-foreground'
              }`}
          >
            Detalhes
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-4 px-0.5 border-b-2 cursor-pointer font-medium text-sm ${activeTab === 'schedule'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-primary-foreground'
              }`}
          >
            Horários de Trabalho
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-4 px-0.5 border-b-2 cursor-pointer font-medium text-sm ${activeTab === 'appointments'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-primary-foreground'
              }`}
          >
            Agendamentos ({appointments.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Informações Básicas
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nome</p>
                <p className="text-base font-medium text-foreground">
                  {staff.user?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">E-mail</p>
                <p className="text-base font-medium text-foreground">
                  {staff.user?.email || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Telefone</p>
                <p className="text-base font-medium text-foreground">
                  {staff.user?.phone || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cargo</p>
                <p className="text-base font-medium text-foreground">
                  {staff.user?.role?.name || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Especialidades */}
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Especialidades
            </h2>
            <div className="flex flex-wrap gap-2">
              {staff.specialties && staff.specialties.length > 0 ? (
                staff.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-lg capitalize"
                  >
                    {specialty.replace('-', ' ')}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Nenhuma especialidade cadastrada</p>
              )}
            </div>
          </div>

          {/* Comissões */}
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Comissões
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de Comissão</p>
                <p className="text-base font-medium text-foreground capitalize">
                  {staff.commissionType === 'PERCENT' ? 'Percentual' :
                    staff.commissionType === 'FIXED' ? 'Valor Fixo' :
                      staff.commissionType === 'TABLE' ? 'Tabela' : staff.commissionType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Valor</p>
                <p className="text-base font-medium text-foreground">
                  {staff.commissionType === 'PERCENT'
                    ? `${staff.commissionValue || 0}%`
                    : `R$ ${(staff.commissionValue || 0).toFixed(2)}`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Estatísticas (Este Mês)
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total de Agendamentos</p>
                <p className="text-2xl font-bold text-foreground">
                  {appointments.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Concluídos</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {appointments.filter(a => a.status === 'COMPLETED').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cancelados/No-Show</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {appointments.filter(a => a.status === 'CANCELLED' || a.status === 'NO_SHOW').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Horários de Trabalho
            </h2>
            <Button onClick={() => setShowScheduleEditor(true)}>
              ✏️ Editar Horários
            </Button>
          </div>

          <ScheduleEditor
            schedule={staff.workSchedule as any}
            onSave={async (newSchedule) => {
              try {
                await staffService.update(staffId, { workSchedule: newSchedule });
                toast.success('Horários atualizados com sucesso!');
                await loadStaffDetails();
                setShowScheduleEditor(false);
              } catch (error) {
                console.error('Erro ao atualizar horários:', error);
                toast.error('Erro ao atualizar horários');
              }
            }}
            readOnly={!showScheduleEditor}
          />

          {showScheduleEditor && (
            <div className="mt-4 flex gap-2">
              <Button onClick={() => setShowScheduleEditor(false)} variant="outline">
                Cancelar
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-card rounded-lg shadow-sm border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              Agendamentos Recentes
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/appointments/${appointment.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-foreground">
                          {appointment.client?.name || 'Cliente não identificado'}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(appointment.status)}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        📅 {formatDateTime(appointment.startTime)}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-2">
                        {appointment.services?.map((service, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                          >
                            {service.name}
                          </span>
                        ))}
                      </div>

                      {appointment.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          💬 {appointment.notes}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">
                        R$ {appointment.totalAmount?.toFixed(2)}
                      </p>
                      {appointment.isPaid && (
                        <Badge variant="success" className="mt-2">Pago</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhum agendamento encontrado este mês
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      <Modal
        isOpen={editMode}
        onClose={() => setEditMode(false)}
        title="Editar Profissional"
      >
        <StaffForm
          staff={staff}
          onSubmit={handleUpdateStaff}
          onCancel={() => setEditMode(false)}
        />
      </Modal>
    </div>
  );
}

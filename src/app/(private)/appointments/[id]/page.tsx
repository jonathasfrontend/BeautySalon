'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Appointment, AppointmentStatus, PaymentMethod } from '@/types';
import { appointmentService } from '@/services/appointment.service';
import { paymentService } from '@/services/payment.service';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import toast from 'react-hot-toast';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";

export default function AppointmentDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const appointmentId = params.id as string;

    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleTime, setRescheduleTime] = useState('');

    useEffect(() => {
        if (appointmentId) {
            console.log('Carregando agendamento com ID:', appointmentId);
            loadAppointment();
        } else {
            console.error('ID do agendamento não encontrado');
            toast.error('ID do agendamento não encontrado');
            router.push('/appointments');
        }
    }, [appointmentId]);

    const loadAppointment = async () => {
        try {
            setLoading(true);
            console.log('Buscando agendamento:', appointmentId);
            const response = await appointmentService.getById(appointmentId);
            console.log('Resposta recebida:', response);

            if (!response || !response.data) {
                console.error('Resposta inválida:', response);
                throw new Error('Dados do agendamento não encontrados');
            }

            console.log('Dados do agendamento:', response.data);

            // A API retorna { appointment: {...} } dentro de data
            const appointmentData = (response.data as any).appointment || response.data;
            console.log('Appointment data extraído:', appointmentData);

            setAppointment(appointmentData);
            setPaymentAmount(appointmentData?.totalAmount?.toString() || '0');
        } catch (error) {
            console.error('Erro ao carregar agendamento:', error);
            toast.error('Erro ao carregar agendamento. Verifique se o ID está correto.');
            router.push('/appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        try {
            await appointmentService.cancel(appointmentId);
            toast.success('Agendamento cancelado com sucesso!');
            setShowCancelModal(false);
            loadAppointment();
        } catch (error) {
            console.error('Erro ao cancelar agendamento:', error);
            toast.error('Erro ao cancelar agendamento');
        }
    };

    const handleNoShow = async () => {
        // abrir uma caixa de confirmação com toastr antes de marcar como no-show
        if (!window.confirm('Tem certeza que deseja marcar este agendamento como falta?')) {
            return;
        }

        try {
            await appointmentService.markNoShow(appointmentId);
            toast.success('Agendamento marcado como falta!');
            loadAppointment();
        } catch (error) {
            console.error('Erro ao marcar no-show:', error);
            toast.error('Erro ao marcar no-show');
        }
    };

    const handlePayment = async () => {
        try {
            if (!appointment?.client?.id) {
                toast.error('Cliente não encontrado');
                return;
            }

            await paymentService.create({
                appointmentId: appointmentId,
                clientId: appointment.client.id,
                amount: parseFloat(paymentAmount),
                method: paymentMethod,
            });

            toast.success('Pagamento registrado com sucesso!');
            setShowPaymentModal(false);
            loadAppointment();
        } catch (error) {
            console.error('Erro ao registrar pagamento:', error);
            toast.error('Erro ao registrar pagamento');
        }
    };

    const handleReschedule = async () => {
        try {
            if (!rescheduleDate || !rescheduleTime) {
                toast.error('Preencha data e horário');
                return;
            }

            const newStartTime = new Date(`${rescheduleDate}T${rescheduleTime}`).toISOString();

            await appointmentService.update(appointmentId, {
                startTime: newStartTime,
                status: AppointmentStatus.SCHEDULED,
            });

            toast.success('Agendamento reagendado com sucesso!');
            setShowRescheduleModal(false);
            loadAppointment();
        } catch (error) {
            console.error('Erro ao reagendar:', error);
            toast.error('Erro ao reagendar agendamento');
        }
    };

    const handleUpdateStatus = async (status: AppointmentStatus) => {
        try {
            await appointmentService.update(appointmentId, { status });
            toast.success('Status atualizado com sucesso!');
            loadAppointment();
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            toast.error('Erro ao atualizar status');
        }
    };

    const getStatusBadge = (status: AppointmentStatus) => {
        const statusConfig = {
            SCHEDULED: { label: 'Agendado', class: 'bg-blue-100 text-blue-800' },
            CONFIRMED: { label: 'Confirmado', class: 'bg-green-100 text-green-800' },
            IN_PROGRESS: { label: 'Em Andamento', class: 'bg-yellow-100 text-yellow-800' },
            COMPLETED: { label: 'Concluído', class: 'bg-gray-100 text-gray-800' },
            CANCELLED: { label: 'Cancelado', class: 'bg-red-100 text-red-800' },
            NO_SHOW: { label: 'Falta', class: 'bg-purple-100 text-purple-800' },
        };

        const config = statusConfig[status];
        return (
            <Badge className={config.class}>
                {config.label}
            </Badge>
        );
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (!appointment || !appointment.id) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Agendamento não encontrado</p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/appointments')}
                    className="mt-4"
                >
                    ← Voltar para Agendamentos
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className='flex items-center gap-4'>
                    <Button variant="secondary" onClick={() => router.back()}>
                        ← Voltar
                    </Button>
                    <h1 className="text-3xl font-bold text-foreground">
                        Agendamento #{typeof appointment?.id === 'string' ? appointment.id.slice(0, 8) : appointmentId?.slice(0, 8) || 'N/A'}
                    </h1>
                    {appointment && getStatusBadge(appointment.status)}
                </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-muted rounded-lg shadow-sm p-4 border border-border">
                <h2 className="text-lg font-semibold mb-4 text-foreground">Ações</h2>
                <div className="flex flex-wrap gap-3">
                    {appointment.status === AppointmentStatus.SCHEDULED && (
                        <Button
                            variant="default"
                            onClick={() => handleUpdateStatus(AppointmentStatus.CONFIRMED)}
                        >
                            Confirmar Agendamento
                        </Button>
                    )}

                    {appointment.status === AppointmentStatus.CONFIRMED && (
                        <Button
                            variant="default"
                            onClick={() => handleUpdateStatus(AppointmentStatus.IN_PROGRESS)}
                        >
                            Iniciar Atendimento
                        </Button>
                    )}

                    {appointment.status === AppointmentStatus.IN_PROGRESS && (
                        <Button
                            variant="default"
                            onClick={() => handleUpdateStatus(AppointmentStatus.COMPLETED)}
                        >
                            Finalizar Atendimento
                        </Button>
                    )}

                    {!appointment.isPaid && appointment.status === AppointmentStatus.COMPLETED && (
                        <Button
                            variant="success"
                            onClick={() => setShowPaymentModal(true)}
                        >
                            Registrar Pagamento
                        </Button>
                    )}

                    {(appointment.status === AppointmentStatus.SCHEDULED ||
                        appointment.status === AppointmentStatus.CONFIRMED) && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowRescheduleModal(true)}
                                >
                                    Reagendar
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowCancelModal(true)}
                                >
                                    Cancelar
                                </Button>
                            </>
                        )}

                    {(appointment.status === AppointmentStatus.SCHEDULED ||
                        appointment.status === AppointmentStatus.CONFIRMED) && (
                            <Button
                                variant="outline"
                                onClick={handleNoShow}
                            >
                                Marcar como Falta
                            </Button>
                        )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informações do Cliente */}
                <div className="bg-muted rounded-lg shadow-sm p-6 border border-border">
                    <h2 className="text-lg font-semibold mb-4 text-foreground">Cliente</h2>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Nome</p>
                            <p className="font-medium text-foreground">
                                {appointment.client?.name || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Telefone</p>
                            <p className="font-medium text-foreground">
                                {appointment.client?.phone || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                            <p className="font-medium text-foreground">
                                {appointment.client?.email || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Pontos de Fidelidade</p>
                            <p className="font-medium text-foreground">
                                {appointment.client?.loyaltyPoints || 0} pontos
                            </p>
                        </div>
                    </div>
                </div>

                {/* Informações do Profissional */}
                <div className="bg-muted rounded-lg shadow-sm p-6 border border-border">
                    <h2 className="text-lg font-semibold mb-4 text-foreground">Profissional</h2>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Nome</p>
                            <p className="font-medium text-foreground">
                                {appointment.staff?.user?.name || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Especialidades</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {appointment.staff?.specialties?.map((specialty, idx) => (
                                    <Badge key={idx} className="bg-purple-100 text-purple-800">
                                        {specialty}
                                    </Badge>
                                )) || <span className="text-gray-500">N/A</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informações do Horário */}
                <div className="bg-muted rounded-lg shadow-sm p-6 border border-border">
                    <h2 className="text-lg font-semibold mb-4 text-foreground">Horário</h2>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Início</p>
                            <p className="font-medium text-foreground">
                                {formatDateTime(appointment.startTime)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Término</p>
                            <p className="font-medium text-foreground">
                                {formatDateTime(appointment.endTime)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Duração</p>
                            <p className="font-medium text-foreground">
                                {Math.round(
                                    (new Date(appointment.endTime).getTime() -
                                        new Date(appointment.startTime).getTime()) / 60000
                                )} minutos
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Serviços */}
            <div className="bg-muted rounded-lg shadow-sm p-6 border border-border">
                <h2 className="text-lg font-semibold mb-4 text-foreground">Serviços</h2>
                <div className="space-y-3">
                    {appointment.services?.map((service, index) => (
                        <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-card rounded-lg"
                        >
                            <div>
                                <p className="font-medium text-foreground">{service.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {service.duration} minutos
                                </p>
                            </div>
                            <p className="font-semibold text-foreground">
                                {formatCurrency(service.price)}
                            </p>
                        </div>
                    ))}
                    <div className="border-t border-border pt-3 flex justify-between items-center">
                        <p className="font-semibold text-lg text-foreground">Total</p>
                        <p className="font-bold text-xl text-foreground">
                            {formatCurrency(appointment.totalAmount)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Status de Pagamento */}
            <div className="bg-muted rounded-lg shadow-sm p-6 border border-border">
                <h2 className="text-lg font-semibold mb-4 text-foreground">Pagamento</h2>
                <div className="flex items-center gap-3">
                    <p className="text-foreground">Status:</p>
                    {appointment.isPaid ? (
                        <Badge className="bg-green-100 text-green-800">Pago</Badge>
                    ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
                    )}
                </div>

                {appointment.payments && appointment.payments.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-foreground">
                            Histórico de Pagamentos:
                        </p>
                        {appointment.payments.map((payment, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center p-2 bg-card rounded"
                            >
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {payment.method} - {new Date(payment.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatCurrency(payment.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Observações */}
            {appointment.notes && (
                <div className="bg-muted rounded-lg shadow-sm p-6 border border-border">
                    <h2 className="text-lg font-semibold mb-4 text-foreground">Observações</h2>
                    <p className="text-foreground whitespace-pre-wrap">
                        {appointment.notes}
                    </p>
                </div>
            )}

            {/* Modal de Cancelamento */}
            <Modal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                title="Cancelar Agendamento"
            >
                <div className="space-y-4">
                    <p className="text-foreground">
                        Tem certeza que deseja cancelar este agendamento?
                    </p>
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                            Não, voltar
                        </Button>
                        <Button variant="destructive" onClick={handleCancel}>
                            Sim, cancelar
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal de Pagamento */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Registrar Pagamento"
            >
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="paymentAmount">Valor</Label>
                        <Input
                            id="paymentAmount"
                            type="number"
                            step="0.01"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                        <Select
                            value={paymentMethod}
                            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value={PaymentMethod.CASH}>Dinheiro</SelectItem>
                                    <SelectItem value={PaymentMethod.DEBIT}>Débito</SelectItem>
                                    <SelectItem value={PaymentMethod.CREDIT}>Crédito</SelectItem>
                                    <SelectItem value={PaymentMethod.PIX}>PIX</SelectItem>
                                    <SelectItem value={PaymentMethod.LINK}>Link de Pagamento</SelectItem>
                                    <SelectItem value={PaymentMethod.WALLET}>Carteira Digital</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="default" onClick={handlePayment}>
                            Registrar Pagamento
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal de Reagendamento */}
            <Modal
                isOpen={showRescheduleModal}
                onClose={() => setShowRescheduleModal(false)}
                title="Reagendar Agendamento"
            >
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="rescheduleDate">Nova Data</Label>
                        <Input
                            id="rescheduleDate"
                            type="date"
                            value={rescheduleDate}
                            onChange={(e) => setRescheduleDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="rescheduleTime">Novo Horário</Label>
                        <Input
                            id="rescheduleTime"
                            type="time"
                            value={rescheduleTime}
                            onChange={(e) => setRescheduleTime(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setShowRescheduleModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="default" onClick={handleReschedule}>
                            Reagendar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

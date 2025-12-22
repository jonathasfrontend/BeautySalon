'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Service } from '@/types';
import { serviceService } from '@/services/service.service';
import { ServiceCard } from '@/components/services/ServiceCard';
import { CategoryFilter } from '@/components/services/CategoryFilter';
import { Button } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { ServiceForm } from '@/components/services/ServiceForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Checkbox } from '@/components/ui/Checkbox';
import { CustomLink } from '@/components/ui/Link';

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadServices();
  }, [selectedCategory, showActiveOnly]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (showActiveOnly) {
        params.isActive = true;
      }

      const response = await serviceService.getAll(params);
      setServices(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleToggle = async (service: Service) => {
    try {
      await serviceService.update(service.id, { isActive: !service.isActive });
      loadServices();
    } catch (error) {
      toast.error('Erro ao atualizar serviço');
    }
  };

  const handleSubmit = async (data: Partial<Service>) => {
    try {
      if (editingService) {
        await serviceService.update(editingService.id, data);
      } else {
        await serviceService.create(data);
      }
      setShowModal(false);
      setEditingService(null);
      loadServices();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      throw error;
    }
  };

  const filteredServices = services;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Serviços
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os serviços oferecidos
          </p>
        </div>
        <CustomLink href="/services/new" variant="gradient" size="default">
          + Novo Serviço
        </CustomLink>
      </div>

      {/* Filtros */}
      <div className="bg-card rounded-lg shadow-sm p-4 border border-border space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Categorias
          </p>
          <CategoryFilter
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>

        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <Checkbox
              id="show-blocked"
              checked={showActiveOnly}
              onCheckedChange={(checked: boolean) => {
                setShowActiveOnly(checked);
              }}
            />
            <span className="ml-2 text-sm text-muted-foreground">
              Mostrar apenas serviços ativos
            </span>
          </label>
        </div>
      </div>

      {/* Grid de Serviços */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={handleEdit}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {!loading && filteredServices.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground">
            Nenhum serviço encontrado
          </p>
        </div>
      )}

      {/* Modal de Edição */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingService(null);
          }}
          title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
        >
          <ServiceForm
            service={editingService || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowModal(false);
              setEditingService(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

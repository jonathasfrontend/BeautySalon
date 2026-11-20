'use client';

import { useState, useEffect } from 'react';
import { Staff } from '@/types';
import { RoleWithPermissions } from '@/services/role.service';
import { staffService } from '@/services/staff.service';
import { roleService } from '@/services/role.service';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface StaffRoleAssignmentProps {
  roleId: string;
  onSuccess?: () => void;
}

export function StaffRoleAssignment({ roleId, onSuccess }: StaffRoleAssignmentProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await staffService.getAll({});
      // Só itens com perfil de staff real: assign-role exige staff.id (POST /staff/:id/assign-role)
      setStaff((response.data || []).filter((s) => s.hasProfile !== false));
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (staffId: string) => {
    if (!confirm('Deseja realmente atribuir este cargo ao profissional?')) {
      return;
    }

    try {
      setAssigning(staffId);
      await roleService.assignRoleToStaff(staffId, roleId);
      alert('Cargo atribuído com sucesso!');
      if (onSuccess) {
        onSuccess();
      }
      loadStaff();
    } catch (error: any) {
      console.error('Erro ao atribuir cargo:', error);
      alert(error.response?.data?.message || 'Erro ao atribuir cargo');
    } finally {
      setAssigning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select
          value={selectedStaffId}
          onValueChange={(value) => setSelectedStaffId(value)}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um profissional" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Profissionais</SelectLabel>
              {staff.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.user?.name || 'Sem nome'} - {member.specialties?.join(', ') || 'Sem especialidade'}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          onClick={() => selectedStaffId && handleAssign(selectedStaffId)}
          disabled={!selectedStaffId || assigning === selectedStaffId}
        >
          {assigning === selectedStaffId ? 'Atribuindo...' : 'Atribuir Cargo'}
        </Button>
      </div>

      {staff.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Nenhum profissional cadastrado
        </p>
      )}
    </div>
  );
}

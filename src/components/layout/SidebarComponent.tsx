'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Scissors,
  DollarSign,
  Package,
  BarChart3,
  Settings,
  UserCog,
  Clock,
  LogOut,
  Shield,
  Building2,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarHeader,
  SidebarFooter,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePermission } from '@/hooks/useAuth';
import { Button } from '../ui/Button';
import LogoP from '@/assets/logoP.png'
import { Separator } from '../ui/separator';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: null,
  },
  {
    name: 'Agendamentos',
    href: '/appointments',
    icon: Calendar,
    permission: 'appointments.read',
  },
  {
    name: 'Clientes',
    href: '/clients',
    icon: Users,
    permission: 'clients.read',
  },
  {
    name: 'Profissionais',
    href: '/staff',
    icon: UserCog,
    permission: 'staff.read',
  },
  {
    name: 'Serviços',
    href: '/services',
    icon: Scissors,
    permission: 'services.read',
  },
  {
    name: 'Pagamentos',
    href: '/payments',
    icon: DollarSign,
    permission: 'payments.read',
  },
  {
    name: 'Produtos',
    href: '/products',
    icon: Package,
    permission: 'products.read',
  },
  {
    name: 'Relatórios',
    href: '/reports',
    icon: BarChart3,
    permission: 'reports.read',
  },
  {
    name: 'Empresas',
    href: '/companies',
    icon: Building2,
    permission: 'companies.read',
  },
  {
    name: 'Cargos e Permissões',
    href: '/roles',
    icon: Shield,
    permission: 'roles.read',
  },
  {
    name: 'Lista de Espera',
    href: '/waitlist',
    icon: Clock,
    permission: 'waitlist.read',
  },
];

export default function SidebarComponent() {
  const pathname = usePathname();
  const router = useRouter();
  const { clearUser } = useAuthStore();

  const handleLogout = async () => {
    await authService.logout();
    clearUser();
    router.push('/login');
  };

  // Check permissions for all menu items at once (hooks must be called at component level)
  const appointmentsPermission = usePermission('appointments.read');
  const clientsPermission = usePermission('clients.read');
  const staffPermission = usePermission('staff.read');
  const servicesPermission = usePermission('services.read');
  const paymentsPermission = usePermission('payments.read');
  const productsPermission = usePermission('products.read');
  const reportsPermission = usePermission('reports.read');
  const companiesPermission = usePermission('companies.read');
  const rolesPermission = usePermission('roles.read');
  const waitlistPermission = usePermission('waitlist.read');

  // Map permissions to menu items
  const permissionsMap: { [key: string]: boolean } = {
    'appointments.read': appointmentsPermission,
    'clients.read': clientsPermission,
    'staff.read': staffPermission,
    'services.read': servicesPermission,
    'payments.read': paymentsPermission,
    'products.read': productsPermission,
    'reports.read': reportsPermission,
    'companies.read': companiesPermission,
    'roles.read': rolesPermission,
    'waitlist.read': waitlistPermission,
  };

  return (
    <Sidebar variant='sidebar' side='left' collapsible='icon' className='flex-1'>
      <SidebarHeader className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
            <img src={LogoP.src} alt="Logo" className="h-6 w-6 shrink-0" />
          </div>
          <span className="text-md font-bold text-sidebar-foreground truncate group-data-[collapsible=icon]:hidden">
            BeautySalon
          </span>
        </div>
      </SidebarHeader>

      <Separator orientation="horizontal" className='mt-1.75' />

      <SidebarContent className='px-2'>
        <SidebarGroup >
          <SidebarMenu className='flex flex-col transition-all '>
            {menuItems.map((item) => {
              // Check permission: if no permission required (null) or user has permission
              const hasPermission = !item.permission || permissionsMap[item.permission];

              if (!hasPermission) return null;

              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild 
                    isActive={isActive}
                    tooltip={item.name}
                    size="default"
                    variant="default"
                    className='data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:hover:bg-primary/90'
                  >
                    <Link href={item.href} >
                      <Icon className="w-10 h-10" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>

        </SidebarGroup>
      </SidebarContent>

      <Separator orientation="horizontal" className='mt-1.75' />

      <SidebarFooter className="px-4">
        <SidebarMenu className=' gap-1'>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/settings'} tooltip="Configurações">
              <Link href="/settings">
                <Settings className="w-5 h-5" />
                <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Sair"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

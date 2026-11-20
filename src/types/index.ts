// =============================================
// USER & AUTH TYPES
// =============================================

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  role?: Role;
  roleId?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  permissions?: string[];
  staff?: Staff | null;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  module: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  roleId: string;
  avatar?: string;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  email?: string;
  roleId?: string;
  avatar?: string;
  isActive?: boolean;
}

export interface AuthResponse {
  user: User & { permissions: string[] };
  accessToken: string;
  refreshToken: string;
}

// =============================================
// CLIENT TYPES
// =============================================

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthdate?: string;
  cpf?: string;
  notes?: string;
  preferences?: Record<string, any>;
  loyaltyPoints: number;
  noShowCount: number;
  isBlocked: boolean;
  consentLGPD: boolean;
  consentDate?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    appointments: number;
    payments: number;
  };
}

export interface CreateClientData {
  name: string;
  phone: string;
  email?: string;
  birthdate?: string;
  cpf?: string;
  notes?: string;
  preferences?: Record<string, any>;
  consentLGPD: boolean;
}

export interface UpdateClientData extends Partial<CreateClientData> {
  isBlocked?: boolean;
}

export interface ClientHistory {
  client: Client;
  appointments: Appointment[];
  payments: Payment[];
  totalSpent: number;
}

// =============================================
// APPOINTMENT TYPES
// =============================================

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export interface AppointmentService {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export interface Appointment {
  id: string;
  clientId: string;
  staffId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  totalAmount: number;
  services: AppointmentService[];
  isPaid: boolean;
  notes?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  staff?: Staff;
  payments?: Payment[];
  paymentStatus?: PaymentStatus;
}

export interface CreateAppointmentData {
  clientId: string;
  staffId: string;
  startTime: string;
  services: AppointmentService[];
  notes?: string;
}

export interface AppointmentFilters {
  date?: string;
  startDate?: string;
  endDate?: string;
  staffId?: string;
  clientId?: string;
  status?: AppointmentStatus;
}

export interface AppointmentStats {
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
  totalRevenue: number;
  completionRate: number;
  noShowRate: number;
}

// =============================================
// STAFF TYPES
// =============================================

export enum CommissionType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
  TABLE = 'TABLE',
}

export interface WorkSchedule {
  monday: { start: string; end: string } | null;
  tuesday: { start: string; end: string } | null;
  wednesday: { start: string; end: string } | null;
  thursday: { start: string; end: string } | null;
  friday: { start: string; end: string } | null;
  saturday: { start: string; end: string } | null;
  sunday: { start: string; end: string } | null;
}

export interface Staff {
  id: string;
  userId: string;
  /** false = usuário com cargo sem perfil de staff (cadastro pendente) */
  hasProfile?: boolean;
  role?: { id: string; name: string };
  specialties?: string[];
  commissionType?: CommissionType;
  commissionValue?: number;
  workSchedule?: Record<string, any>;
  blockedDates?: Record<string, any>;
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
  user?: User;
}

export interface CreateStaffData {
  userId: string;
  specialties: string[];
  commissionType: CommissionType;
  commissionValue: number;
  workSchedule?: Record<string, any>;
}

// =============================================
// SERVICE TYPES
// =============================================

export interface Service {
  id: string;
  name: string;
  description?: string;
  category: string;
  durationMinutes: number;
  price: number;
  allowCombo: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  category: string;
  durationMinutes: number;
  price: number;
  allowCombo?: boolean;
}

// =============================================
// PAYMENT TYPES
// =============================================

export enum PaymentMethod {
  CASH = 'CASH',
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  PIX = 'PIX',
  LINK = 'LINK',
  WALLET = 'WALLET',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export interface Payment {
  id: string;
  appointmentId?: string;
  clientId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  gatewayReference?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  appointment?: Appointment;
}

export interface CreatePaymentData {
  appointmentId?: string;
  clientId: string;
  amount: number;
  method: PaymentMethod;
}

// =============================================
// PRODUCT TYPES
// =============================================

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  costPrice: number;
  salePrice: number;
  reorderThreshold: number;
  supplier?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  sku: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  costPrice: number;
  salePrice: number;
  reorderThreshold: number;
  supplier?: string;
}

// =============================================
// EXPENSE TYPES
// =============================================

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  reference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  description: string;
  amount: number;
  category: string;
  date: string;
  reference?: string;
}

// =============================================
// GENERIC TYPES
// =============================================

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  status: 'success';
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// =============================================
// NOTIFICATION TYPES
// =============================================

export interface NotificationItem {
  id: string;
  type: string;
  channel: string;
  message: string;
  status: string;
  readAt: string | null;
  appointmentId?: string | null;
  /** Rota interna para onde o clique na notificação navega. */
  link?: string | null;
  createdAt: string;
}

export interface DashboardStats {
  todayAppointments: number;
  todayRevenue: number;
  monthRevenue: number;
  totalClients: number;
  activeStaff: number;
  pendingPayments: number;
  recentAppointments: Appointment[];
  revenueChart: {
    date: string;
    revenue: number;
  }[];
}

// =============================================
// REPORT TYPES
// =============================================

export interface RevenueByPeriod {
  date: string;
  revenue: number;
  expenses?: number;
  profit?: number;
}

export interface RevenueByMethod {
  method: PaymentMethod;
  amount: number;
  count: number;
  percentage: number;
}

export interface RevenueByService {
  serviceId: string;
  serviceName: string;
  category: string;
  amount: number;
  count: number;
}

export interface FinancialReport {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  revenueByPeriod: RevenueByPeriod[];
  revenueByMethod: RevenueByMethod[];
  revenueByService: RevenueByService[];
  topServices: RevenueByService[];
  pendingPayments: number;
}

export interface AppointmentReport {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  completionRate: number;
  cancellationRate: number;
  noShowRate: number;
  averageDuration: number;
  appointmentsByDay: {
    date: string;
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
  }[];
  appointmentsByStaff: {
    staffId: string;
    staffName: string;
    total: number;
    completed: number;
    revenue: number;
  }[];
  appointmentsByService: {
    serviceId: string;
    serviceName: string;
    count: number;
  }[];
}

export interface ProductReport {
  totalProducts: number;
  lowStockProducts: number;
  totalInventoryValue: number;
  productsByCategory: {
    category: string;
    count: number;
    value: number;
  }[];
  lowStockItems: Product[];
  topSellingProducts?: {
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }[];
}

export interface ClientReport {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  blockedClients: number;
  newClientsThisMonth: number;
  topClients: {
    clientId: string;
    clientName: string;
    totalSpent: number;
    appointmentCount: number;
    loyaltyPoints: number;
  }[];
  clientRetentionRate: number;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  staffId?: string;
  clientId?: string;
  serviceId?: string;
  category?: string;
  status?: string;
}

// =============================================
// WAITLIST TYPES
// =============================================

export enum WaitlistStatus {
  PENDING = 'PENDING',
  CONTACTED = 'CONTACTED',
  SCHEDULED = 'SCHEDULED',
  CANCELLED = 'CANCELLED',
}

export interface WaitlistEntry {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceId: string;
  preferredDate?: string;
  notes?: string;
  status: WaitlistStatus;
  isContacted: boolean;
  contactedAt?: string;
  createdAt: string;
  updatedAt: string;
  service?: Service;
}

export interface CreateWaitlistData {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceId: string;
  preferredDate?: string;
  notes?: string;
}

export interface UpdateWaitlistData {
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  serviceId?: string;
  preferredDate?: string;
  notes?: string;
  status?: WaitlistStatus;
}

export interface WaitlistFilters extends PaginationParams {
  isContacted?: boolean;
  status?: WaitlistStatus;
  serviceId?: string;
  startDate?: string;
  endDate?: string;
}


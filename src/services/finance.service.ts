/**
 * Fachada do frontend para /api/v1/finance — Fase 1 (F1.8).
 * companyId NUNCA é enviado: o backend sempre lê de req.user (F0.2).
 * Envelope padrão: {status, data} | {status, data, pagination} (+ summary).
 */
import api from '@/lib/api';
import type { PaginatedResponse } from '@/types';
import type {
  Acquirer,
  BankAccount,
  BankAccountBalance,
  CardReceivableRow,
  CashMovement,
  CashRegister,
  CashSession,
  FinanceOverview,
  FinanceSettings,
  FinancialCategory,
  OtherIncome,
  Payable,
  ReceivableSummary,
  Supplier,
  UnifiedReceivable,
} from '@/types/finance';

type ListParams = Record<string, string | number | boolean | undefined>;

interface ListResult<T> {
  items: T[];
  pagination: PaginatedResponse<T>['pagination'];
}

async function list<T>(
  path: string,
  params?: ListParams
): Promise<ListResult<T>> {
  const response = await api.get<PaginatedResponse<T>>(path, { params });
  return { items: response.data.data, pagination: response.data.pagination };
}

class FinanceService {
  // -----------------------------------------------------------------------
  // Visão geral (F1.6)
  // -----------------------------------------------------------------------

  async getOverview(params?: { from?: string; to?: string }): Promise<FinanceOverview> {
    const response = await api.get<{ status: 'success'; data: FinanceOverview }>(
      '/finance/overview',
      { params }
    );
    return response.data.data;
  }

  // -----------------------------------------------------------------------
  // Configurações (F1.1)
  // -----------------------------------------------------------------------

  async getSettings(): Promise<FinanceSettings> {
    const response = await api.get<{ status: 'success'; data: FinanceSettings }>(
      '/finance/settings'
    );
    return response.data.data;
  }

  async updateSettings(data: Partial<FinanceSettings>): Promise<FinanceSettings> {
    const response = await api.put<{ status: 'success'; data: FinanceSettings }>(
      '/finance/settings',
      data
    );
    return response.data.data;
  }

  // -----------------------------------------------------------------------
  // Categorias (F1.1)
  // -----------------------------------------------------------------------

  listCategories(params?: ListParams) {
    return list<FinancialCategory>('/finance/categories', params);
  }

  async createCategory(data: Partial<FinancialCategory>): Promise<FinancialCategory> {
    const response = await api.post<{ status: 'success'; data: FinancialCategory }>(
      '/finance/categories',
      data
    );
    return response.data.data;
  }

  async updateCategory(id: string, data: Partial<FinancialCategory>): Promise<FinancialCategory> {
    const response = await api.put<{ status: 'success'; data: FinancialCategory }>(
      `/finance/categories/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/finance/categories/${id}`);
  }

  // -----------------------------------------------------------------------
  // Fornecedores (F1.1)
  // -----------------------------------------------------------------------

  listSuppliers(params?: ListParams) {
    return list<Supplier>('/finance/suppliers', params);
  }

  async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
    const response = await api.post<{ status: 'success'; data: Supplier }>(
      '/finance/suppliers',
      data
    );
    return response.data.data;
  }

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const response = await api.put<{ status: 'success'; data: Supplier }>(
      `/finance/suppliers/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteSupplier(id: string): Promise<void> {
    await api.delete(`/finance/suppliers/${id}`);
  }

  // -----------------------------------------------------------------------
  // Contas bancárias (F1.1)
  // -----------------------------------------------------------------------

  listBankAccounts(params?: ListParams) {
    return list<BankAccount>('/finance/bank-accounts', params);
  }

  async getBankAccountBalance(id: string, asOf?: string): Promise<BankAccountBalance> {
    const response = await api.get<{ status: 'success'; data: BankAccountBalance }>(
      `/finance/bank-accounts/${id}/balance`,
      { params: asOf ? { asOf } : undefined }
    );
    return response.data.data;
  }

  async createBankAccount(
    data: Partial<BankAccount> & { initialBalance: number; initialBalanceDate: string }
  ): Promise<BankAccount> {
    const response = await api.post<{ status: 'success'; data: BankAccount }>(
      '/finance/bank-accounts',
      data
    );
    return response.data.data;
  }

  async updateBankAccount(id: string, data: Partial<BankAccount>): Promise<BankAccount> {
    const response = await api.put<{ status: 'success'; data: BankAccount }>(
      `/finance/bank-accounts/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteBankAccount(id: string): Promise<void> {
    await api.delete(`/finance/bank-accounts/${id}`);
  }

  // -----------------------------------------------------------------------
  // Maquininhas / adquirentes (F1.1)
  // -----------------------------------------------------------------------

  listAcquirers(params?: ListParams) {
    return list<Acquirer>('/finance/acquirers', params);
  }

  async createAcquirer(data: Partial<Acquirer>): Promise<Acquirer> {
    const response = await api.post<{ status: 'success'; data: Acquirer }>(
      '/finance/acquirers',
      data
    );
    return response.data.data;
  }

  async updateAcquirer(id: string, data: Partial<Acquirer>): Promise<Acquirer> {
    const response = await api.put<{ status: 'success'; data: Acquirer }>(
      `/finance/acquirers/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteAcquirer(id: string): Promise<void> {
    await api.delete(`/finance/acquirers/${id}`);
  }

  // -----------------------------------------------------------------------
  // Caixa registrador + sessões (F1.2)
  // -----------------------------------------------------------------------

  listRegisters(params?: ListParams) {
    return list<CashRegister>('/finance/cash/registers', params);
  }

  async createRegister(data: { name: string; isActive?: boolean }): Promise<CashRegister> {
    const response = await api.post<{ status: 'success'; data: CashRegister }>(
      '/finance/cash/registers',
      data
    );
    return response.data.data;
  }

  async updateRegister(
    id: string,
    data: { name?: string; isActive?: boolean }
  ): Promise<CashRegister> {
    const response = await api.put<{ status: 'success'; data: CashRegister }>(
      `/finance/cash/registers/${id}`,
      data
    );
    return response.data.data;
  }

  async openSession(data: { registerId: string; openingBalance: number }): Promise<CashSession> {
    const response = await api.post<{ status: 'success'; data: CashSession }>(
      '/finance/cash/sessions/open',
      data
    );
    return response.data.data;
  }

  /** 404 quando não há sessão aberta no caixa — o tratamento é do chamador. */
  async currentSession(registerId: string): Promise<CashSession> {
    const response = await api.get<{ status: 'success'; data: CashSession }>(
      '/finance/cash/sessions/current',
      { params: { registerId } }
    );
    return response.data.data;
  }

  listSessions(params?: ListParams) {
    return list<CashSession>('/finance/cash/sessions', params);
  }

  async getSession(id: string): Promise<CashSession> {
    const response = await api.get<{ status: 'success'; data: CashSession }>(
      `/finance/cash/sessions/${id}`
    );
    return response.data.data;
  }

  async addMovement(
    sessionId: string,
    data: {
      type: string;
      direction: 'IN' | 'OUT';
      amount: number;
      description?: string;
      categoryId?: string | null;
      bankAccountId?: string | null;
    }
  ): Promise<CashMovement> {
    const response = await api.post<{ status: 'success'; data: CashMovement }>(
      `/finance/cash/sessions/${sessionId}/movements`,
      data
    );
    return response.data.data;
  }

  async voidMovement(sessionId: string, movementId: string, reason: string): Promise<void> {
    await api.post(`/finance/cash/sessions/${sessionId}/movements/${movementId}/void`, {
      reason,
    });
  }

  async closeSession(
    sessionId: string,
    data: { countedCash: number; closingNotes?: string }
  ): Promise<CashSession> {
    const response = await api.post<{ status: 'success'; data: CashSession }>(
      `/finance/cash/sessions/${sessionId}/close`,
      data
    );
    return response.data.data;
  }

  async reopenSession(sessionId: string, reason: string): Promise<CashSession> {
    const response = await api.post<{ status: 'success'; data: CashSession }>(
      `/finance/cash/sessions/${sessionId}/reopen`,
      { reason }
    );
    return response.data.data;
  }

  // -----------------------------------------------------------------------
  // A pagar (F1.4)
  // -----------------------------------------------------------------------

  listPayables(params?: ListParams) {
    return list<Payable>('/finance/payables', params);
  }

  async getPayable(id: string): Promise<Payable> {
    const response = await api.get<{ status: 'success'; data: Payable }>(
      `/finance/payables/${id}`
    );
    return response.data.data;
  }

  /** POST devolve a lista criada (1 item ou N parcelas). */
  async createPayable(data: Record<string, unknown>): Promise<Payable[]> {
    const response = await api.post<{ status: 'success'; data: Payable[] }>(
      '/finance/payables',
      data
    );
    return response.data.data;
  }

  async updatePayable(id: string, data: Record<string, unknown>): Promise<Payable> {
    const response = await api.put<{ status: 'success'; data: Payable }>(
      `/finance/payables/${id}`,
      data
    );
    return response.data.data;
  }

  async payPayable(
    id: string,
    data: {
      paidAt: string;
      paidAmount?: number;
      paymentMethod: string;
      bankAccountId?: string;
    }
  ): Promise<Payable> {
    const response = await api.post<{ status: 'success'; data: Payable }>(
      `/finance/payables/${id}/pay`,
      data
    );
    return response.data.data;
  }

  async cancelPayable(id: string): Promise<Payable> {
    const response = await api.post<{ status: 'success'; data: Payable }>(
      `/finance/payables/${id}/cancel`
    );
    return response.data.data;
  }

  async deletePayable(id: string): Promise<void> {
    await api.delete(`/finance/payables/${id}`);
  }

  // -----------------------------------------------------------------------
  // A receber (F1.5)
  // -----------------------------------------------------------------------

  async listReceivables(
    params?: ListParams
  ): Promise<ListResult<UnifiedReceivable> & { summary: ReceivableSummary }> {
    const response = await api.get<
      PaginatedResponse<UnifiedReceivable> & { summary: ReceivableSummary }
    >('/finance/receivables', { params });
    return {
      items: response.data.data,
      pagination: response.data.pagination,
      summary: response.data.summary,
    };
  }

  listCardReceivables(params?: ListParams) {
    return list<CardReceivableRow>('/finance/card-receivables', params);
  }

  // -----------------------------------------------------------------------
  // Receitas avulsas (F1.5)
  // -----------------------------------------------------------------------

  listOtherIncomes(params?: ListParams) {
    return list<OtherIncome>('/finance/other-incomes', params);
  }

  async createOtherIncome(data: Record<string, unknown>): Promise<OtherIncome> {
    const response = await api.post<{ status: 'success'; data: OtherIncome }>(
      '/finance/other-incomes',
      data
    );
    return response.data.data;
  }

  async updateOtherIncome(id: string, data: Record<string, unknown>): Promise<OtherIncome> {
    const response = await api.put<{ status: 'success'; data: OtherIncome }>(
      `/finance/other-incomes/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteOtherIncome(id: string): Promise<void> {
    await api.delete(`/finance/other-incomes/${id}`);
  }
}

export const financeService = new FinanceService();

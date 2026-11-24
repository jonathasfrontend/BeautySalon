/** Extrai mensagem legível de um erro axios/AppError sem vazar detalhes internos. */
export function errorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  const direct = (error as { message?: string })?.message;
  return response?.data?.message || direct || fallback;
}

/** true quando a falha é 404 (ex.: nenhuma sessão de caixa aberta). */
export function isNotFound(error: unknown): boolean {
  return (error as { response?: { status?: number } })?.response?.status === 404;
}

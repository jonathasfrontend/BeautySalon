export interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set a cookie - Otimizado
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof window === 'undefined') return;

  const {
    path = '/',
    domain,
    maxAge,
    expires,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'strict',
  } = options;

  const parts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `path=${path}`,
    sameSite && `samesite=${sameSite}`,
    secure && 'secure',
    maxAge && `max-age=${maxAge}`,
    expires && `expires=${expires.toUTCString()}`,
    domain && `domain=${domain}`,
  ];

  document.cookie = parts.filter(Boolean).join('; ');
}

/**
 * Get a cookie value - Otimizado
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const cookie = cookies.find(c => c.trim().startsWith(`${encodeURIComponent(name)}=`));
  
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
}

/**
 * Delete a cookie - Otimizado
 */
export function deleteCookie(name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): void {
  setCookie(name, '', { ...options, maxAge: 0 });
}
